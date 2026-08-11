from allauth.account import app_settings
from allauth.account.adapter import DefaultAccountAdapter

from .auth_urls import get_email_confirmation_frontend_url


class AccountAdapter(DefaultAccountAdapter):
    def send_confirmation_mail(self, request, emailconfirmation, signup) -> None:
        """
        メール認証リンクをフロントエンドのURLにするため、
        allauthの確認メール送信処理をオーバーライドする。

        新規登録時とメールアドレス変更時でフロントエンド側の処理を
        切り替えられるよう、メールアドレス変更時はURLにflowを付与する。
        """
        ctx = {
            "user": emailconfirmation.email_address.user,
        }
        if app_settings.EMAIL_VERIFICATION_BY_CODE_ENABLED:
            # コード認証の場合は、確認コードをメールに渡す
            ctx.update({"code": emailconfirmation.key})
        else:
            # 新規登録とメールアドレス変更をフロント側で区別する
            flow = None if signup else "email-change"
            ctx.update(
                {
                    "key": emailconfirmation.key,
                    "activate_url": get_email_confirmation_frontend_url(
                        emailconfirmation.key,
                        flow=flow,
                    ),
                }
            )

        if signup:
            email_template = "account/email/email_confirmation_signup"
        else:
            email_template = "account/email/email_confirmation"

        self.send_mail(email_template, emailconfirmation.email_address.email, ctx)
