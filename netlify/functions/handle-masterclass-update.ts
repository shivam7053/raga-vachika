// netlify/functions/handle-masterclass-update.ts
import { Handler } from "@netlify/functions";
import { adminDb } from "../../src/lib/firebaseAdmin";
import { sendEmail } from "../../src/utils/gmailHelper";
import { Masterclass, MasterclassContent } from "../../src/types/masterclass";

/**
 * This function is designed to be triggered by a Firestore 'onUpdate' event.
 * It expects a payload containing the 'before' and 'after' state of a Masterclass document.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { before, after } = JSON.parse(event.body || "{}") as { before: Masterclass, after: Masterclass };

    if (!before || !after) {
      return { statusCode: 400, body: "Invalid payload: 'before' and 'after' states are required." };
    }

    const beforeContentIds = new Set(before.content?.map(c => c.id) || []);
    const afterContent = after.content || [];

    // Find content items that are in 'after' but not in 'before'
    const newContent = afterContent.filter(c => !beforeContentIds.has(c.id));

    if (newContent.length === 0) {
      return { statusCode: 200, body: "No new content detected. No action taken." };
    }

    console.log(`✨ New content detected for "${after.title}":`, newContent.map(c => c.title));

    const purchasedUsers = after.purchased_by_users || [];
    if (purchasedUsers.length === 0) {
      return { statusCode: 200, body: "New content added, but no users are enrolled." };
    }

    // Fetch user emails
    const userDocs = await Promise.all(
      purchasedUsers.map(uid => adminDb.collection("user_profiles").doc(uid).get())
    );

    const recipients = userDocs
      .map(doc => doc.data())
      .filter(ud => ud && ud.email) as { name?: string, email: string }[];

    if (recipients.length === 0) {
      return { statusCode: 200, body: "No valid recipients found for notification." };
    }

    // Send email to all recipients
    for (const recipient of recipients) {
      const html = generateUpdateEmail(recipient.name || "there", after, newContent);
      const subject = `🚀 New Content Added to ${after.title}!`;
      const encodedSubject = encodeSubject(subject);
      await sendEmail(recipient.email, encodedSubject, html);
      await new Promise(r => setTimeout(r, 700)); // Rate limit
    }

    return {
      statusCode: 200,
      body: `Successfully sent ${recipients.length} update notifications.`,
    };

  } catch (err: any) {
    console.error("❌ Error in handle-masterclass-update:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

function encodeSubject(subject: string) {
  const encoded = Buffer.from(subject).toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

function generateUpdateEmail(userName: string, masterclass: Masterclass, newContent: MasterclassContent[]): string {
  const newContentHtml = newContent.map(item => `
    <div style="padding: 10px; border-left: 3px solid #0ea5e9; margin-bottom: 10px; background-color: #f3f4f6;">
      <p style="margin:0; font-weight: bold; color: #333;">${item.title}</p>
      <p style="margin:5px 0 0; font-size: 0.9em; color: #555;">
        Type: ${item.source === 'zoom' ? 'Live Zoom Session' : 'YouTube Video'}
      </p>
      ${item.scheduled_date ? `<p style="margin:5px 0 0; font-size: 0.9em; color: #555;">Scheduled: ${new Date(item.scheduled_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7fafc;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(to right, #0ea5e9, #f97316); color: #fff; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🚀 Content Update for "${masterclass.title}"!</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">Great news! We've just added new content to a masterclass you're enrolled in. Here's what's new:</p>
          ${newContentHtml}
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">You can access this new content right now by visiting the masterclass page:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.SITE_URL}/masterclasses/${masterclass.id}" target="_blank" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #0ea5e9, #f97316); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Updated Masterclass
            </a>
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">Happy learning!</p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb;"><p>&copy; ${new Date().getFullYear()} Ragavachika. All rights reserved.</p></div>
      </div>
    </body>
    </html>
  `;
}