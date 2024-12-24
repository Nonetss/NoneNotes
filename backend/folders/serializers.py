from rest_framework import serializers

from .models import Folder


class FolderSerializer(serializers.ModelSerializer):
    subfolders = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = [
            "id",
            "nombre",
            "usuario",
            "parent",
            "fecha_creacion",
            "subfolders",
        ]

    def get_subfolders(self, obj):
        # Serializar subcarpetas de forma recursiva
        subfolders = Folder.objects.filter(parent=obj)
        return FolderSerializer(subfolders, many=True).data
