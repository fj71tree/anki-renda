from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeckViewSet, CardViewSet


router = DefaultRouter()
router.register(r"decks", DeckViewSet, basename="deck")

card_list = CardViewSet.as_view({
    "get": "list",
    "post": "create",
})

card_detail = CardViewSet.as_view({
    "get": "retrieve",
    "patch": "partial_update",
    "put": "update",
    "delete": "destroy",
})

urlpatterns = [
    path("decks/<int:deck_id>/cards/", card_list, name="card-list"),
    path("decks/<int:deck_id>/cards/<int:pk>/", card_detail, name="card-detail"),
    path("", include(router.urls)),
]
