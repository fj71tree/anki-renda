from rest_framework.exceptions import APIException


class DemoDeckLimitExceeded(APIException):
    status_code = 403
    default_detail = "デモユーザーが作成できるデッキ数の上限に達しました。"
    default_code = "demo_deck_limit_exceeded"


class DemoCardLimitExceeded(APIException):
    status_code = 403
    default_detail = "デモユーザーが作成できるカード数の上限に達しました。"
    default_code = "demo_card_limit_exceeded"
