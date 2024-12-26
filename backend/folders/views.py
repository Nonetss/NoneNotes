from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Folder
from .serializers import FolderSerializer


class FolderViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = FolderSerializer

    def get_queryset(self):
        # Filtrar solo las carpetas raíz asociadas al usuario autenticado
        return Folder.objects.filter(parent=None, usuario=self.request.user)

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado
        serializer.save(usuario=self.request.user)
