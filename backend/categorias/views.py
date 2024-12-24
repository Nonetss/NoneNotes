from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Categoria
from .serializers import CategoriaSerializer


class CategoriaViewSet(ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    @action(detail=True, methods=["get"])
    def relacionadas(self, request, pk=None):
        # Obtener la categoría
        categoria = self.get_object()

        # Obtener las notas relacionadas con esta categoría
        notas = Nota.objects.filter(categoria=categoria)

        # Serializar las notas y devolver la respuesta
        serializer = NotaSerializer(notas, many=True)
        return Response(serializer.data)
