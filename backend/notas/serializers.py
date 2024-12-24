import os

from django.conf import settings
from rest_framework import serializers

from .models import Categoria, Folder, Nota, Tag


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "nombre"]


class FolderSerializer(serializers.ModelSerializer):
    subfolders = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ["id", "nombre", "parent", "fecha_creacion", "subfolders"]

    def get_subfolders(self, obj):
        return FolderSerializer(obj.subfolders.all(), many=True).data


class NotaSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    folder = FolderSerializer(read_only=True)
    folder_id = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.none(),  # Establecer un queryset vacío inicialmente
        source="folder",
        write_only=True,
        required=False,
    )
    hash = serializers.UUIDField(read_only=True)
    ruta = serializers.CharField(read_only=True)
    content = serializers.SerializerMethodField(read_only=True)  # Nuevo Campo

    class Meta:
        model = Nota
        fields = [
            "id",
            "usuario",
            "titulo",
            "fecha_creacion",
            "categoria",
            "tags",
            "folder",
            "folder_id",
            "hash",
            "ruta",
            "content",
        ]
        read_only_fields = ["usuario", "fecha_creacion", "hash", "ruta", "content"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Obtener el usuario del contexto del request y asignar dinámicamente el queryset
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            self.fields["folder_id"].queryset = Folder.objects.filter(
                usuario=request.user
            )

    def get_content(self, obj):
        """
        Lee el contenido del archivo Markdown asociado a la nota.
        """
        file_path = os.path.join(settings.MEDIA_ROOT, obj.ruta)
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except FileNotFoundError:
            return "Contenido no disponible. El archivo no se encontró."
        except Exception as e:
            return f"Error al leer el contenido: {str(e)}"

    def create(self, validated_data):
        folder = validated_data.pop("folder", None)
        usuario = self.context["request"].user
        nota = Nota.objects.create(usuario=usuario, folder=folder, **validated_data)
        return nota
