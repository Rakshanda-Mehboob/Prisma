"""
auth/email_service.py — Email dispatch and fallback logging service for Prisma.

Provides robust email dispatching using standard smtplib with TLS/SSL.
When SMTP is not configured or in development mode, it logs the secure link
prominently to the server console and provides fallback handling.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_USE_TLS,
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
)

logger = logging.getLogger("auth.email_service")


def send_password_reset_email(to_email: str, reset_url: str, user_name: str = "Student") -> bool:
    """
    Sends a password reset email to the user.
    If SMTP server details are configured in .env, sends via real SMTP.
    Otherwise, logs the link clearly to the console for development testing.
    """
    # Plain text version
    plain_text = f"""Hello {user_name},

We received a request to reset your password for your Prisma account.

To choose a new password, click or paste the following link into your browser:
{reset_url}

This link is valid for {PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
Prisma — Cognitive Cyber Defense Team
Faculty of Computing, Riphah International University
"""

    # HTML formatted version matching Prisma's aesthetic
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F4F2F3;
      margin: 0;
      padding: 24px;
      color: #2D3748;
    }}
    .email-container {{
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
    }}
    .header {{
      background: linear-gradient(135deg, #64766A 0%, #4E5D53 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }}
    .header h1 {{
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 6px 0 0;
      font-size: 13px;
      opacity: 0.9;
      letter-spacing: 1px;
      text-transform: uppercase;
    }}
    .content {{
      padding: 32px 28px;
      line-height: 1.6;
    }}
    .button-wrap {{
      text-align: center;
      margin: 30px 0;
    }}
    .btn {{
      display: inline-block;
      background-color: #64766A;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
    }}
    .notice {{
      background-color: #F8FAFC;
      border-left: 4px solid #C0A9BD;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 13px;
      color: #64748B;
      margin-top: 24px;
    }}
    .link-fallback {{
      font-size: 12px;
      color: #94A3B8;
      word-break: break-all;
      margin-top: 20px;
    }}
    .footer {{
      padding: 20px 28px;
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Prisma</h1>
      <p>Cognitive Cyber Defense</p>
    </div>
    <div class="content">
      <h2 style="font-size: 19px; margin-top: 0; color: #1A202C;">Reset Your Password</h2>
      <p>Hello {user_name},</p>
      <p>We received a request to reset your password. Click the button below to choose a secure new password for your account:</p>
      
      <div class="button-wrap">
        <a href="{reset_url}" target="_blank" class="btn">Reset My Password</a>
      </div>

      <div class="notice">
        This link is active for <strong>{PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes</strong>. For security, it can only be used once.
      </div>

      <p class="link-fallback">
        Button not working? Copy and paste this URL into your browser:<br>
        <a href="{reset_url}" style="color: #64766A;">{reset_url}</a>
      </p>

      <p style="font-size: 13px; color: #718096; margin-top: 24px;">
        If you did not request this change, please ignore this email. Your existing credentials remain safe.
      </p>
    </div>
    <div class="footer">
      Prisma — AI-Powered Cyberbullying Prevention & Intervention System<br>
      Faculty of Computing, Riphah International University
    </div>
  </div>
</body>
</html>
"""

    # If SMTP is configured, attempt real email delivery
    if SMTP_HOST and SMTP_USER:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Reset Your Prisma Password"
            msg["From"] = SMTP_FROM_EMAIL
            msg["To"] = to_email

            part1 = MIMEText(plain_text, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if SMTP_USE_TLS:
                    server.starttls()
                if SMTP_PASSWORD:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())

            logger.info("Password reset email successfully dispatched via SMTP to %s", to_email)
            print(f"[EMAIL SERVICE] Successfully dispatched password reset email to {to_email}")
            return True
        except Exception as e:
            logger.warning("SMTP email sending failed (%s). Falling back to console log.", e)
            print(f"[EMAIL SERVICE WARNING] SMTP dispatch failed ({e}). Falling back to terminal log.")

    # Development fallback: prominent console logging
    separator = "=" * 72
    print(f"\n{separator}")
    print("  [PRISMA PASSWORD RESET EMAIL — DEVELOPMENT FALLBACK]")
    print(f"  To:         {to_email} ({user_name})")
    print(f"  Reset Link: {reset_url}")
    print(f"  Valid for:  {PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes")
    print(f"{separator}\n")

    return False
