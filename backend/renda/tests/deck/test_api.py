from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from renda.models import Deck


User = get_user_model()


class DeckApiTests(APITestCase):
    """
    デッキAPIのテスト
    """
    def setUp(self):
        self.user = User.objects.create_user(
            email="u1@example.com",
            password="Passw0rd!",
        )
        EmailAddress.objects.create(
            user=self.user,
            email=self.user.email,
            verified=True,
            primary=True,
        )
        self.other_user = User.objects.create_user(
            email="u2@example.com",
            password="Passw0rd!",
        )
        self.own_deck = Deck.objects.create(user=self.user, name="my deck", memo="")
        self.other_deck = Deck.objects.create(
            user=self.other_user,
            name="other deck",
            memo="",
        )

    def _authenticate(self):
        response = self.client.post(
            reverse("rest_login"),
            {"email": "u1@example.com", "password": "Passw0rd!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )

    def test_認証済みユーザーは自分のデッキ一覧のみ取得できること(self):
        self._authenticate()

        response = self.client.get("/api/decks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [deck["id"] for deck in response.data]
        self.assertIn(self.own_deck.id, returned_ids)
        self.assertNotIn(self.other_deck.id, returned_ids)

    def test_認証済みユーザーが他人のデッキ詳細を取得できないこと(self):
        self._authenticate()

        response = self.client.get(f"/api/decks/{self.other_deck.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_認証済みユーザーが他人のデッキを更新できないこと(self):
        self._authenticate()

        response = self.client.patch(
            f"/api/decks/{self.other_deck.id}/",
            {"name": "hacked"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_認証済みユーザーが他人のデッキを削除できないこと(self):
        self._authenticate()

        response = self.client.delete(f"/api/decks/{self.other_deck.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
