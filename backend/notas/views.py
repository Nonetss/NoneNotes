import os

from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Categoria, Folder, Nota, Tag
from .serializers import (
    CategoriaSerializer,
    FolderSerializer,
    NotaSerializer,
    TagSerializer,
)


class NotaContentUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk, format=None):
        try:
            nota = Nota.objects.get(pk=pk, usuario=request.user)
        except Nota.DoesNotExist:
            return Response(
                {"detail": "Nota no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

        content = request.data.get("content")
        if content is None:
            return Response(
                {"detail": "Falta el campo 'content'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_path = os.path.join(settings.MEDIA_ROOT, nota.ruta)
        try:
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(content)
        except Exception as e:
            return Response(
                {"detail": f"Error al actualizar el contenido: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "Contenido actualizado correctamente."},
            status=status.HTTP_200_OK,
        )


class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]


class FolderListCreateView(generics.ListCreateAPIView):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(usuario=self.request.user, parent=None)

    def perform_create(self, serializer):
        parent = serializer.validated_data.get("parent")
        if parent and parent.usuario != self.request.user:
            raise serializers.ValidationError(
                "No puedes asignar una carpeta que no te pertenece."
            )
        serializer.save(usuario=self.request.user)


class NotaListCreateView(generics.ListCreateAPIView):
    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Nota.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save()  # Eliminado: usuario=self.request.user


class NotaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Nota.objects.filter(usuario=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        import os

        if instance.ruta and os.path.exists(
            os.path.join(settings.MEDIA_ROOT, instance.ruta)
        ):
            os.remove(os.path.join(settings.MEDIA_ROOT, instance.ruta))
        instance.delete()
