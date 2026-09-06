from rest_framework import serializers

from renda.models import Card


class CardWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ["id", "question", "answer", "is_checked"]


class CardReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            "id",
            "question",
            "answer",
            "is_checked",
        ]
