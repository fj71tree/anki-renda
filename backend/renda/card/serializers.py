from rest_framework import serializers

from renda.models import Card


class CardWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ["id", "question", "answer"]

    def validate_question(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("question is required.")
        return value

    def validate_answer(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("answer is required.")
        return value


class CardReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            "id",
            "question",
            "answer",
            "is_checked",
        ]
