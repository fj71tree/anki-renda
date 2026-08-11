from rest_framework import permissions, viewsets

from renda.deck.serializers import (
    DeckReadSerializer,
    DeckWriteSerializer,
)
from renda.exceptions import DemoDeckLimitExceeded
from renda.models import Deck

DEMO_USER_DECK_LIMIT = 5


class DeckViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Deck.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return DeckReadSerializer
        return DeckWriteSerializer

    def perform_create(self, serializer):
        user = self.request.user

        if user.is_demo and user.decks.count() >= DEMO_USER_DECK_LIMIT:
            raise DemoDeckLimitExceeded()

        serializer.save(user=self.request.user)
