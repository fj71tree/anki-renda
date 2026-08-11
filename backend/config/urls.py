from dj_rest_auth.jwt_auth import get_refresh_view
from dj_rest_auth.registration.views import RegisterView, VerifyEmailView
from dj_rest_auth.views import LoginView, PasswordResetConfirmView, PasswordResetView
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

from renda.views import (
    CurrentUserView,
    CustomPasswordChangeView,
    DeleteAccountView,
    DemoLoginView,
    EmailChangeRequestView,
)

urlpatterns = [
    # アカウント登録
    path("api/auth/registration/", RegisterView.as_view(), name="rest_register"),
    path(
        "api/auth/registration/verify-email/",
        VerifyEmailView.as_view(),
        name="rest_verify_email",
    ),
    # パスワードリセット
    path(
        "api/auth/password/reset/",
        PasswordResetView.as_view(),
        name="rest_password_reset",
    ),
    path(
        "api/auth/password/reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="rest_password_reset_confirm",
    ),
    # allauth が内部で reverse() するための URL
    # SPAでは利用しないが URL 名は必要
    path(
        "api/auth/account-email-verification-sent/",
        TemplateView.as_view(),
        name="account_email_verification_sent",
    ),
    # ログイン
    path("api/auth/login/", LoginView.as_view(), name="rest_login"),
    # トークンリフレッシュ
    path(
        "api/auth/token/refresh/",
        get_refresh_view().as_view(),
        name="token_refresh",
    ),
    # パスワード変更
    path(
        "api/auth/password/change/",
        CustomPasswordChangeView.as_view(),
        name="rest_password_change",
    ),
    # デモログイン
    path("api/auth/demo-login/", DemoLoginView.as_view(), name="auth_demo_login"),
    # アカウント設定
    path("api/auth/me/", CurrentUserView.as_view(), name="auth_current_user"),
    path(
        "api/auth/me/email/",
        EmailChangeRequestView.as_view(),
        name="auth_user_email_change",
    ),
    path("api/auth/me/delete/", DeleteAccountView.as_view(), name="auth_user_delete"),
    # renda
    path("api/", include("renda.urls")),
]

if settings.DEBUG:
    urlpatterns += [
        path("admin/", admin.site.urls),
        path("api-auth/", include("rest_framework.urls")),
    ]
