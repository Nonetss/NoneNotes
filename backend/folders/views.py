from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Folder
from .serializers import FolderSerializer


class FolderViewSet(ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtrar solo las carpetas raíz asociadas al usuario autenticado
        return Folder.objects.filter(parent=None, usuario=self.request.user)
