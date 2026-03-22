// import nodemailer from "nodemailer";
import { Resend } from "resend";
import { IOrderEmailPayload, IWelcomeEmailPayload } from "../types/emailType";

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

const BRAND_NAME = "Lyon Pitchwear";
const BRAND_TAGLINE = "ELITE PERFORMANCE GEAR";
const CURRENT_YEAR = new Date().getFullYear();
const resend = new Resend(process.env.SMTP_PASS);
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: Number(process.env.SMTP_PORT) || 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

export const verifyEmailConnection = async (): Promise<void> => {
  try {
    if (!process.env.SMTP_PASS) throw new Error("SMTP_PASS not set");
    console.log("📧 Email server connected");
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
  }
};
/* -------------------------------------------------------------------------- */
/*                               BASE SEND EMAIL                              */
/* -------------------------------------------------------------------------- */

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  await resend.emails.send({
    from: "Lyon Pitchwear <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};

/* -------------------------------------------------------------------------- */
/*                               HTML TEMPLATES                               */
/* -------------------------------------------------------------------------- */

const emailHeader = `
  <div style="background:#0a0a0a;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;letter-spacing:4px;">${BRAND_NAME.toUpperCase()}</h1>
    <p style="color:#888;margin:4px 0 0;">${BRAND_TAGLINE}</p>
  </div>
`;

const emailFooter = `
  <div style="background:#f5f5f5;padding:16px;text-align:center;color:#888;font-size:12px;">
    © ${CURRENT_YEAR} ${BRAND_NAME}. All rights reserved.
  </div>
`;

const emailWrapper = (content: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    ${emailHeader}
    <div style="padding:32px 24px;">
      ${content}
    </div>
    ${emailFooter}
  </div>
`;

/* -------------------------------------------------------------------------- */
/*                        ORDER CONFIRMATION EMAIL                             */
/* -------------------------------------------------------------------------- */

export const sendOrderConfirmationEmail = async (
  payload: IOrderEmailPayload,
): Promise<void> => {
  const { customerName, customerEmail, orderId, items, total } = payload;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">₦${item.price.toLocaleString()}</td>
      </tr>`,
    )
    .join("");

  const content = `
    <h2 style="color:#0a0a0a;">Order Confirmed ✅</h2>
    <p>Hi ${customerName}, your order <strong>#${orderId}</strong> has been confirmed.</p>

    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;">Item</th>
          <th style="padding:10px;text-align:left;">Qty</th>
          <th style="padding:10px;text-align:left;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <p style="font-size:18px;font-weight:bold;">
      Total: ₦${total.toLocaleString()}
    </p>

    <p style="color:#555;">
      We'll notify you once your order ships. Thank you for choosing Lyon Pitchwear.
    </p>
  `;

  const html = emailWrapper(content);

  await sendEmail(customerEmail, `Order Confirmed — #${orderId}`, html);
};

/* -------------------------------------------------------------------------- */
/*                                WELCOME EMAIL                               */
/* -------------------------------------------------------------------------- */

export const sendWelcomeEmail = async (
  payload: IWelcomeEmailPayload,
): Promise<void> => {
  const { name, email } = payload;

  const content = `
    <h2>Welcome to the squad, ${name}! 🏆</h2>

    <p>You've just joined an elite community of athletes and performers.</p>

    <p>Explore our catalog:</p>

    <ul>
      <li><strong>Up & Down Kits</strong> — Premium match-day kits</li>
      <li><strong>Gym Gear</strong> — High-performance training wear</li>
      <li><strong>Training Equipment</strong> — Cones, nets, bibs, boots & canvas</li>
    </ul>

    <a href="${process.env.CLIENT_URL}"
      style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 28px;
      text-decoration:none;margin-top:16px;letter-spacing:2px;font-weight:bold;">
      SHOP NOW
    </a>
  `;

  const html = emailWrapper(content);

  await sendEmail(email, "Welcome to Lyon Pitchwear 🏆", html);
};

/* -------------------------------------------------------------------------- */
/*                           EMAIL VERIFICATION                               */
/* -------------------------------------------------------------------------- */

export const sendVerificationEmail = async (
  name: string,
  email: string,
  token: string,
): Promise<void> => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const content = `
    <h2>Verify your email, ${name} 👋</h2>

    <p>Thanks for joining Lyon Pitchwear. Click the button below to verify 
    your email address.</p>

    <p>This link expires in <strong>24 hours</strong>.</p>

    <a href="${verifyUrl}"
      style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 28px;
      text-decoration:none;margin-top:16px;letter-spacing:2px;font-weight:bold;">
      VERIFY EMAIL
    </a>

    <p style="color:#888;margin-top:16px;font-size:12px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `;

  await sendEmail(
    email,
    "Verify your Lyon Pitchwear email",
    emailWrapper(content),
  );
};

/* -------------------------------------------------------------------------- */
/*                            PASSWORD RESET EMAIL                            */
/* -------------------------------------------------------------------------- */

export const sendPasswordResetEmail = async (payload: {
  name: string;
  email: string;
  resetLink: string;
}): Promise<void> => {
  const { name, email, resetLink } = payload;

  const content = `
    <h2>Password Reset Request 🔐</h2>

    <p>Hi ${name}, we received a request to reset your Lyon Pitchwear password.</p>

    <p>Click the button below. This link expires in <strong>1 hour</strong>.</p>

    <a href="${resetLink}"
      style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 28px;
      text-decoration:none;margin-top:16px;letter-spacing:2px;font-weight:bold;">
      RESET PASSWORD
    </a>

    <p style="color:#888;margin-top:16px;font-size:12px;">
      If you didn't request this, ignore this email. Your password won't change.
    </p>
  `;

  await sendEmail(
    email,
    "Reset your Lyon Pitchwear password",
    emailWrapper(content),
  );
};
