// netlify/functions/payment-verify.ts
import { Handler } from "@netlify/functions";
import crypto from "crypto";
import { adminDb } from "../../src/lib/firebaseAdmin";
import admin from "firebase-admin";
import { sendEmail } from "../../src/utils/gmailHelper";
import { Masterclass, MasterclassContent } from "../../src/types/masterclass";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

// Helper: ensure required envs exist
function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

/**
 * Generates a PDF receipt and returns it as a base64 encoded string.
 */
async function generatePdfReceiptBase64(
  orderId: string,
  paymentId: string,
  userName: string,
  userEmail: string,
  masterclassTitle: string,
  amount: number,
  timestamp: string
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Theme Colors (Orange & Blue)
  const blueColor = rgb(0.05, 0.65, 0.91); // Sky blue-ish
  const orangeColor = rgb(0.98, 0.45, 0.09); // Orange
  const darkGray = rgb(0.2, 0.2, 0.2);
  const white = rgb(1, 1, 1);
  const lightGray = rgb(0.9, 0.9, 0.9);

  // --- Watermark (Govt Style) ---
  const watermarkText = "RAGA VACHIKA";
  page.drawText(watermarkText, {
    x: width / 2 - 200,
    y: height / 2,
    size: 60,
    font: boldFont,
    color: lightGray,
    rotate: degrees(45),
    opacity: 0.3,
  });

  // --- Border ---
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: blueColor,
    borderWidth: 2,
  });

  // --- Header ---
  page.drawRectangle({
    x: 20,
    y: height - 120,
    width: width - 40,
    height: 100,
    color: blueColor,
  });

  page.drawText("PAYMENT RECEIPT", {
    x: 40,
    y: height - 70,
    size: 26,
    font: boldFont,
    color: white,
  });

  page.drawText("Raga Vachika", {
    x: width - 200,
    y: height - 60,
    size: 20,
    font: boldFont,
    color: white,
  });
  
  page.drawText("Official Document", {
    x: width - 200,
    y: height - 80,
    size: 10,
    font,
    color: white,
  });

  // --- Details Section ---
  let yPos = height - 160;
  const leftColX = 50;
  const rightColX = 300;

  // Billed To
  page.drawText("Billed To:", { x: leftColX, y: yPos, size: 14, font: boldFont, color: orangeColor });
  yPos -= 20;
  page.drawText(userName, { x: leftColX, y: yPos, size: 12, font: boldFont, color: darkGray });
  yPos -= 15;
  page.drawText(userEmail, { x: leftColX, y: yPos, size: 10, font, color: darkGray });

  // Transaction Info (Right side)
  let rightYPos = height - 160;
  const drawInfoRow = (label: string, value: string) => {
    page.drawText(label, { x: rightColX, y: rightYPos, size: 10, font: boldFont, color: darkGray });
    page.drawText(value, { x: rightColX + 80, y: rightYPos, size: 10, font, color: darkGray });
    rightYPos -= 15;
  };

  drawInfoRow("Order ID:", orderId);
  drawInfoRow("Payment ID:", paymentId);
  drawInfoRow("Date:", new Date(timestamp).toLocaleDateString('en-US', { dateStyle: 'medium' }));

  yPos = Math.min(yPos, rightYPos) - 40;

  // --- Item Table ---
  // Header
  page.drawRectangle({
    x: 40,
    y: yPos,
    width: width - 80,
    height: 30,
    color: orangeColor,
  });

  page.drawText("Description", { x: 50, y: yPos + 10, size: 12, font: boldFont, color: white });
  page.drawText("Amount", { x: width - 150, y: yPos + 10, size: 12, font: boldFont, color: white });

  yPos -= 30;

  // Row
  page.drawText(masterclassTitle, { x: 50, y: yPos - 15, size: 12, font, color: darkGray });
  page.drawText(`INR ${amount.toFixed(2)}`, { x: width - 150, y: yPos - 15, size: 12, font: boldFont, color: darkGray });

  // Line
  yPos -= 30;
  page.drawLine({
    start: { x: 40, y: yPos },
    end: { x: width - 40, y: yPos },
    thickness: 1,
    color: lightGray,
  });

  // Total
  yPos -= 30;
  const totalLabel = "Total Paid:";
  const totalValue = `INR ${amount.toFixed(2)}`;
  
  page.drawText(totalLabel, { x: width - 250, y: yPos, size: 14, font: boldFont, color: blueColor });
  page.drawText(totalValue, { x: width - 150, y: yPos, size: 14, font: boldFont, color: orangeColor });

  // --- Footer ---
  const footerY = 50;
  page.drawLine({
    start: { x: 40, y: footerY + 20 },
    end: { x: width - 40, y: footerY + 20 },
    thickness: 1,
    color: blueColor,
  });

  page.drawText("Thank you for choosing Ragavachika.", {
    x: width / 2 - 90,
    y: footerY,
    size: 10,
    font,
    color: darkGray,
  });
  
  page.drawText("This is a computer-generated receipt and does not require a physical signature.", {
    x: width / 2 - 160,
    y: footerY - 15,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.saveAsBase64();
}

/**
 * Emails the generated PDF receipt as an attachment.
 */
async function emailPdfReceipt(
  email: string,
  userName: string,
  orderId: string,
  paymentId: string,
  masterclassTitle: string,
  amount: number,
  pdfBase64: string
) {
  try {
    console.log(`[EMAIL-PDF] Sending receipt for order ${orderId} to ${email}`);
    const subject = `Your Ragavachika Receipt for ${masterclassTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7fafc;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(to right, #0ea5e9, #f97316); color: #fff; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Thank You for Your Purchase!</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.5;">
              Your payment was successful. Your receipt is attached to this email.
            </p>
            <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 5px 0 0;"><strong>Amount Paid:</strong> INR ${amount.toFixed(2)}</p>
            </div>
            <p style="font-size: 16px; color: #374151; line-height: 1.5;">You can access your masterclass content at any time by logging into your Ragavachika account.</p>
          </div>
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb;"><p>&copy; ${new Date().getFullYear()} Ragavachika. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;
    const attachments = [{
      filename: `receipt-${orderId}.pdf`,
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf',
    }];
    await sendEmail(email, subject, html, attachments);
    console.log(`[EMAIL-PDF] ✅ Receipt sent successfully.`);
  } catch (err) {
    console.error(`[EMAIL-PDF] ❌ Failed to email receipt for order ${orderId}:`, err);
  }
}

/**
 * Triggers purchase confirmation email (fire-and-forget)
 */
async function triggerPurchaseConfirmationEmail(
  email: string, 
  userName: string, 
  masterclass: any, 
  userId: string
) {
  const baseUrl = process.env.URL || process.env.DEPLOY_URL || "https://your-site.netlify.app";
  const functionUrl = `${baseUrl}/.netlify/functions/send-purchase-confirmation`;
  
  try {
    console.log(`[EMAIL] Triggering purchase confirmation for ${email}`);
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, masterclass, userId }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`[EMAIL] ❌ HTTP ${response.status}: ${responseBody}`);
    } else {
      console.log("[EMAIL] ✅ Confirmation email triggered");
    }
  } catch (err) {
    console.error("[EMAIL] ❌ Failed to trigger confirmation email:", err);
  }
}

/**
 * Sends immediate reminder for sessions starting within 12 hours
 */
async function sendImmediateReminder(
  email: string, 
  userName: string, 
  masterclass: Masterclass, 
  contentItem: MasterclassContent
) {
  try {
    console.log(`[REMINDER] Sending immediate reminder for "${contentItem.title}"`);
    const scheduledDate = new Date(contentItem.scheduled_date!);
    const siteUrl = process.env.SITE_URL || process.env.URL || "https://your-site.netlify.app";
    
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7fafc;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(to right, #0ea5e9, #f97316); color: #fff; padding: 30px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">🚨 Reminder: Your Live Session is Starting Soon!</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.5;">Thank you for your purchase! This is an immediate reminder that your live session, "<b>${contentItem.title}</b>", is scheduled to begin soon.</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.5;"><b>Scheduled Time:</b> ${scheduledDate.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.5;">You can access the session details and join link directly from the masterclass page:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${siteUrl}/masterclasses/${masterclass.id}" target="_blank" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #0ea5e9, #f97316); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Go to Masterclass
              </a>
            </div>
            <p style="margin-top: 20px; font-size: 0.9em; color: #777;">We're excited to see you there!</p>
          </div>
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb;"><p>&copy; ${new Date().getFullYear()} Ragavachika. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(email, `🚨 Reminder: "${contentItem.title}" starts soon!`, html);
    console.log("[REMINDER] ✅ Immediate reminder sent");
  } catch (err) {
    console.error(`[REMINDER] ❌ Failed to send reminder:`, err);
  }
}

/**
 * Main serverless handler
 */
export const handler: Handler = async (event, context) => {
  console.log("🔵 [PAYMENT-VERIFY] Function invoked");
  
  try {
    if (event.httpMethod !== "POST") {
      console.warn("⚠️ [PAYMENT-VERIFY] Invalid method:", event.httpMethod);
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    let body: any;
    try {
      body = JSON.parse(event.body || "{}");
      console.log("✅ [PAYMENT-VERIFY] JSON parsed successfully. Keys:", Object.keys(body));
    } catch (parseError) {
      console.error("❌ [PAYMENT-VERIFY] Invalid JSON:", event.body);
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Invalid JSON" }) };
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      masterclassId,
      userId,
      masterclassTitle,
      amount = 0,
      method = "razorpay",
      type = "purchase",
      userEmail: providedEmail,
    } = body;

    console.log(`🔍 [PAYMENT-VERIFY] Details: User=${userId}, Masterclass=${masterclassId}, Order=${razorpay_order_id}, Amount=${amount}`);

    if (!userId) {
      console.error("❌ [PAYMENT-VERIFY] Missing userId");
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Missing userId" }) };
    }

    const userRef = adminDb.doc(`user_profiles/${userId}`);
    const masterRef = masterclassId ? adminDb.doc(`MasterClasses/${masterclassId}`) : null;

    // ✅ FIX: Declare twelveHoursFromNow variable
    const now = new Date();
    const twelveHoursFromNow = now.getTime() + (12 * 60 * 60 * 1000);

    /* -------------------------
       DUMMY PAYMENT HANDLING
       ------------------------- */
    if (typeof razorpay_order_id === "string" && razorpay_order_id.startsWith("dummy_")) {
      console.log("[DUMMY] 🟢 Processing dummy payment flow");

      console.log("[DUMMY] Fetching user profile...");
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() : null;
      const userEmail = providedEmail || userData?.email;
      const userName = userData?.name || userData?.displayName || "";

      console.log(`[DUMMY] User found: ${userSnap.exists}, Email: ${userEmail || "MISSING"}`);

      // Record transaction
      console.log("[DUMMY] Executing Firestore transaction...");
      await adminDb.runTransaction(async (tx) => {
        console.log("[DUMMY] Transaction: Reading user doc...");
        const docSnap = await tx.get(userRef);
        const timestamp = new Date().toISOString();

        let resolvedTitle = masterclassTitle ?? "Dummy Masterclass";
        if (!masterclassTitle && masterRef) {
          const mcSnap = await masterRef.get();
          if (mcSnap.exists) {
            resolvedTitle = mcSnap.data()?.title ?? resolvedTitle;
          }
        }

        const txObj = {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id ?? `dummy_${Date.now()}`,
          masterclassId: masterclassId ?? null,
          masterclassTitle: resolvedTitle,
          amount: amount ?? 0,
          status: "success",
          type,
          method,
          timestamp,
          updatedAt: timestamp,
        };

        if (docSnap.exists) {
          const data = docSnap.data() || {};
          const existing = Array.isArray(data.transactions) ? data.transactions : [];
          const already = existing.some((t: any) => t.orderId === razorpay_order_id);
          
          if (!already) {
            tx.update(userRef, {
              transactions: admin.firestore.FieldValue.arrayUnion(txObj),
            });
          }
        } else {
          tx.set(userRef, {
            id: userId,
            transactions: [txObj],
            created_at: timestamp,
          });
        }
        console.log("[DUMMY] Transaction: User record updated.");
      });
      console.log("[DUMMY] Firestore transaction committed.");

      // Grant access
      if (masterclassId && masterRef) {
        console.log("[DUMMY] Granting access to masterclass...");
        const mcSnap = await masterRef.get();
        if (mcSnap.exists) {
          await masterRef.update({
            purchased_by_users: admin.firestore.FieldValue.arrayUnion(userId),
          });
          console.log("[DUMMY] Access granted.");
        } else {
          console.warn("[DUMMY] Masterclass doc not found during access grant.");
        }
      }

      // ✅ Generate PDF as base64
      let pdfBase64: string | null = null;
      if (userEmail) {
        console.log("[DUMMY] 📄 Generating receipt PDF...");
        try {
          pdfBase64 = await generatePdfReceiptBase64(
            razorpay_order_id,
            razorpay_payment_id ?? `dummy_${Date.now()}`,
            userName || userEmail,
            userEmail,
            masterclassTitle ?? "Dummy Masterclass",
            amount,
            new Date().toISOString()
          );
          
          if (pdfBase64) {
            console.log("[DUMMY] ✅ PDF generated successfully. Sending email...");
            
            // ✅ Email the PDF as attachment
            await emailPdfReceipt(
              userEmail,
              userName || userEmail,
              razorpay_order_id,
              razorpay_payment_id ?? `dummy_${Date.now()}`,
              masterclassTitle ?? "Dummy Masterclass",
              amount,
              pdfBase64
            );
            console.log("[DUMMY] ✉️ Receipt email sent.");
          }
        } catch (pdfError) {
          console.error("[DUMMY] ❌ PDF generation/email failed:", pdfError);
        }
      } else {
        console.warn("[DUMMY] ⚠️ Skipping email/PDF because userEmail is missing");
      }

      // Send emails
      if (userEmail) {
        console.log("[DUMMY] 📧 Triggering confirmation email...");
        let mcData = null;
        if (masterclassId && masterRef) {
          const doc = await masterRef.get();
          if (doc.exists) mcData = { id: doc.id, ...doc.data() };
        }

        await triggerPurchaseConfirmationEmail(userEmail, userName, mcData, userId);
        console.log("[DUMMY] 📧 Confirmation email triggered.");

        // Send immediate reminders
        console.log("[DUMMY] ⏰ Checking for immediate reminders...");
        const typedMcData = mcData as Masterclass;
        if (typedMcData?.content) {
          for (const contentItem of typedMcData.content) {
            if (contentItem.source === 'zoom' && contentItem.scheduled_date) {
              const scheduledTime = new Date(contentItem.scheduled_date).getTime();
              if (scheduledTime > now.getTime() && scheduledTime < twelveHoursFromNow) {
                console.log(`[DUMMY] 🔔 Sending immediate reminder for ${contentItem.title}`);
                await sendImmediateReminder(userEmail, userName, typedMcData, contentItem);
              }
            }
          }
        }
      }

      console.log("[DUMMY] ✅ Payment flow completed successfully");
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: "Dummy payment completed",
          // ✅ Return PDF as base64 - client can download it
          receiptPdf: pdfBase64,
          receiptFilename: `receipt-${razorpay_order_id}.pdf`
        }),
      };
    }

    /* -------------------------
       RAZORPAY PAYMENT HANDLING
       ------------------------- */
    console.log("[RAZORPAY] 🟢 Processing real payment flow");

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("[RAZORPAY] ❌ Missing payment details");
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Missing payment details" }) };
    }
    if (!masterclassId) {
      console.error("[RAZORPAY] ❌ Missing masterclassId");
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Missing masterclassId" }) };
    }

    // Verify signature
    const secret = requireEnv("RAZORPAY_KEY_SECRET");
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(signaturePayload)
      .digest("hex");

    console.log("[RAZORPAY] Verifying signature...");
    if (generatedSignature !== razorpay_signature) {
      console.error("[RAZORPAY] ❌ Invalid signature");

      // Record failed transaction
      await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        const timestamp = new Date().toISOString();
        
        const failObj = {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          masterclassId,
          amount: amount ?? 0,
          status: "failed",
          method,
          type,
          failureReason: "Invalid payment signature",
          timestamp,
          updatedAt: timestamp,
        };

        if (snap.exists) {
          tx.update(userRef, {
            transactions: admin.firestore.FieldValue.arrayUnion(failObj),
          });
        } else {
          tx.set(userRef, {
            id: userId,
            transactions: [failObj],
            created_at: timestamp,
          });
        }
      });

      return { 
        statusCode: 400, 
        body: JSON.stringify({ success: false, error: "Invalid Razorpay signature" }) 
      };
    }

    console.log("[RAZORPAY] ✅ Signature verified");

    // Fetch user and masterclass
    console.log("[RAZORPAY] Fetching User and Masterclass data...");
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      console.error("[RAZORPAY] ❌ User not found");
      return { statusCode: 404, body: JSON.stringify({ success: false, error: "User not found" }) };
    }

    const userData = userSnap.data();
    const userEmail = providedEmail || userData?.email;
    const userName = userData?.name || userData?.displayName || "";

    console.log(`[RAZORPAY] User: ${userId}, Email: ${userEmail || "MISSING"}`);

    if (!masterRef) {
      console.error("[RAZORPAY] ❌ Missing masterclassRef");
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Missing masterclassRef" }) };
    }

    const mcSnap = await masterRef.get();
    if (!mcSnap.exists) {
      console.error("[RAZORPAY] ❌ Masterclass not found");
      return { statusCode: 404, body: JSON.stringify({ success: false, error: "Masterclass not found" }) };
    }

    const mcData = mcSnap.data();

    // Grant access & record transaction
    console.log("[RAZORPAY] Executing Firestore transaction (Record + Grant Access)...");
    await adminDb.runTransaction(async (tx) => {
      const timestamp = new Date().toISOString();
      
      const successObj = {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        masterclassId,
        masterclassTitle: masterclassTitle ?? mcData?.title ?? null,
        amount: amount ?? 0,
        status: "success",
        method,
        type,
        timestamp,
        updatedAt: timestamp,
      };

      const uSnap = await tx.get(userRef);
      if (uSnap.exists) {
        tx.update(userRef, {
          transactions: admin.firestore.FieldValue.arrayUnion(successObj),
        });
      } else {
        tx.set(userRef, {
          id: userId,
          transactions: [successObj],
          created_at: timestamp,
        });
      }

      // Grant access
      tx.update(masterRef, {
        purchased_by_users: admin.firestore.FieldValue.arrayUnion(userId),
      });
    });
    console.log("[RAZORPAY] Firestore transaction committed.");

    // ✅ Generate PDF as base64
    let pdfBase64: string | null = null;
    if (userEmail) {
      console.log("[RAZORPAY] 📄 Generating receipt PDF...");
      try {
        pdfBase64 = await generatePdfReceiptBase64(
          razorpay_order_id,
          razorpay_payment_id,
          userName || userEmail,
          userEmail,
          masterclassTitle ?? mcData?.title ?? "Masterclass Purchase",
          amount,
          new Date().toISOString()
        );
        
        if (pdfBase64) {
          console.log("[RAZORPAY] ✅ PDF generated successfully. Sending email...");
          
          // ✅ Email the PDF as attachment
          await emailPdfReceipt(
            userEmail,
            userName || userEmail,
            razorpay_order_id,
            razorpay_payment_id,
            masterclassTitle ?? mcData?.title ?? "Masterclass Purchase",
            amount,
            pdfBase64
          );
          console.log("[RAZORPAY] ✉️ Receipt email sent.");
        }
      } catch (pdfError) {
        console.error("[RAZORPAY] ❌ PDF generation/email failed:", pdfError);
      }
    } else {
      console.warn("[RAZORPAY] ⚠️ Skipping email/PDF because userEmail is missing");
    }

    // Send emails
    if (userEmail) {
      console.log("[RAZORPAY] 📧 Triggering confirmation email...");
      const doc = await masterRef.get();
      const mcDataWithId = doc.exists ? { id: doc.id, ...doc.data() } : mcData;

      await triggerPurchaseConfirmationEmail(userEmail, userName, mcDataWithId, userId);
      console.log("[RAZORPAY] 📧 Confirmation email triggered.");

      // Send immediate reminders
      console.log("[RAZORPAY] ⏰ Checking for immediate reminders...");
      const typedMcDataWithId = mcDataWithId as Masterclass;
      if (typedMcDataWithId?.content) {
        for (const contentItem of typedMcDataWithId.content) {
          if (contentItem.source === 'zoom' && contentItem.scheduled_date) {
            const scheduledTime = new Date(contentItem.scheduled_date).getTime();
            if (scheduledTime > now.getTime() && scheduledTime < twelveHoursFromNow) {
              console.log(`[RAZORPAY] 🔔 Sending immediate reminder for ${contentItem.title}`);
              await sendImmediateReminder(userEmail, userName, typedMcDataWithId, contentItem);
            }
          }
        }
      }
    }

    console.log("[RAZORPAY] ✅ Payment flow completed successfully");
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Payment verified successfully",
        // ✅ Return PDF as base64 - client can download it
        receiptPdf: pdfBase64,
        receiptFilename: `receipt-${razorpay_order_id}.pdf`
      }),
    };
    
  } catch (err: any) {
    console.error("❌ [PAYMENT-VERIFY] FATAL Error:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ success: false, error: err?.message || String(err) }) 
    };
  }
};