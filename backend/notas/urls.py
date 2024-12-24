from django.urls import path

from .views import (
    CategoriaListCreateView,
    FolderListCreateView,
    NotaContentUpdateView,
    NotaListCreateView,
    NotaRetrieveUpdateDestroyView,
    TagListCreateView,
)

urlpatterns = [
    path(
        "categorias/", CategoriaListCreateView.as_view(), name="categoria_list_create"
    ),
    path("tags/", TagListCreateView.as_view(), name="tag_list_create"),
    path("carpetas/", FolderListCreateView.as_view(), name="folder_list_create"),
    path("notas/", NotaListCreateView.as_view(), name="nota_list_create"),
    path(
        "notas/<int:pk>/", NotaRetrieveUpdateDestroyView.as_view(), name="nota_detail"
    ),
    path(
        "notas/<int:pk>/content/",
        NotaContentUpdateView.as_view(),
        name="nota_content_update",
    ),  # Nueva ruta
]
