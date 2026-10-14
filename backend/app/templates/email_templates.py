import datetime
import html

def get_time_based_greeting(name: str = "Guyo") -> str:
    """Returns 'Good morning', 'Good afternoon', or 'Good evening' based on current local time."""
    hour = datetime.datetime.now().hour
    if 5 <= hour < 12:
        period = "Good morning"
    elif 12 <= hour < 17:
        period = "Good afternoon"
    else:
        period = "Good evening"
    return f"{period} {name}"


# ==============================================================================
# 1. Developer Escalation Email (Sent TO: p3lcodes@gmail.com)
# ==============================================================================
def render_developer_escalation_email(
    user_id: str,
    username: str,
    email_address: str,
    role: str = "Advocate",
    firm_name: str = "Nyagah B. Kithinji & Co. Advocates",
    reset_action_url: str = "https://kithinjiandco.vercel.app"
) -> tuple[str, str]:
    greeting = get_time_based_greeting("Guyo")
    timestamp = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")

    plain_text = f"""P3L Developers
Email Support Helpdesk

Password Reset Request — Nyagah & Co Adv.

{greeting},

{username} ({email_address}) from {firm_name} has requested a password reset. Please review the details below:

--------------------------------------------------
User ID:        {user_id}
Username:       {username}
Email:          {email_address}
Role:           {role}
Requested Time: {timestamp}
--------------------------------------------------

Reset Password Link: {reset_action_url}

P3L Developers, Nairobi
This email was automated by P3L Helpdesk Delivery System. Please do not reply.
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
    <div style="padding: 24px 28px 16px 28px; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px;">P3L Developers</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Email Support Helpdesk</div>
      <div style="font-size: 14px; font-weight: 700; color: #d97706; margin-top: 14px;">Password Reset Request — Nyagah & Co Adv.</div>
    </div>
    <div style="padding: 24px 28px; font-size: 13px; line-height: 1.6; color: #334155;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #0f172a; font-size: 14px;">{greeting},</p>
      <p style="margin: 0 0 18px 0; color: #475569;">
        <strong>{html.escape(username)}</strong> ({html.escape(email_address)}) has requested a password reset. Please review the details below:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 14px; font-weight: 600; color: #64748b; width: 35%;">User ID</td>
            <td style="padding: 8px 14px; color: #0f172a; font-family: monospace;">{html.escape(user_id)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 14px; font-weight: 600; color: #64748b;">Username</td>
            <td style="padding: 8px 14px; color: #0f172a; font-weight: 600;">{html.escape(username)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 14px; font-weight: 600; color: #64748b;">Email</td>
            <td style="padding: 8px 14px; color: #0f172a;">{html.escape(email_address)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 14px; font-weight: 600; color: #64748b;">Role</td>
            <td style="padding: 8px 14px; color: #0f172a;">{html.escape(role)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 14px; font-weight: 600; color: #64748b;">Requested Time</td>
            <td style="padding: 8px 14px; color: #0f172a;">{timestamp}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="{reset_action_url}" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 12px; font-weight: 700; text-decoration: none; padding: 11px 26px; border-radius: 6px; letter-spacing: 0.3px;">Reset Password in Admin Portal</a>
      </div>
    </div>
    <div style="padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      <div style="font-weight: 600; color: #475569;">P3L Developers, Nairobi</div>
      <div style="margin-top: 3px; font-size: 10px; color: #94a3b8;">This email was automated by P3L Helpdesk Delivery System. Please do not reply.</div>
    </div>
  </div>
</body>
</html>"""

    return html_content, plain_text


# ==============================================================================
# 2. Automated Advocate Email (Sent back TO: Advocate with Reset Link)
# ==============================================================================
def render_advocate_reset_link_email(
    username: str,
    reset_url: str
) -> tuple[str, str]:
    greeting = get_time_based_greeting(username)

    plain_text = f"""P3L Developers
Email Support Helpdesk

Password Reset

{greeting},

Your password reset request was received. Please click the button below to reset your password.

Reset Link: {reset_url}

P3L Developers, Nairobi
This email was automated by P3L Helpdesk Delivery System. Please do not reply.
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
    <div style="padding: 24px 28px 16px 28px; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px;">P3L Developers</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Email Support Helpdesk</div>
      <div style="font-size: 14px; font-weight: 700; color: #0284c7; margin-top: 14px;">Password Reset</div>
    </div>
    <div style="padding: 24px 28px; font-size: 13px; line-height: 1.6; color: #334155;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #0f172a; font-size: 14px;">{greeting},</p>
      <p style="margin: 0 0 20px 0; color: #475569;">
        Your password reset request was received. Please click the button below to reset your password.
      </p>

      <div style="text-align: center; margin: 26px 0 16px 0;">
        <a href="{reset_url}" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 30px; border-radius: 6px; letter-spacing: 0.3px;">Reset Password</a>
      </div>

      <p style="margin: 18px 0 0 0; font-size: 11px; color: #94a3b8;">
        If you did not request this change, you can safely ignore this email.
      </p>
    </div>
    <div style="padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      <div style="font-weight: 600; color: #475569;">P3L Developers, Nairobi</div>
      <div style="margin-top: 3px; font-size: 10px; color: #94a3b8;">This email was automated by P3L Helpdesk Delivery System. Please do not reply.</div>
    </div>
  </div>
</body>
</html>"""

    return html_content, plain_text


# ==============================================================================
# 3. Confirmation Email (Sent back TO: Advocate after password is saved)
# ==============================================================================
def render_password_reset_confirmation_email(
    username: str,
    login_url: str = "https://kithinjiandco.vercel.app"
) -> tuple[str, str]:
    greeting = get_time_based_greeting(username)

    plain_text = f"""P3L Developers
Email Support Helpdesk

Password Updated Successfully

{greeting},

Your password has been reset successfully. Please log in to your account with your new credentials.

Login Link: {login_url}

P3L Developers, Nairobi
This email was automated by P3L Helpdesk Delivery System. Please do not reply.
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
    <div style="padding: 24px 28px 16px 28px; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px;">P3L Developers</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Email Support Helpdesk</div>
      <div style="font-size: 14px; font-weight: 700; color: #059669; margin-top: 14px;">Password Reset Successful</div>
    </div>
    <div style="padding: 24px 28px; font-size: 13px; line-height: 1.6; color: #334155;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #0f172a; font-size: 14px;">{greeting},</p>
      <p style="margin: 0 0 20px 0; color: #475569;">
        Your password has been reset successfully. Please log in to your account with your new credentials.
      </p>

      <div style="text-align: center; margin: 26px 0 16px 0;">
        <a href="{login_url}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 30px; border-radius: 6px; letter-spacing: 0.3px;">Log In to Portal</a>
      </div>
    </div>
    <div style="padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      <div style="font-weight: 600; color: #475569;">P3L Developers, Nairobi</div>
      <div style="margin-top: 3px; font-size: 10px; color: #94a3b8;">This email was automated by P3L Helpdesk Delivery System. Please do not reply.</div>
    </div>
  </div>
</body>
</html>"""

    return html_content, plain_text
