// netlify/functions/notify-masterclass-update.ts
import { Handler } from "@netlify/functions";
import { adminDb } from "../../src/lib/firebaseAdmin";
import { sendEmail } from "../../src/utils/gmailHelper";
import { Masterclass } from "../../src/types/masterclass";

/**
 * This function is triggered from the admin panel to notify
 * all enrolled users about an update to a masterclass.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { masterclassId } = JSON.parse(event.body || "{}");

    if (!masterclassId) {
      return { statusCode: 400, body: "Invalid payload: 'masterclassId' is required." };
    }

    console.log(`🔵 [${new Date().toISOString()}] Received update notification request for masterclass: ${masterclassId}`);

    // 1. Fetch the masterclass document
    const masterclassRef = adminDb.collection("MasterClasses").doc(masterclassId);
    const masterclassSnap = await masterclassRef.get();

    if (!masterclassSnap.exists) {
      console.error(`❌ Masterclass with ID ${masterclassId} not found.`);
      return { statusCode: 404, body: "Masterclass not found." };
    }

    const masterclass = masterclassSnap.data() as Masterclass;
    masterclass.id = masterclassSnap.id;

    // 2. Get the list of enrolled users
    const purchasedUsers = masterclass.purchased_by_users || [];
    if (purchasedUsers.length === 0) {
      console.log(`ℹ️ No users enrolled in "${masterclass.title}". No notifications sent.`);
      return { statusCode: 200, body: "No users are enrolled in this masterclass." };
    }

    console.log(`👥 Found ${purchasedUsers.length} enrolled users for "${masterclass.title}". Fetching emails...`);

    // 3. Fetch user profiles to get their email addresses
    const userDocs = await Promise.all(
      purchasedUsers.map(uid => adminDb.collection("user_profiles").doc(uid).get())
    );

    const recipients = userDocs
      .map(doc => doc.data())
      .filter(ud => ud && ud.email) as { name?: string, email: string }[];

    if (recipients.length === 0) {
      console.log(`ℹ️ No valid email recipients found for masterclass "${masterclass.title}".`);
      return { statusCode: 200, body: "No recipients with valid emails found." };
    }

    console.log(`📧 Sending notifications to ${recipients.length} users.`);

    // 4. Send an email to each enrolled user
    for (const recipient of recipients) {
      const html = generateUpdateEmail(recipient.name || "there", masterclass);
      const subject = `📢 An Update on Your Masterclass: ${masterclass.title}`;
      const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
      
      await sendEmail(recipient.email, encodedSubject, html);
      
      // Add a small delay to avoid hitting email rate limits
      await new Promise(r => setTimeout(r, 700));
    }

    console.log(`✅ [${new Date().toISOString()}] Successfully sent ${recipients.length} update notifications for "${masterclass.title}".`);
    return {
      statusCode: 200,
      body: `Successfully sent ${recipients.length} update notifications.`,
    };

  } catch (err: any) {
    console.error("❌ Error in notify-masterclass-update function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

function generateUpdateEmail(userName: string, masterclass: Masterclass): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7fafc;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(to right, #0ea5e9, #f97316); color: #fff; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">📢 Heads up! "${masterclass.title}" has been updated.</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">Just letting you know that we've made some updates to a masterclass you're enrolled in. New content or changes may have been added.</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">Visit the masterclass page to see what's new:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.SITE_URL}/masterclasses/${masterclass.id}" target="_blank" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #0ea5e9, #f97316); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Masterclass
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