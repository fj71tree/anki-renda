from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from renda.models import Card, Deck


User = get_user_model()


class CardApiTests(APITestCase):
    """
    カードAPIのテスト
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
        self.own_card = Card.objects.create(
            deck=self.own_deck,
            question="my question",
            answer="my answer",
        )
        self.other_card = Card.objects.create(
            deck=self.other_deck,
            question="other question",
            answer="other answer",
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

    def test_認証済みユーザーが他人のカード一覧を取得できないこと(self):
        self._authenticate()

        response = self.client.get(f"/api/decks/{self.other_deck.id}/cards/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_認証済みユーザーが他人のカード詳細を取得できないこと(self):
        self._authenticate()

        response = self.client.get(
            f"/api/decks/{self.other_deck.id}/cards/{self.other_card.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_認証済みユーザーが他人のデッキにカードを作成できないこと(self):
        self._authenticate()

        response = self.client.post(
            f"/api/decks/{self.other_deck.id}/cards/",
            {"question": "x", "answer": "y"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_認証済みユーザーが他人のカードを更新できないこと(self):
        self._authenticate()

        response = self.client.patch(
            f"/api/decks/{self.other_deck.id}/cards/{self.other_card.id}/",
            {"answer": "hacked"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_認証済みユーザーが他人のカードを削除できないこと(self):
        self._authenticate()

        response = self.client.delete(
            f"/api/decks/{self.other_deck.id}/cards/{self.other_card.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
