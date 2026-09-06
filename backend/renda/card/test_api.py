from django.contrib.auth import get_user_model
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
        self.client.force_authenticate(user=self.user)

    # 一覧取得

    def test_認証済みユーザーが自分のカード一覧を取得できること(self):
        self._authenticate()

        response = self.client.get(f"/api/decks/{self.own_deck.id}/cards/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.own_card.id)
        self.assertEqual(response.data[0]["question"], "my question")
        self.assertEqual(response.data[0]["answer"], "my answer")

    def test_認証済みユーザーが他人のカード一覧を取得できないこと(self):
        self._authenticate()

        response = self.client.get(f"/api/decks/{self.other_deck.id}/cards/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    # 詳細取得

    def test_認証済みユーザーが自分のカード詳細を取得できること(self):
        self._authenticate()

        response = self.client.get(
            f"/api/decks/{self.own_deck.id}/cards/{self.own_card.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.own_card.id)
        self.assertEqual(response.data["question"], "my question")
        self.assertEqual(response.data["answer"], "my answer")

    def test_認証済みユーザーが他人のカード詳細を取得できないこと(self):
        self._authenticate()

        response = self.client.get(
            f"/api/decks/{self.other_deck.id}/cards/{self.other_card.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 作成

    def test_認証済みユーザーが自分のデッキにカードを作成できること(self):
        self._authenticate()

        response = self.client.post(
            f"/api/decks/{self.own_deck.id}/cards/",
            {
                "question": "new question",
                "answer": "new answer",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        card = Card.objects.get(id=response.data["id"])

        self.assertEqual(card.deck, self.own_deck)
        self.assertEqual(card.question, "new question")
        self.assertEqual(card.answer, "new answer")

    def test_認証済みユーザーが他人のデッキにカードを作成できないこと(self):
        self._authenticate()

        response = self.client.post(
            f"/api/decks/{self.other_deck.id}/cards/",
            {"question": "x", "answer": "y"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 更新

    def test_認証済みユーザーが自分のカードの問題と答えを更新できること(self):
        self._authenticate()

        response = self.client.patch(
            f"/api/decks/{self.own_deck.id}/cards/{self.own_card.id}/",
            {
                "question": "updated question",
                "answer": "updated answer",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.own_card.refresh_from_db()

        self.assertEqual(self.own_card.question, "updated question")
        self.assertEqual(self.own_card.answer, "updated answer")

    def test_認証済みユーザーが自分のカードのチェック状態のみ更新できること(self):
        self._authenticate()

        response = self.client.patch(
            f"/api/decks/{self.own_deck.id}/cards/{self.own_card.id}/",
            {
                "is_checked": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.own_card.refresh_from_db()

        self.assertTrue(self.own_card.is_checked)
        self.assertEqual(self.own_card.question, "my question")
        self.assertEqual(self.own_card.answer, "my answer")

    def test_認証済みユーザーが他人のカードを更新できないこと(self):
        self._authenticate()

        response = self.client.patch(
            f"/api/decks/{self.other_deck.id}/cards/{self.other_card.id}/",
            {"answer": "hacked"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 削除

    def test_認証済みユーザーが自分のカードを削除できること(self):
        self._authenticate()

        response = self.client.delete(
            f"/api/decks/{self.own_deck.id}/cards/{self.own_card.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Card.objects.filter(id=self.own_card.id).exists())

    def test_認証済みユーザーが他人のカードを削除できないこと(self):
        self._authenticate()

        response = self.client.delete(
            f"/api/decks/{self.other_deck.id}/cards/{self.other_card.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
