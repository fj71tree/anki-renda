from rest_framework import serializers

from renda.models import Deck


class DeckWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ["id", "name", "memo"]

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("name is required.")
        if len(value) > 255:
            raise serializers.ValidationError("name must be <= 255 chars.")
        return value


class DeckReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ["id", "name", "memo"]
