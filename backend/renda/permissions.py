from django.conf import settings
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission


class SignupEnabledPermission(BasePermission):
    message = "新規登録は現在停止しています。"

    def has_permission(self, request, view):
        if not settings.SIGNUP_ENABLED:
            raise PermissionDenied(self.message)
        return True


class DemoLoginEnabledPermission(BasePermission):
    message = "デモログインは現在停止しています。"

    def has_permission(self, request, view):
        if not settings.DEMO_LOGIN_ENABLED:
            raise PermissionDenied(self.message)
        return True


class IsNotDemoUser(BasePermission):
    message = "デモユーザーはこの操作を実行できません。"

    def has_permission(self, request, view):
        return not request.user.is_demo
