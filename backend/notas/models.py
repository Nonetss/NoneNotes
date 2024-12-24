import os
import uuid

from django.conf import settings
from django.db import models

from categorias.models import Categoria
from folders.models import Folder
from tags.models import Tag
from usuarios.models import Usuario


class Nota(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="notas")
    titulo = models.CharField(max_length=255)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, related_name="notas"
    )
    tags = models.ManyToManyField(Tag, related_name="notas", blank=True)
    folder = models.ForeignKey(
        Folder, on_delete=models.CASCADE, null=True, blank=True, related_name="notas"
    )
    hash = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    ruta = models.CharField(max_length=255, blank=True)  # Ruta al archivo .md

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        """
        Guarda la nota y genera un archivo .md si no existe.
        """
        # Generar ruta de almacenamiento si no está definida
        if not self.ruta:
            # Definir el directorio base para almacenar archivos Markdown
            if self.folder:
                # Usar la ruta completa de la carpeta como base
                folder_path = os.path.join(
                    settings.MEDIA_ROOT, self.folder.get_full_path()
                )
            else:
                # Carpeta predeterminada si no se asocia una
                folder_path = os.path.join(settings.MEDIA_ROOT, "notas_md")

            os.makedirs(folder_path, exist_ok=True)

            # Generar un nombre de archivo único basado en el hash
            filename = f"{self.hash}.md"
            self.ruta = os.path.join(folder_path, filename)  # Ruta relativa

            # Crear el archivo .md con contenido inicial
            file_path = os.path.join(settings.MEDIA_ROOT, self.ruta)
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(f"# {self.titulo}\n\nContenido inicial...")

        super().save(*args, **kwargs)

    def move_to_folder(self, folder):
        """
        Mueve la nota a una nueva carpeta.
        """
        self.folder = folder
        self.ruta = None  # Reinicia la ruta para recalcular al guardar
        self.save()

    def delete(self, *args, **kwargs):
        """
        Elimina el archivo asociado en el sistema de archivos.
        """
        file_path = os.path.join(settings.MEDIA_ROOT, self.ruta)
        if os.path.exists(file_path):
            os.remove(file_path)
        super().delete(*args, **kwargs)
