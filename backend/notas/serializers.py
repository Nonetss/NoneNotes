# notas/serializers.py
import os

from categorias.models import Categoria
from categorias.serializers import CategoriaSerializer
from django.conf import settings
from folders.models import Folder
from rest_framework import serializers
from tags.models import Tag
from tags.serializers import TagSerializer

from .models import Nota


class NotaSerializer(serializers.ModelSerializer):
    # Campos de Entrada (Write-Only)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source="categoria",
        write_only=True,
        required=False,
        help_text="ID de la categoría.",
    )
    tags_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        source="tags",
        write_only=True,
        required=False,
        help_text="Lista de IDs de etiquetas.",
    )
    folder_id = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.none(),
        source="folder",
        write_only=True,
        required=False,
        help_text="ID de la carpeta.",
    )

    # Campos de Salida (Read-Only)
    categoria = CategoriaSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    folder = serializers.SerializerMethodField(read_only=True)
    hash = serializers.UUIDField(read_only=True)
    ruta = serializers.CharField(read_only=True)
    content = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Nota
        fields = [
            "id",
            "usuario",
            "titulo",
            "fecha_creacion",
            "categoria_id",
            "categoria",
            "tags_ids",
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
        # Configurar dinámicamente el queryset de `folder_id` basado en el usuario autenticado
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            self.fields["folder_id"].queryset = Folder.objects.filter(
                usuario=request.user
            )

    def get_folder(self, obj):
        """
        Devuelve la carpeta asociada.
        """
        if obj.folder:
            return {"id": obj.folder.id, "nombre": obj.folder.nombre}
        return None

    def get_content(self, obj):
        """
        Obtiene el contenido del archivo Markdown asociado a la nota.
        """
        if not obj.ruta:
            return "El archivo no tiene una ruta asociada."

        file_path = os.path.join(settings.MEDIA_ROOT, obj.ruta)
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except FileNotFoundError:
            return "Archivo no encontrado."
        except Exception as e:
            return f"Error al leer el archivo: {str(e)}"

    def create(self, validated_data):
        """
        Crea una nueva nota con los datos proporcionados.
        """
        folder = validated_data.pop("folder", None)
        categoria = validated_data.pop("categoria", None)
        tags = validated_data.pop("tags", [])

        usuario = self.context["request"].user  # Usuario autenticado

        nota = Nota.objects.create(
            usuario=usuario, folder=folder, categoria=categoria, **validated_data
        )

        if tags:
            nota.tags.set(tags)

        return nota

    def update(self, instance, validated_data):
        """
        Actualiza una nota y su archivo Markdown asociado.
        """
        instance.titulo = validated_data.get("titulo", instance.titulo)
        folder = validated_data.get("folder", None)

        # Si se cambia la carpeta, mover el archivo
        if folder and folder != instance.folder:
            instance.move_to_folder(folder)

        # Actualizar categoría si se proporciona
        if "categoria" in validated_data:
            instance.categoria = validated_data.get("categoria")

        # Actualizar etiquetas si se proporcionan
        if "tags" in validated_data:
            tags = validated_data.get("tags")
            instance.tags.set(tags)

        # Guardar cambios en el modelo
        instance.save()

        # Actualizar el contenido del archivo si cambia el título
        if instance.ruta:
            file_path = os.path.join(settings.MEDIA_ROOT, instance.ruta)
            try:
                with open(file_path, "w", encoding="utf-8") as file:
                    file.write(f"# {instance.titulo}\n\nContenido actualizado.")
            except Exception as e:
                raise serializers.ValidationError(
                    f"Error al actualizar el archivo Markdown: {str(e)}"
                )

        return instance
