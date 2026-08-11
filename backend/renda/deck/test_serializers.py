from django.test import SimpleTestCase
from rest_framework import serializers

from renda.deck.serializers import DeckWriteSerializer


class DeckWriteSerializerTests(SimpleTestCase):
    """
    デッキ作成更新用シリアライザのテスト
    """

    def test_バリデーション時にnameの前後空白が除去されること(self):
        serializer = DeckWriteSerializer(
            data={
                "name": "  My Deck  ",
                "memo": "memo text",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "My Deck")

    def test_nameが空白のみの場合はバリデーションエラーになること(self):
        serializer = DeckWriteSerializer(
            data={
                "name": "   ",
                "memo": "",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_nameが255文字を超える場合はバリデーションエラーになること(self):
        serializer = DeckWriteSerializer()
        too_long = "a" * 256

        with self.assertRaises(serializers.ValidationError) as ctx:
            serializer.validate_name(too_long)

        self.assertEqual(ctx.exception.detail[0], "name must be <= 255 chars.")
