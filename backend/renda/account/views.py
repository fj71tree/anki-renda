import uuid
from datetime import timedelta

from allauth.account.models import EmailAddress
from dj_rest_auth.jwt_auth import set_jwt_cookies, unset_jwt_cookies
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.views import PasswordChangeView
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from renda.permissions import DemoLoginEnabledPermission, IsNotDemoUser
from renda.throttles import DemoLoginThrottle

from .serializers import (
    CurrentUserSerializer,
    EmailChangeRequestSerializer,
    EmailTokenObtainPairSerializer,
)


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
        response = Response(
            {
                "access": str(access_token),
            },
            status=status.HTTP_200_OK,
        )

        set_jwt_cookies(
            response,
            access_token,
            refresh_token,
        )

        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        unset_jwt_cookies(response)
        return response


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        request.user.delete()

        response = Response(status=status.HTTP_204_NO_CONTENT)
        unset_jwt_cookies(response)

        return response


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
