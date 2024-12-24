from rest_framework import serializers

from notas.models import Nota  # Importar el modelo relacionado

from .models import Categoria


class NotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = [
            "id",
            "titulo",
            "folder",
        ]


class CategoriaSerializer(serializers.ModelSerializer):
    notas = NotaSerializer(many=True, read_only=True, source="notas_set")

    class Meta:
        model = Categoria
        fields = ["id", "nombre", "notas"]
