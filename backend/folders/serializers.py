from notas.models import Nota
from notas.serializers import NotaSerializer
from rest_framework import serializers

from .models import Folder


class FolderSerializer(serializers.ModelSerializer):
    subfolders = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()  # Campo para las notas en la carpeta
    usuario = serializers.PrimaryKeyRelatedField(
        read_only=True
    )  # Marcar como solo lectura

    class Meta:
        model = Folder
        fields = [
            "id",
            "nombre",
            "usuario",
            "parent",
            "fecha_creacion",
            "subfolders",
            "notes",
        ]

    def get_subfolders(self, obj):
        # Serializar subcarpetas de forma recursiva
        subfolders = Folder.objects.filter(parent=obj, usuario=obj.usuario)
        return FolderSerializer(subfolders, many=True).data

    def get_notes(self, obj):
        # Obtener las notas asociadas a la carpeta
        notes = Nota.objects.filter(folder=obj, usuario=obj.usuario)
        return NotaSerializer(notes, many=True).data
