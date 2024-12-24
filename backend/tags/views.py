from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from notas.models import Nota
from notas.serializers import NotaSerializer

from .models import Tag
from .serializers import TagSerializer


class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    @action(detail=True, methods=["get"])
    def relacionadas(self, request, pk=None):
        tag = self.get_object()
        notas = Nota.objects.filter(tags=tag)  # Filtrar notas relacionadas con el tag
        serializer = NotaSerializer(notas, many=True)
        return Response(serializer.data)
