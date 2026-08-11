from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets

from renda.card.serializers import (
    CardReadSerializer,
    CardWriteSerializer,
)
from renda.exceptions import DemoCardLimitExceeded
from renda.models import Card, Deck

CARD_USER_DECK_LIMIT = 30


class CardViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        deck_id = self.kwargs["deck_id"]

        return Card.objects.filter(
            deck_id=deck_id,
            deck__user=self.request.user,
        ).order_by("created_at")

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return CardReadSerializer
        return CardWriteSerializer

    def perform_create(self, serializer):
        deck = get_object_or_404(
            Deck,
            id=self.kwargs["deck_id"],
            user=self.request.user,
        )

        user = self.request.user
        if user.is_demo and deck.cards.count() >= CARD_USER_DECK_LIMIT:
            raise DemoCardLimitExceeded()

        serializer.save(deck=deck)

    def get_object(self):
        return get_object_or_404(
            self.get_queryset(),
            pk=self.kwargs["pk"],
        )
