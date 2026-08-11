from rest_framework.throttling import ScopedRateThrottle


class DemoLoginThrottle(ScopedRateThrottle):
    """
    Azure Static Web Apps から App Service に転送される構成では、
    X-Forwarded-For の先頭にクライアントIP、後続にプロキシ側のIPが入る。
    DRF標準の識別子ではポート番号まで含まれてしまうため、
    デモログインのスロットリングでは先頭のIPからポート番号を除去して使用する。
    """

    def get_ident(self, request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")

        if xff:
            # 先頭をクライアントIPとして使う
            client = xff.split(",")[0].strip()
        else:
            client = request.META.get("REMOTE_ADDR", "")

        # IPv4:port の port を除去
        if client.count(":") == 1:
            client = client.rsplit(":", 1)[0]

        return client

    def allow_request(self, request, view):
        allowed = super().allow_request(request, view)

        print("scope:", getattr(self, "scope", None))
        print("rate:", getattr(self, "rate", None))
        print("ident:", self.get_ident(request))
        print("key:", self.get_cache_key(request, view))
        print("allowed:", allowed)

        return allowed
