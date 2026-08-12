import re
from urllib.parse import unquote

from allauth.account.forms import default_token_generator
from allauth.account.models import EmailAddress
from allauth.account.utils import user_pk_to_url_str
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class DjRestAuthTestMixin:
    """
    認証系テストに用いる共通関数
    """

    def create_verified_user(self, email="verified@example.com", password="Passw0rd!"):
        user = User.objects.create_user(email=email, password=password)
        EmailAddress.objects.create(
            user=user,
            email=user.email,
            verified=True,
            primary=True,
        )
        return user

    def extract_confirmation_key(self, body: str) -> str:
        match = re.search(r"/verify-email/([^?\s/]+)", body)
        self.assertIsNotNone(match)
        return unquote(match.group(1))


@override_settings(SIGNUP_ENABLED=True)
class RegistrationApiTests(APITestCase):
    """
    アカウント新規登録APIのテスト
    """

    def test_ユーザの登録後に確認メールが送信されること(self):
        response = self.client.post(
            reverse("rest_register"),
            {
                "email": "new-user@example.com",
                "password1": "Passw0rd!Passw0rd!",
                "password2": "Passw0rd!Passw0rd!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new-user@example.com").exists())
        self.assertEqual(len(mail.outbox), 1)

        new_user = User.objects.get(email="new-user@example.com")
        self.assertTrue(
            new_user.emailaddress_set.filter(
                email="new-user@example.com",
                verified=False,
            ).exists()
        )
        self.assertIn("http://localhost:5173/verify-email/", mail.outbox[0].body)
        self.assertNotIn("flow=email-change", mail.outbox[0].body)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)


@override_settings(SIGNUP_ENABLED=False)
class RegistrationDisabledApiTests(APITestCase):
    """
    アカウント新規登録機能を停止にした場合のAPIテスト
    """

    def test_環境変数でアカウントの新規作成を停止している場合に新規登録が行われないこと(
        self,
    ):
        response = self.client.post(
            reverse("rest_register"),
            {
                "email": "closed-user@example.com",
                "password1": "Passw0rd!Passw0rd!",
                "password2": "Passw0rd!Passw0rd!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data, {"detail": "新規登録は現在停止しています。"})
        self.assertFalse(User.objects.filter(email="closed-user@example.com").exists())
        self.assertEqual(len(mail.outbox), 0)


class PasswordResetApiTests(DjRestAuthTestMixin, APITestCase):
    """
    パスワードリセットAPIのテスト
    """

    def setUp(self):
        self.user = self.create_verified_user(
            email="reset-user@example.com",
            password="Passw0rd!",
        )

    def test_登録済みユーザーにパスワードリセットメールが送信されること(self):
        response = self.client.post(
            reverse("rest_password_reset"),
            {"email": "reset-user@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("http://localhost:5173/reset-password/", mail.outbox[0].body)

    def test_パスワード再設定後に新しいパスワードでログインできること(self):
        reset_response = self.client.post(
            reverse("rest_password_reset"),
            {"email": "reset-user@example.com"},
            format="json",
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            reverse("rest_password_reset_confirm"),
            {
                "uid": user_pk_to_url_str(self.user),
                "token": default_token_generator.make_token(self.user),
                "new_password1": "NewPassw0rd!",
                "new_password2": "NewPassw0rd!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        old_login_response = self.client.post(
            reverse("rest_login"),
            {"email": "reset-user@example.com", "password": "Passw0rd!"},
            format="json",
        )
        self.assertEqual(old_login_response.status_code, status.HTTP_400_BAD_REQUEST)

        new_login_response = self.client.post(
            reverse("rest_login"),
            {"email": "reset-user@example.com", "password": "NewPassw0rd!"},
            format="json",
        )

        self.assertEqual(new_login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", new_login_response.data)
        self.assertIn("refresh", new_login_response.data)

    def test_未認証かつ非primaryのメールアドレスにはパスワードリセットメールが送信されないこと(
        self,
    ):
        EmailAddress.objects.create(
            user=self.user,
            email="reset-pending@example.com",
            verified=False,
            primary=False,
        )

        response = self.client.post(
            reverse("rest_password_reset"),
            {"email": "reset-pending@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)


class CurrentUserApiTests(DjRestAuthTestMixin, APITestCase):
    """
    現在のログインユーザー取得APIのテスト
    """

    def test_認証済みユーザーが現在のユーザー情報を取得できること(self):
        user = self.create_verified_user(email="current@example.com")
        self.client.force_authenticate(user=user)

        response = self.client.get(reverse("auth_current_user"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"email": "current@example.com"})

    def test_未認証状態では現在のユーザー情報を取得できないこと(self):
        response = self.client.get(reverse("auth_current_user"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DjRestAuthLoginApiTests(DjRestAuthTestMixin, APITestCase):
    """
    ログインAPIのテスト
    """

    def test_メール認証済みユーザーがログインするとJWTトークンが返却されること(self):
        self.create_verified_user()

        response = self.client.post(
            reverse("rest_login"),
            {"email": "verified@example.com", "password": "Passw0rd!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_メール未認証ユーザーはログインできないこと(self):
        User.objects.create_user(
            email="unverified@example.com",
            password="Passw0rd!",
        )

        response = self.client.post(
            reverse("rest_login"),
            {"email": "unverified@example.com", "password": "Passw0rd!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_別の認証済みメールを持つユーザーでも未認証の変更先メールではログインできないこと(
        self,
    ):
        user = self.create_verified_user(
            email="login-current@example.com",
            password="Passw0rd!",
        )

        EmailAddress.objects.create(
            user=user,
            email="login-pending@example.com",
            verified=False,
            primary=False,
        )

        response = self.client.post(
            reverse("rest_login"),
            {
                "email": "login-pending@example.com",
                "password": "Passw0rd!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn(
            "メールアドレスまたはパスワードが正しくありません。",
            str(response.data),
        )


@override_settings(DEMO_LOGIN_ENABLED=True)
class DemoLoginApiTests(APITestCase):
    """
    デモログインAPIのテスト
    """

    def test_デモログインユーザーが作成されてJWTトークンが返却されること(self):
        response = self.client.post(reverse("auth_demo_login"), format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

        user = User.objects.get(email__endswith="@example.com", is_demo=True)
        self.assertIsNotNone(user.demo_expires_at)
        self.assertFalse(user.is_demo_expired)
        self.assertFalse(user.has_usable_password())

        email_address = EmailAddress.objects.get(user=user, email=user.email)
        self.assertTrue(email_address.verified)
        self.assertTrue(email_address.primary)


@override_settings(DEMO_LOGIN_ENABLED=False)
class DemoLoginDisabledApiTests(APITestCase):
    """
    デモログイン機能を停止にした場合のAPIテスト
    """

    def test_環境変数でデモログインを停止している場合にデモログインが行われないこと(
        self,
    ):
        response = self.client.post(reverse("auth_demo_login"), format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.data, {"detail": "デモログインは現在停止しています。"}
        )
        self.assertFalse(User.objects.filter(is_demo=True).exists())


class EmailChangeApiTests(DjRestAuthTestMixin, APITestCase):
    """
    メールアドレス変更APIのテスト
    """

    def setUp(self):
        self.user = self.create_verified_user(
            email="change-from@example.com",
            password="Passw0rd!",
        )
        self.client.force_authenticate(user=self.user)

    def test_メールアドレス変更を申請すると未認証メールアドレスが作成され確認メールが送信されること(
        self,
    ):
        response = self.client.post(
            reverse("auth_user_email_change"),
            {"email": "change-create@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"detail": "Verification e-mail sent."})
        self.assertTrue(
            EmailAddress.objects.filter(
                user=self.user,
                email="change-create@example.com",
                verified=False,
                primary=False,
            ).exists()
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("flow=email-change", mail.outbox[0].body)

    def test_既に使用中のメールアドレスには変更申請できないこと(self):
        self.create_verified_user(email="used@example.com")

        response = self.client.post(
            reverse("auth_user_email_change"),
            {"email": "used@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_未認証状態ではメールアドレス変更申請できないこと(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("auth_user_email_change"),
            {"email": "change-unauth@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_メールアドレス変更確認後にユーザーのメールアドレスが更新されること(self):
        request_response = self.client.post(
            reverse("auth_user_email_change"),
            {"email": "change-confirm@example.com"},
            format="json",
        )
        self.assertEqual(request_response.status_code, status.HTTP_200_OK)

        key = self.extract_confirmation_key(mail.outbox[0].body)
        confirm_response = self.client.post(
            reverse("rest_verify_email"),
            {"key": key},
            format="json",
        )

        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "change-confirm@example.com")

        new_email = EmailAddress.objects.get(
            user=self.user, email="change-confirm@example.com"
        )
        self.assertTrue(new_email.verified)
        self.assertTrue(new_email.primary)
        self.assertFalse(
            EmailAddress.objects.filter(
                user=self.user, email="change-from@example.com"
            ).exists()
        )


class PasswordChangeApiTests(DjRestAuthTestMixin, APITestCase):
    """
    パスワード変更APIのテスト
    """

    def setUp(self):
        self.user = self.create_verified_user(
            email="change-password@example.com",
            password="Passw0rd!",
        )
        self.client.force_authenticate(user=self.user)
        self.new_password = "RendaChangePass2026!"

    def test_パスワード変更後に新しいパスワードでログインできること(self):
        response = self.client.post(
            reverse("rest_password_change"),
            {
                "old_password": "Passw0rd!",
                "new_password1": self.new_password,
                "new_password2": self.new_password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.new_password))
        self.assertFalse(self.user.check_password("Passw0rd!"))

        self.client.force_authenticate(user=None)

        old_login_response = self.client.post(
            reverse("rest_login"),
            {"email": "change-password@example.com", "password": "Passw0rd!"},
            format="json",
        )
        self.assertEqual(old_login_response.status_code, status.HTTP_400_BAD_REQUEST)

        new_login_response = self.client.post(
            reverse("rest_login"),
            {"email": "change-password@example.com", "password": self.new_password},
            format="json",
        )
        self.assertEqual(new_login_response.status_code, status.HTTP_200_OK)

    def test_現在のパスワードが誤っている場合はパスワードの変更ができないこと(self):
        response = self.client.post(
            reverse("rest_password_change"),
            {
                "old_password": "WrongPassw0rd!",
                "new_password1": self.new_password,
                "new_password2": self.new_password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", response.data)

    def test_未認証状態ではパスワード変更できないこと(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            reverse("rest_password_change"),
            {
                "old_password": "Passw0rd!",
                "new_password1": self.new_password,
                "new_password2": self.new_password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DeleteAccountApiTests(DjRestAuthTestMixin, APITestCase):
    """
    アカウント削除APIのテスト
    """

    def setUp(self):
        self.user = self.create_verified_user(
            email="delete-account@example.com",
            password="Passw0rd!",
        )
        self.client.force_authenticate(user=self.user)

    def test_認証済みユーザーが自身のアカウントを削除できること(self):
        response = self.client.delete(reverse("auth_user_delete"))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())
        self.assertFalse(EmailAddress.objects.filter(user_id=self.user.pk).exists())

    def test_未認証状態ではアカウント削除できないこと(self):
        self.client.force_authenticate(user=None)

        response = self.client.delete(reverse("auth_user_delete"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
