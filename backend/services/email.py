import logging
import os

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
EMAIL_FROM = os.getenv("EMAIL_FROM", "Canvett <onboarding@resend.dev>").strip()


def send_email(to: str, subject: str, html: str) -> bool:
    """Send a transactional email through Resend.

    When RESEND_API_KEY is not configured (e.g. local development), the message
    is logged instead of sent, so the reset flow still works end to end without a
    provider — the link appears in the server logs. `requests` is imported lazily
    so the app (and the test suite) import fine even where it is not installed;
    it is only needed for a real send, which also requires the API key.
    Returns True on a real send.
    """
    if not RESEND_API_KEY:
        logger.info("Email not sent (RESEND_API_KEY unset). to=%s subject=%s\n%s", to, subject, html)
        return False
    try:
        import requests

        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html},
            timeout=10,
        )
        if resp.status_code >= 400:
            logger.warning("Email send failed (%s): %s", resp.status_code, resp.text[:300])
            return False
        return True
    except Exception:
        logger.exception("Email send raised for to=%s", to)
        return False
