from allauth.account.internal.flows.manage_email import email_already_exists
from allauth.account.models import EmailAddress
from allauth.account.utils import user_pk_to_url_str
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
)
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from renda.auth_urls import get_password_reset_frontend_url


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    # emailでログインできるようにする
    username_field = "email"


class EmailOnlyRegisterSerializer(RegisterSerializer):
    # 新規登録時に、usernameを必須ではなくする
    username = serializers.CharField(required=False, allow_blank=True)

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "password1": self.validated_data.get("password1", ""),
        }


def frontend_password_reset_url_generator(request, user, temp_key):
    uid = user_pk_to_url_str(user)
    return get_password_reset_frontend_url(uid, temp_key)


class FrontendPasswordResetSerializer(PasswordResetSerializer):
    # パスワードリセットリンクでフロントエンドを用いるようにカスタマイズ
    def get_email_options(self):
        options = super().get_email_options()
        options["url_generator"] = frontend_password_reset_url_generator
        return options


class CustomPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    def save(self):
        result = super().save()

        user = self.user

        if user and getattr(user, "email", None):
            EmailAddress.objects.update_or_create(
                user=user,
                email=user.email,
                defaults={
                    "verified": True,
                    "primary": True,
                },
            )

        return result


class CurrentUserSerializer(serializers.Serializer):
    email = serializers.EmailField(read_only=True)


class EmailChangeRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        request = self.context["request"]
        normalized_email = value.strip().lower()

        if normalized_email == request.user.email.lower():
            raise serializers.ValidationError("現在のメールアドレスは指定できません。")

        cleaned_email, _ = email_already_exists(
            normalized_email,
            user=request.user,
            always_raise=True,
        )
        return cleaned_email

    def save(self):
        request = self.context["request"]
        return EmailAddress.objects.add_new_email(
            request._request,
            request.user,
            self.validated_data["email"],
        )
