import uuid
from datetime import timedelta

from allauth.account.models import EmailAddress
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.views import PasswordChangeView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .exceptions import DemoCardLimitExceeded, DemoDeckLimitExceeded
from .models import Card, Deck
from .permissions import DemoLoginEnabledPermission, IsNotDemoUser
from .serializers import (
    CardReadSerializer,
    CardWriteSerializer,
    CurrentUserSerializer,
    DeckReadSerializer,
    DeckWriteSerializer,
    EmailChangeRequestSerializer,
    EmailTokenObtainPairSerializer,
)
from .throttles import DemoLoginThrottle


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class DemoLoginView(APIView):
    permission_classes = [DemoLoginEnabledPermission]
    throttle_classes = [DemoLoginThrottle]
    throttle_scope = "demo_login"

    def post(self, request, *args, **kwargs):
        demo_email = f"demo-{uuid.uuid4().hex}@example.com"

        user = get_user_model().objects.create_user(
            email=demo_email,
            password=None,
            is_demo=True,
            demo_expires_at=timezone.now() + timedelta(days=1),
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])

        EmailAddress.objects.create(
            user=user,
            email=user.email,
            verified=True,
            primary=True,
        )

        access_token, refresh_token = jwt_encode(user)
        return Response(
            {
                "access": str(access_token),
                "refresh": str(refresh_token),
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user


class EmailChangeRequestView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNotDemoUser]
    serializer_class = EmailChangeRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Verification e-mail sent."},
            status=status.HTTP_200_OK,
        )


class CustomPasswordChangeView(PasswordChangeView):
    permission_classes = [permissions.IsAuthenticated, IsNotDemoUser]


class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
