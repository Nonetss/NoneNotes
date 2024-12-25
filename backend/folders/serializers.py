from notas.models import Nota
from notas.serializers import NotaSerializer
from rest_framework import serializers

from .models import Folder


class FolderSerializer(serializers.ModelSerializer):
    subfolders = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()  # Campo para las notas en la carpeta

    class Meta:
        model = Folder
        fields = [
            "id",
            "nombre",
            "usuario",
            "parent",
            "fecha_creacion",
            "subfolders",
            "notes",  # Incluye las notas en los campos
        ]

    def get_subfolders(self, obj):
        # Serializar subcarpetas de forma recursiva
        subfolders = Folder.objects.filter(parent=obj)
        return FolderSerializer(subfolders, many=True).data

    def get_notes(self, obj):
        # Obtener las notas asociadas a la carpeta
        notes = Nota.objects.filter(folder=obj)
        return NotaSerializer(notes, many=True).data
