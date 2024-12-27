import os

from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Nota
from .serializers import NotaSerializer


class NotaContentUpdateView(APIView):
    """
    Vista para actualizar el contenido del archivo Markdown de una nota.
    """

    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk, format=None):
        try:
            # Obtener la nota asociada al usuario autenticado
            nota = Nota.objects.get(pk=pk, usuario=request.user)
        except Nota.DoesNotExist:
            return Response(
                {"detail": "Nota no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

        # Obtener el nuevo contenido del archivo Markdown
        content = request.data.get("content")
        if content is None:
            return Response(
                {"detail": "Falta el campo 'content'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Actualizar el archivo en el sistema de archivos
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


class NotaListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear notas.
    """

    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtrar las notas del usuario autenticado
        return Nota.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # Asignar el usuario autenticado a la nueva nota
        serializer.save()


class NotaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para recuperar, actualizar y eliminar una nota específica.
    """

    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtrar las notas del usuario autenticado
        return Nota.objects.filter(usuario=self.request.user)

    def perform_update(self, serializer):
        # Guardar los cambios al actualizar la nota
        serializer.save()

    def perform_destroy(self, instance):
        """
        Elimina la nota y el archivo Markdown asociado.
        """
        file_path = os.path.join(settings.MEDIA_ROOT, instance.ruta)
        if instance.ruta and os.path.exists(file_path):
            os.remove(file_path)  # Eliminar el archivo del sistema de archivos
        instance.delete()
