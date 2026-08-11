from urllib.parse import quote

from django.conf import settings


def get_email_confirmation_frontend_url(key: str, flow: str | None = None) -> str:
    url = settings.ACCOUNT_EMAIL_CONFIRMATION_URL.replace("{key}", quote(key, safe=""))
    if flow:
        url = f"{url}?flow={flow}"
    return url


def get_password_reset_frontend_url(uid: str, token: str) -> str:
    url = settings.PASSWORD_RESET_CONFIRM_URL
    url = url.replace("{uid}", quote(uid, safe=""))
    url = url.replace("{token}", quote(token, safe=""))
    return url
