import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

export const sendOtpEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "Missing email credentials: set EMAIL_USER and EMAIL_PASSWORD",
    );
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"EstateLanka" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "EstateLanka Email Verification",

    text: `Your EstateLanka verification code is ${otp}. This code will expire in 10 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #0F3D66;">EstateLanka</h2>

        <p>Thank you for creating an EstateLanka account.</p>

        <p>Your email verification code is:</p>

        <h1 style="letter-spacing: 8px; color: #1769AA;">
          ${otp}
        </h1>

        <p>This code will expire in 10 minutes.</p>

        <p>If you did not create this account, you can safely ignore this email.</p>

        <hr />

        <p style="color: #667085;">
          EstateLanka — Sri Lankan Real Estate Marketplace
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "Missing email credentials: set EMAIL_USER and EMAIL_PASSWORD",
    );
  }

  if (!process.env.FRONTEND_URL) {
    throw new Error("Missing FRONTEND_URL environment variable");
  }

  const transporter = createTransporter();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"EstateLanka" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "EstateLanka Password Reset",

    text: `We received a request to reset your EstateLanka password.

Click the following link to create a new password:

${resetLink}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">

        <h2 style="color: #0F3D66; margin-top: 0;">
          EstateLanka
        </h2>

        <h3 style="color: #1e293b;">
          Password Reset Request
        </h3>

        <p style="color: #475569; line-height: 1.6;">
          We received a request to reset your EstateLanka account password.
        </p>

        <p style="color: #475569; line-height: 1.6;">
          Click the button below to create a new password.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #1769AA;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          This password reset link will expire in 30 minutes.
        </p>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          If you did not request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>

        <hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;" />

        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
          EstateLanka — Sri Lankan Real Estate Marketplace
        </p>

      </div>
    `,
  });
};

export const sendContactEmail = async ({
  name,
  email,
  phone,
  subject,
  message,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "Missing email credentials: set EMAIL_USER and EMAIL_PASSWORD",
    );
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"EstateLanka Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `[EstateLanka Inquiry] ${subject}`,

    text: `Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject}

Message:
${message}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">

        <h2 style="color: #2563eb; margin-top: 0;">
          New Contact Us Inquiry
        </h2>

        <p style="color: #475569; font-size: 14px;">
          You have received a new contact message from the EstateLanka website.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">

          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 120px;">
              Sender Name:
            </td>

            <td style="padding: 8px 0; color: #0f172a;">
              ${name}
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold;">
              Sender Email:
            </td>

            <td style="padding: 8px 0; color: #0f172a;">
              <a href="mailto:${email}">${email}</a>
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold;">
              Phone Number:
            </td>

            <td style="padding: 8px 0; color: #0f172a;">
              ${phone || "Not provided"}
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: bold;">
              Subject:
            </td>

            <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">
              ${subject}
            </td>
          </tr>

        </table>

        <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">

          <p style="margin: 0; color: #334155; font-size: 14px; white-space: pre-wrap;">
            ${message}
          </p>

        </div>

        <hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;" />

        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
          EstateLanka — Sri Lankan Real Estate Portal
        </p>

      </div>
    `,
  });
};
