from rest_framework import serializers

from notas.models import Nota

from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    notas = serializers.StringRelatedField(
        many=True, read_only=True, source="notas_set"
    )

    class Meta:
        model = Tag
        fields = ["id", "nombre", "notas"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "nombre"]
        read_only_fields = ["id"]  # El ID no será modificable
