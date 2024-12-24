from django.urls import path

from .views import (
    NotaContentUpdateView,
    NotaListCreateView,
    NotaRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("notas/", NotaListCreateView.as_view(), name="nota-list-create"),
    path(
        "notas/<int:pk>/", NotaRetrieveUpdateDestroyView.as_view(), name="nota-detail"
    ),
    path(
        "notas/<int:pk>/content/",
        NotaContentUpdateView.as_view(),
        name="nota-content-update",
    ),
]
