from notas.models import Nota
from rest_framework import serializers

from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    notas = serializers.StringRelatedField(
        many=True, read_only=True, source="notas_set"
    )

    class Meta:
        model = Tag
        fields = ["id", "nombre", "notas"]
