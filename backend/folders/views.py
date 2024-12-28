from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Folder
from .serializers import FolderSerializer


class FolderViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FolderSerializer

    def get_queryset(self):
        user = self.request.user
        if self.action == "list":
            # Solo carpetas raíz para la acción de listado
            return Folder.objects.filter(parent=None, usuario=user)
        else:
            # Todas las carpetas del usuario para otras acciones
            return Folder.objects.filter(usuario=user)

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado
        serializer.save(usuario=self.request.user)
