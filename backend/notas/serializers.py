import os

from django.conf import settings
from rest_framework import serializers

from categorias.models import Categoria
from folders.models import Folder
from tags.models import Tag

from .models import Nota


class NotaSerializer(serializers.ModelSerializer):
    categoria = serializers.SerializerMethodField(read_only=True)  # Leer categoría
    tags = serializers.SerializerMethodField(read_only=True)  # Leer etiquetas
    folder = serializers.SerializerMethodField(read_only=True)  # Carpeta anidada
    folder_id = serializers.PrimaryKeyRelatedField(
        queryset=Folder.objects.none(),  # Dinámicamente configurado
        source="folder",  # Asocia al campo `folder`
        write_only=True,
        required=False,
    )
    hash = serializers.UUIDField(read_only=True)  # Hash único
    ruta = serializers.CharField(read_only=True)  # Ruta del archivo
    content = serializers.SerializerMethodField(read_only=True)  # Contenido del archivo

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
        # Configurar dinámicamente el queryset de `folder_id` basado en el usuario autenticado
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            self.fields["folder_id"].queryset = Folder.objects.filter(
                usuario=request.user
            )

    def get_categoria(self, obj):
        """
        Devuelve la categoría asociada.
        """
        return (
            {"id": obj.categoria.id, "nombre": obj.categoria.nombre}
            if obj.categoria
            else None
        )

    def get_tags(self, obj):
        """
        Devuelve las etiquetas asociadas.
        """
        return [{"id": tag.id, "nombre": tag.nombre} for tag in obj.tags.all()]

    def get_folder(self, obj):
        """
        Devuelve la carpeta asociada.
        """
        return (
            {"id": obj.folder.id, "nombre": obj.folder.nombre} if obj.folder else None
        )

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
        Crea una nueva nota con su archivo Markdown asociado.
        """
        folder = validated_data.pop("folder", None)
        usuario = self.context["request"].user
        nota = Nota.objects.create(usuario=usuario, folder=folder, **validated_data)
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
