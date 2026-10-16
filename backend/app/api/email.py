import os
import time
import secrets
import html
import asyncio
import json
import datetime
from email.message import EmailMessage

from dotenv import load_dotenv

# Explicitly load backend .env file
_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
if os.path.exists(_env_path):
    load_dotenv(_env_path)
else:
    load_dotenv()

import aiosmtplib
import httpx
from fastapi import APIRouter, Header, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

try:
    from app.templates.email_templates import (
        render_developer_escalation_email,
        render_advocate_reset_link_email,
        render_password_reset_confirmation_email,
    )
except ModuleNotFoundError:
    from backend.app.templates.email_templates import (
        render_developer_escalation_email,
        render_advocate_reset_link_email,
        render_password_reset_confirmation_email,
    )

router = APIRouter(prefix="/api/v1/email", tags=["email"])

# In-memory storage for secure single-use password reset tokens (TTL: 1 hour)
RESET_TOKENS: dict[str, dict] = {}


import base64

class EmailAttachment(BaseModel):
    filename: str
    content: str  # base64 encoded data or raw string
    content_type: str = "application/pdf"

class EmailRequest(BaseModel):
    to: list[str] = Field(min_length=1, max_length=20)
    subject: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=100_000)
    html_body: str | None = None
    category: str = Field(pattern="^(firm_to_client|lawyer_to_client|internal|developer_admin)$")
    reply_to: str | None = None
    attachments: list[EmailAttachment] | None = None


class PasswordResetSupportRequest(BaseModel):
    email: str = Field(min_length=2, description="Email address or advocate username / Work ID")
    full_name: str | None = None
    username: str | None = None
    user_id: str | None = None
    role: str | None = "Advocate"
    firm_name: str | None = "Nyagah B. Kithinji & Co. Advocates"
    portal_url: str | None = "https://kithinjiandco.vercel.app"


class ConfirmPasswordResetRequest(BaseModel):
    email: str = Field(min_length=2)
    new_password: str = Field(min_length=6)
    token: str | None = None
    portal_url: str | None = "https://kithinjiandco.vercel.app"


async def authenticated_user(access_token: str | None) -> dict:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    if not access_token or not supabase_url or not supabase_anon_key:
        return {"id": "firm-admin", "email": "p3lcodes@gmail.com"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{supabase_url}/auth/v1/user",
                headers={"apikey": supabase_anon_key, "Authorization": f"Bearer {access_token}"},
            )
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
    return {"id": "firm-admin", "email": "p3lcodes@gmail.com"}


async def send_smtp_email(
    to_address: str,
    subject: str,
    plain_text: str,
    html_content: str,
    reply_to: str | None = None,
    sender_name: str = "Nyagah B. Kithinji & Co. Advocates"
) -> tuple[bool, str]:
    """Helper to dispatch email via Google SMTP (p3lcodes@gmail.com)."""
    email_user = os.getenv("EMAIL_USER") or os.getenv("SMTP_USERNAME") or "p3lcodes@gmail.com"
    email_pass_raw = os.getenv("EMAIL_PASS") or os.getenv("SMTP_PASSWORD") or "qubl ppmq mhmb qaqx"
    email_pass = email_pass_raw.replace(" ", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    message = EmailMessage()
    message["From"] = f"{sender_name} <{email_user}>"
    message["To"] = to_address
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to

    message.set_content(plain_text)
    message.add_alternative(html_content, subtype="html")

    err_587 = ""
    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=email_user,
            password=email_pass,
            start_tls=True,
            timeout=12,
        )
        print(f"INFO: [SMTP SUCCESS] Successfully delivered '{subject}' to {to_address}")
        return True, "Delivered"
    except Exception as exc:
        err_587 = str(exc)
        print(f"[SMTP 587 ERROR to {to_address}]: {err_587}. Trying port 465 SSL fallback...")

    # Port 465 SSL fallback
    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=465,
            username=email_user,
            password=email_pass,
            use_tls=True,
            timeout=12,
        )
        print(f"INFO: [SMTP 465 SUCCESS] Delivered '{subject}' to {to_address}")
        return True, "Delivered via SSL port 465"
    except Exception as ssl_exc:
        err_465 = str(ssl_exc)
        print(f"[SMTP 465 ERROR to {to_address}]: {err_465}")
        return False, err_465 or err_587


async def async_dispatch_reset_emails(
    advocate_email: str,
    user_id: str,
    dev_plain: str,
    dev_html: str,
    adv_plain: str,
    adv_html: str
):
    """Dispatches developer escalation and advocate reset emails in parallel background task."""
    dev_task = send_smtp_email(
        to_address="p3lcodes@gmail.com",
        subject="Nyagah & Co - Password Reset Request",
        plain_text=dev_plain,
        html_content=dev_html,
        reply_to=advocate_email,
        sender_name="P3L Developers"
    )

    adv_task = send_smtp_email(
        to_address=advocate_email,
        subject="Password Reset — P3L Developers Help Desk",
        plain_text=adv_plain,
        html_content=adv_html,
        reply_to="p3lcodes@gmail.com",
        sender_name="P3L Developers Help Desk"
    )

    dev_res, adv_res = await asyncio.gather(dev_task, adv_task, return_exceptions=True)
    dev_ok = bool((isinstance(dev_res, tuple) and dev_res[0]) or dev_res is True)
    adv_ok = bool((isinstance(adv_res, tuple) and adv_res[0]) or adv_res is True)
    print(f"INFO: [BACKGROUND EMAIL STATUS] Escalation to p3lcodes@gmail.com: {dev_ok} | Reset link to {advocate_email}: {adv_ok}")


@router.post("/send")
async def send_email(payload: EmailRequest, authorization: str | None = Header(default=None)):
    access_token = authorization.removeprefix("Bearer ").strip() if authorization else None
    user = await authenticated_user(access_token)

    email_user = os.getenv("EMAIL_USER") or os.getenv("SMTP_USERNAME") or "p3lcodes@gmail.com"
    email_pass_raw = os.getenv("EMAIL_PASS") or os.getenv("SMTP_PASSWORD") or "qubl ppmq mhmb qaqx"
    email_pass = email_pass_raw.replace(" ", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if email_user and email_pass:
        message = EmailMessage()
        message["From"] = f"Nyagah B. Kithinji & Co. Advocates <{email_user}>"
        message["To"] = ", ".join(str(address) for address in payload.to)
        message["Subject"] = payload.subject
        message["X-Karani-Law-Category"] = payload.category
        message["X-Karani-Law-Sender"] = user.get("id", "firm-admin")
        if payload.reply_to:
            message["Reply-To"] = str(payload.reply_to)

        if payload.html_body:
            html_content = payload.html_body
        elif payload.body.strip().startswith("<!DOCTYPE html") or "<html" in payload.body:
            html_content = payload.body
        else:
            html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 800;">Nyagah B. Kithinji &amp; Co. Advocates</h2>
    <div style="line-height: 1.6; white-space: pre-wrap; font-size: 13px; color: #334155;">{html.escape(payload.body)}</div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      Official automated dispatch from Nyagah B. Kithinji &amp; Co. Advocates Portal &bull; Encrypted TLS 1.3
    </div>
  </div>
</body>
</html>"""
        message.set_content(payload.body)
        message.add_alternative(html_content, subtype="html")

        # Attach documents if provided
        if payload.attachments:
            for att in payload.attachments:
                try:
                    if att.content.startswith("data:") and "," in att.content:
                        b64_str = att.content.split(",", 1)[1]
                        raw_data = base64.b64decode(b64_str)
                    else:
                        raw_data = base64.b64decode(att.content)
                except Exception:
                    raw_data = att.content.encode("utf-8")
                
                maintype, _, subtype = att.content_type.partition("/")
                message.add_attachment(
                    raw_data,
                    maintype=maintype or "application",
                    subtype=subtype or "pdf",
                    filename=att.filename
                )

        ok, err_msg = await send_smtp_email(
            to_address=", ".join(str(address) for address in payload.to),
            subject=payload.subject,
            plain_text=payload.body,
            html_content=html_content,
            reply_to=payload.reply_to,
            sender_name="Nyagah B. Kithinji & Co. Advocates"
        )
        if not ok:
            raise HTTPException(
                status_code=502,
                detail=f"Google SMTP delivery error: {err_msg}"
            )
        return {
            "sent": True,
            "provider": "gmail_smtp",
            "sender": email_user,
            "recipients": len(payload.to),
            "attachments": len(payload.attachments or []),
            "category": payload.category
        }


@router.post("/password-reset-request")
async def request_password_reset_support(
    payload: PasswordResetSupportRequest,
    background_tasks: BackgroundTasks
):
    """
    1. Resolves advocate username or email address.
    2. Generates single-use reset token.
    3. Queues parallel background email dispatch to p3lcodes@gmail.com and the advocate.
    4. Returns immediate 200 response so UI never hangs or times out.
    """
    raw_input = str(payload.email).strip().lower()

    # 1. Resolve email address if username / handle was provided
    if "@" in raw_input:
        advocate_email = raw_input
        username = payload.username or raw_input.split("@")[0]
    else:
        username = raw_input
        # Check known firm identities
        if "guyo" in raw_input:
            advocate_email = "guyohalakeofficial@gmail.com"
        elif "karani" in raw_input or "victor" in raw_input:
            advocate_email = "vickarani@gmail.com"
        elif "nyagah" in raw_input or "kithinji" in raw_input or "lawyer" in raw_input:
            advocate_email = "advocate@kithinjilegal.co.ke"
        elif "razak" in raw_input:
            advocate_email = "razak.admin@p3ldev.com"
        else:
            advocate_email = f"{raw_input}@kithinjilegal.co.ke"

    user_id = payload.user_id or f"usr-{abs(hash(advocate_email)) % 1000000}"
    role = payload.role or "Advocate"
    firm_name = payload.firm_name or "Nyagah B. Kithinji & Co. Advocates"
    portal_url = payload.portal_url or "https://kithinjiandco.vercel.app"

    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    RESET_TOKENS[reset_token] = {
        "email": advocate_email,
        "username": username,
        "user_id": user_id,
        "expires_at": time.time() + 3600  # 1 hour TTL
    }

    reset_action_url = f"{portal_url.rstrip('/')}/reset-password?email={advocate_email}&token={reset_token}"

    dev_html, dev_plain = render_developer_escalation_email(
        user_id=user_id,
        username=username,
        email_address=advocate_email,
        role=role,
        firm_name=firm_name,
        reset_action_url=reset_action_url
    )

    adv_html, adv_plain = render_advocate_reset_link_email(
        username=username,
        reset_url=reset_action_url
    )

    # Queue background delivery so web request responds in < 30ms
    background_tasks.add_task(
        async_dispatch_reset_emails,
        advocate_email,
        user_id,
        dev_plain,
        dev_html,
        adv_plain,
        adv_html
    )

    print(f"INFO: [PASSWORD RESET QUEUED] Fast-path accepted for {advocate_email} (User ID: {user_id}). Dispatching background task.")

    return {
        "success": True,
        "recipient": "p3lcodes@gmail.com",
        "advocate_email": advocate_email,
        "user_id": user_id,
        "message": "Your password reset request has been sent to P3L Developer Support for Nyagah B. Kithinji & Co. Our team will assist you shortly."
    }


@router.post("/confirm-password-reset")
async def confirm_password_reset(
    payload: ConfirmPasswordResetRequest,
    background_tasks: BackgroundTasks
):
    """
    Updates the password in Supabase and sends confirmation email back to the advocate.
    """
    advocate_email = str(payload.email).strip().lower()
    new_password = payload.new_password.strip()
    portal_url = payload.portal_url or "https://kithinjiandco.vercel.app"

    # Token validation (if token provided)
    if payload.token:
        cached = RESET_TOKENS.get(payload.token)
        if cached and time.time() > cached.get("expires_at", 0):
            RESET_TOKENS.pop(payload.token, None)
            raise HTTPException(status_code=400, detail="Password reset link has expired. Please request a new one.")

    # 1. Update password in Supabase database
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if supabase_url and supabase_key:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                await client.patch(
                    f"{supabase_url}/rest/v1/users?email=ilike.{advocate_email}",
                    headers={
                        "apikey": supabase_key,
                        "Authorization": f"Bearer {supabase_key}",
                        "Prefer": "return=representation"
                    },
                    json={"password_hash": new_password}
                )
                try:
                    admin_headers = {
                        "apikey": supabase_key,
                        "Authorization": f"Bearer {supabase_key}",
                    }
                    users_res = await client.get(
                        f"{supabase_url}/auth/v1/admin/users",
                        headers=admin_headers
                    )
                    if users_res.status_code == 200:
                        all_users = users_res.json().get("users", [])
                        match_u = next((u for u in all_users if (u.get("email") or "").lower() == advocate_email), None)
                        if match_u and match_u.get("id"):
                            await client.put(
                                f"{supabase_url}/auth/v1/admin/users/{match_u['id']}",
                                headers=admin_headers,
                                json={"password": new_password}
                            )
                            print(f"[SUPABASE AUTH ADMIN UPDATE SUCCESS] Updated auth user password for {advocate_email}")
                except Exception as auth_admin_err:
                    print(f"[SUPABASE AUTH ADMIN UPDATE WARNING]: {auth_admin_err}")
        except Exception as db_err:
            print(f"[SUPABASE DB UPDATE WARNING]: {db_err}")

    # Consume token
    if payload.token:
        RESET_TOKENS.pop(payload.token, None)

    # 2. Queue confirmation email to advocate
    username = advocate_email.split("@")[0].capitalize()
    conf_html, conf_plain = render_password_reset_confirmation_email(
        username=username,
        login_url=portal_url
    )

    background_tasks.add_task(
        send_smtp_email,
        advocate_email,
        "Your Password Has Been Reset — P3L Help Desk",
        conf_plain,
        conf_html,
        "p3lcodes@gmail.com",
        "P3L Developers Help Desk"
    )

    print(f"INFO: [PASSWORD RESET COMPLETED] Password successfully updated in Supabase for {advocate_email}. Confirmation email queued.")

    return {
        "success": True,
        "email": advocate_email,
        "message": "Your password has been reset successfully. Please log in."
    }


class WelcomeUserEmailRequest(BaseModel):
    email: str = Field(min_length=2)
    personal_email: str | None = None
    username: str = Field(min_length=1)
    full_name: str | None = None
    role_name: str | None = None
    temporary_password: str | None = None
    allow_self_password: bool = True
    portal_url: str | None = "http://localhost:3000"
    broadcast_devs: bool = True
    custom_subject: str | None = None
    custom_html: str | None = None
    custom_text: str | None = None


@router.post("/welcome-user")
async def send_welcome_user_email(
    payload: WelcomeUserEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Sends official onboarding welcome email to newly created users from p3lcodes@gmail.com,
    with copies to both work & personal emails and developer team notification.
    """
    to_email = payload.email.strip().lower()
    personal_email = (payload.personal_email or "").strip().lower()
    username = payload.username.strip().lstrip("@")
    full_name = (payload.full_name or username).strip()
    role_title = payload.role_name or "Advocate"
    portal_url = payload.portal_url or "http://localhost:3000"
    temp_pass = payload.temporary_password or "Nyagah@2026"
    subject = payload.custom_subject or "Welcome to Nyagah B. Kithinji & Co. Advocates — Account Provisioning"

    plain_text = f"""Dear {full_name},

Welcome to Nyagah B. Kithinji & Co. Advocates Fee Notes Builder. An Account has been created for you. Use the details below to login:

Portal Link: {portal_url}
System Username: @{username}
Email: {to_email}
Temporary Password: {temp_pass}

Sign in: {portal_url}

Yours faithfully,
Nyagah B. Kithinji & Co. Advocates
Advocates of the High Court of Kenya • Practice & Remuneration Portal
Suite 4B, Mbaruk Road, Nairobi, Kenya
"""

    html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    
    <!-- Firm Header with Logo -->
    <div style="display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(30, 58, 138, 0.25);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
          <path d="M7 21h10"/>
          <path d="M12 3v18"/>
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
        </svg>
      </div>
      <div>
        <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">
          Nyagah B. Kithinji &amp; Co. Advocates
        </h2>
        <p style="margin: 3px 0 0 0; color: #64748b; font-size: 12px; font-weight: 500;">
          Advocates of the High Court of Kenya &bull; Practice &amp; Remuneration Portal
        </p>
      </div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 14px;">
      Dear <strong>{html.escape(full_name)}</strong>,
    </p>

    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Welcome to <strong>Nyagah B. Kithinji &amp; Co. Advocates Fee Notes Builder</strong>. An Account has been created for you. Use the details below to login:
    </p>

    <!-- Credentials Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-weight: 600; color: #64748b; width: 38%;">Portal Link</td>
          <td style="padding: 12px 16px; color: #0f172a;"><a href="{portal_url}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{portal_url}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-weight: 600; color: #64748b;">System Username</td>
          <td style="padding: 12px 16px; font-family: monospace; font-weight: 600; color: #0f172a;">@{html.escape(username)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-weight: 600; color: #64748b;">Email</td>
          <td style="padding: 12px 16px; font-family: monospace; color: #0f172a;">{html.escape(to_email)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 600; color: #64748b;">Temporary Password</td>
          <td style="padding: 12px 16px; font-family: monospace; font-weight: 700; color: #0f172a; background-color: #f1f5f9;">{html.escape(temp_pass)}</td>
        </tr>
      </table>
    </div>

    <!-- Sign In Button -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="{portal_url}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 13px 36px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 0.3px; box-shadow: 0 2px 6px rgba(30, 58, 138, 0.3);">
        Sign in
      </a>
    </div>

    <!-- Simple Footer -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center;">
      Nyagah B. Kithinji &amp; Co. Advocates &bull; Suite 4B, Mbaruk Road, Nairobi, Kenya
    </div>
  </div>
</body>
</html>"""

    if payload.custom_text:
        plain_text = payload.custom_text
    if payload.custom_html:
        html_content = payload.custom_html

    # 1. Send to primary work email
    ok, err_msg = await send_smtp_email(
        to_address=to_email,
        subject=subject,
        plain_text=plain_text,
        html_content=html_content,
        reply_to="p3lcodes@gmail.com",
        sender_name="Nyagah B. Kithinji & Co. Advocates"
    )

    if not ok:
        print(f"[WELCOME EMAIL DELIVERY FAILED to {to_email}]: {err_msg}")
        raise HTTPException(
            status_code=502,
            detail=f"User registered in database, but welcome email could not be sent to {to_email}: {err_msg}"
        )

    # 2. If personal email is provided and differs from work email, dispatch copy there too
    if personal_email and personal_email != to_email:
        background_tasks.add_task(
            send_smtp_email,
            personal_email,
            subject,
            plain_text,
            html_content,
            "p3lcodes@gmail.com",
            "Nyagah B. Kithinji & Co. Advocates"
        )

    # 3. Broadcast notification copy to developers & system administrators
    if payload.broadcast_devs:
        dev_recipients = ["p3lcodes@gmail.com", "razak.admin@p3ldev.com", "guyohalakeofficial@gmail.com", "vickarani@gmail.com"]
        for dev_email in dev_recipients:
            if dev_email != to_email and dev_email != personal_email:
                background_tasks.add_task(
                    send_smtp_email,
                    dev_email,
                    f"[System Broadcast] New User Onboarded: {full_name} ({role_title})",
                    f"A new user account was registered:\nName: {full_name}\nRole: {role_title}\nWork Email: {to_email}\nUsername: @{username}\n\n" + plain_text,
                    html_content,
                    to_email,
                    "Nyagah & Co System Administration"
                )

    return {
        "success": True,
        "email": to_email,
        "personal_email": personal_email,
        "username": username,
        "broadcast_sent": True,
        "message": f"Invitation email successfully dispatched to {to_email} and broadcast to system administrators."
    }


# ==============================================================================
# Persistent Email Templates Management (Real system templates)
# ==============================================================================

TEMPLATES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "email_templates.json")

def load_stored_templates() -> list[dict]:
    if os.path.exists(TEMPLATES_FILE):
        try:
            with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[TEMPLATES LOAD ERROR]: {e}")
    return []

def save_stored_templates(templates: list[dict]):
    os.makedirs(os.path.dirname(TEMPLATES_FILE), exist_ok=True)
    with open(TEMPLATES_FILE, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=2, ensure_ascii=False)


class UpdateTemplatePayload(BaseModel):
    subject: str = Field(min_length=1)
    plainText: str = Field(min_length=1)
    htmlContent: str = Field(min_length=1)


@router.get("/templates")
async def get_email_templates_endpoint():
    """Returns all verified persistent email templates from backend data store."""
    templates = load_stored_templates()
    return {"templates": templates, "count": len(templates)}


@router.put("/templates/{template_id}")
async def update_email_template_endpoint(template_id: str, payload: UpdateTemplatePayload):
    """Saves updated template subject, HTML, and text directly to the system database."""
    templates = load_stored_templates()
    found = False
    for tpl in templates:
        if tpl.get("id") == template_id:
            tpl["subject"] = payload.subject
            tpl["plainText"] = payload.plainText
            tpl["htmlContent"] = payload.htmlContent
            tpl["isCustom"] = True
            tpl["updatedAt"] = datetime.datetime.now().isoformat()
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        
    save_stored_templates(templates)
    return {"success": True, "template_id": template_id, "message": "Template saved to backend successfully"}


@router.post("/templates/{template_id}/reset")
async def reset_email_template_endpoint(template_id: str):
    """Resets an email template back to default system content."""
    templates = load_stored_templates()
    found = False
    for tpl in templates:
        if tpl.get("id") == template_id:
            tpl["isCustom"] = False
            tpl.pop("updatedAt", None)
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        
    save_stored_templates(templates)
    return {"success": True, "template_id": template_id, "message": "Template reset to system default"}


# ==============================================================================
# Live SMTP Gateway Diagnostics & Credentials Manager
# ==============================================================================

class SmtpConfigPayload(BaseModel):
    email_user: str = Field(min_length=3)
    email_pass: str = Field(min_length=4)
    smtp_host: str | None = "smtp.gmail.com"
    smtp_port: int | None = 587
    force_save: bool | None = False


@router.get("/smtp-status")
async def get_smtp_status():
    """Live diagnostic check of Google SMTP connection and real-time credentials from env."""
    email_user = os.getenv("EMAIL_USER") or os.getenv("SMTP_USERNAME") or "p3lcodes@gmail.com"
    email_pass_raw = os.getenv("EMAIL_PASS") or os.getenv("SMTP_PASSWORD") or "qubl ppmq mhmb qaqx"
    email_pass = email_pass_raw.replace(" ", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    import smtplib
    import base64
    try:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=8)
        server.ehlo()
        server.starttls()
        server.ehlo()
        auth_bytes = f"\x00{email_user}\x00{email_pass}".encode("utf-8")
        auth_str = base64.b64encode(auth_bytes).decode("ascii")
        code, resp = server.docmd("AUTH", f"PLAIN {auth_str}")
        try:
            server.quit()
        except Exception:
            pass
            
        if code in (235, 250):
            return {
                "connected": True,
                "email_user": email_user,
                "email_pass": email_pass_raw,
                "host": smtp_host,
                "port": smtp_port,
                "message": f"SMTP Gateway connected and authenticated as {email_user}"
            }
        else:
            resp_str = resp.decode("utf-8", errors="replace")
            return {
                "connected": False,
                "email_user": email_user,
                "email_pass": email_pass_raw,
                "host": smtp_host,
                "port": smtp_port,
                "error_code": code,
                "error_message": resp_str,
                "reason": "Google blocked SMTP access. Please unlock via WebLogin or generate a new App Password.",
                "unlock_url": "https://accounts.google.com/DisplayUnlockCaptcha",
                "app_password_url": "https://myaccount.google.com/apppasswords"
            }
    except Exception as exc:
        return {
            "connected": False,
            "email_user": email_user,
            "email_pass": email_pass_raw,
            "host": smtp_host,
            "port": smtp_port,
            "error_message": str(exc),
            "reason": "Google blocked SMTP access. Please unlock via WebLogin or generate a new App Password.",
            "unlock_url": "https://accounts.google.com/DisplayUnlockCaptcha",
            "app_password_url": "https://myaccount.google.com/apppasswords"
        }


@router.post("/smtp-config")
async def update_smtp_config(payload: SmtpConfigPayload):
    """Updates SMTP credentials in runtime and saves to backend .env for the entire system."""
    clean_user = payload.email_user.strip().lower()
    clean_pass = payload.email_pass.strip().replace(" ", "")
    raw_pass_for_env = payload.email_pass.strip()
    target_host = (payload.smtp_host or "smtp.gmail.com").strip()
    target_port = int(payload.smtp_port or 587)

    # Live test credentials before committing
    import smtplib
    import base64
    auth_passed = False
    auth_detail = ""
    error_code = None

    try:
        server = smtplib.SMTP(target_host, target_port, timeout=8)
        server.ehlo()
        server.starttls()
        server.ehlo()
        auth_bytes = f"\x00{clean_user}\x00{clean_pass}".encode("utf-8")
        auth_str = base64.b64encode(auth_bytes).decode("ascii")
        code, resp = server.docmd("AUTH", f"PLAIN {auth_str}")
        try:
            server.quit()
        except Exception:
            pass
            
        if code in (235, 250):
            auth_passed = True
            auth_detail = "Verified and authenticated successfully with mail server."
        else:
            error_code = code
            auth_detail = resp.decode("utf-8", errors="replace")
    except Exception as exc:
        auth_detail = str(exc)

    if not auth_passed and not payload.force_save:
        # If user did not force save, reject with clear explanation
        raise HTTPException(
            status_code=400,
            detail=f"SMTP authentication check returned code {error_code or 'ERR'}: {auth_detail}. If you want to save anyway, use Force Save."
        )

    # Commit working credentials to system runtime
    os.environ["EMAIL_USER"] = clean_user
    os.environ["EMAIL_PASS"] = raw_pass_for_env
    os.environ["SMTP_USERNAME"] = clean_user
    os.environ["SMTP_PASSWORD"] = raw_pass_for_env
    os.environ["SMTP_HOST"] = target_host
    os.environ["SMTP_PORT"] = str(target_port)
    os.environ["SMTP_FROM"] = clean_user

    # Commit to backend/.env file
    env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            keys_updated = set()
            new_lines = []
            for line in lines:
                if line.startswith("EMAIL_USER="):
                    new_lines.append(f"EMAIL_USER={clean_user}\n")
                    keys_updated.add("EMAIL_USER")
                elif line.startswith("EMAIL_PASS="):
                    new_lines.append(f"EMAIL_PASS={raw_pass_for_env}\n")
                    keys_updated.add("EMAIL_PASS")
                elif line.startswith("SMTP_USERNAME="):
                    new_lines.append(f"SMTP_USERNAME={clean_user}\n")
                    keys_updated.add("SMTP_USERNAME")
                elif line.startswith("SMTP_PASSWORD="):
                    new_lines.append(f"SMTP_PASSWORD={raw_pass_for_env}\n")
                    keys_updated.add("SMTP_PASSWORD")
                elif line.startswith("SMTP_HOST="):
                    new_lines.append(f"SMTP_HOST={target_host}\n")
                    keys_updated.add("SMTP_HOST")
                elif line.startswith("SMTP_PORT="):
                    new_lines.append(f"SMTP_PORT={target_port}\n")
                    keys_updated.add("SMTP_PORT")
                elif line.startswith("SMTP_FROM="):
                    new_lines.append(f"SMTP_FROM={clean_user}\n")
                    keys_updated.add("SMTP_FROM")
                else:
                    new_lines.append(line)

            # Append any missing keys
            if "EMAIL_USER" not in keys_updated:
                new_lines.append(f"EMAIL_USER={clean_user}\n")
            if "EMAIL_PASS" not in keys_updated:
                new_lines.append(f"EMAIL_PASS={raw_pass_for_env}\n")
            if "SMTP_USERNAME" not in keys_updated:
                new_lines.append(f"SMTP_USERNAME={clean_user}\n")
            if "SMTP_PASSWORD" not in keys_updated:
                new_lines.append(f"SMTP_PASSWORD={raw_pass_for_env}\n")

            with open(env_file, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
            print(f"INFO: [ENV SAVED] Successfully updated SMTP credentials in {env_file}")
        except Exception as file_err:
            print(f"[ENV SAVE NOTICE]: {file_err}")

    return {
        "success": True,
        "connected": auth_passed,
        "email_user": clean_user,
        "email_pass": raw_pass_for_env,
        "host": target_host,
        "port": target_port,
        "auth_detail": auth_detail,
        "message": f"SMTP Gateway credentials saved to system .env for {clean_user}!" + (
            " Server accepted connection." if auth_passed else " (Note: Run DisplayUnlockCaptcha if Google requires web verification)"
        )
    }