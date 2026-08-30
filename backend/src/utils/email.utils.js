import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseWrapper = (bodyHtml) => `
<div style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(10,31,53,0.08);">
          <tr>
            <td style="background:#0A1F35;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                Somalia Digital Address System
              </p>
              <p style="margin:2px 0 0;color:#9db4cc;font-size:12px;">
                Government Official Portal
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#f4f6f9;border-top:1px solid #eef1f5;">
              <p style="margin:0;color:#8a94a6;font-size:11px;line-height:1.5;">
                This is an automated security message from SDAS. If you did not initiate this action, contact your Super Admin immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;

export const sendOtpEmail = async (toEmail, otpCode, { name } = {}) => {
  const body = `
    <p style="margin:0 0 8px;color:#16233A;font-size:15px;">Hello${name ? ` ${name}` : ""},</p>
    <p style="margin:0 0 24px;color:#4b5666;font-size:14px;line-height:1.6;">
      Use the verification code below to complete your sign-in. This code expires in <strong>10 minutes</strong>.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <span style="display:inline-block;background:#eef4ff;color:#0056B3;font-size:32px;font-weight:700;letter-spacing:8px;padding:14px 28px;border-radius:10px;">
        ${otpCode}
      </span>
    </div>
    <p style="margin:0;color:#8a94a6;font-size:13px;line-height:1.6;">
      Never share this code with anyone, including SDAS staff. If you didn't request this, you can safely ignore this email.
    </p>`;

  await transporter.sendMail({
    from: `"SDAS Security" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your SDAS verification code",
    html: baseWrapper(body),
  });
};

export const sendLoginSuccessEmail = async (toEmail, { name, device, os, browser, ip, time } = {}) => {
  const body = `
    <div style="text-align:center;margin:0 0 20px;">
      <div style="width:52px;height:52px;background:#e7f7ee;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:26px;line-height:52px;">✓</div>
    </div>
    <p style="margin:0 0 4px;color:#16233A;font-size:17px;font-weight:600;text-align:center;">
      You're signed in
    </p>
    <p style="margin:0 0 24px;color:#4b5666;font-size:14px;text-align:center;">
      Hello${name ? ` ${name}` : ""}, your account was just accessed.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:4px 0;margin-bottom:20px;">
      <tr><td style="padding:10px 16px;color:#8a94a6;font-size:12px;">Time</td><td style="padding:10px 16px;color:#16233A;font-size:12px;text-align:right;">${time}</td></tr>
      <tr><td style="padding:10px 16px;color:#8a94a6;font-size:12px;">Device</td><td style="padding:10px 16px;color:#16233A;font-size:12px;text-align:right;">${device}</td></tr>
      <tr><td style="padding:10px 16px;color:#8a94a6;font-size:12px;">Browser / OS</td><td style="padding:10px 16px;color:#16233A;font-size:12px;text-align:right;">${browser} · ${os}</td></tr>
      <tr><td style="padding:10px 16px;color:#8a94a6;font-size:12px;">IP address</td><td style="padding:10px 16px;color:#16233A;font-size:12px;text-align:right;">${ip}</td></tr>
    </table>
    <p style="margin:0;color:#8a94a6;font-size:13px;line-height:1.6;text-align:center;">
      Wasn't you? Contact your Super Admin right away to secure your account.
    </p>`;

  await transporter.sendMail({
    from: `"SDAS Security" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "New sign-in to your SDAS account",
    html: baseWrapper(body),
  });
};