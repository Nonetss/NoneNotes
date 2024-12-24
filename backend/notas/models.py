import os
import uuid

from django.conf import settings
from django.db import models

from usuarios.models import Usuario


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre


class Tag(models.Model):
    nombre = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre


class Folder(models.Model):
    nombre = models.CharField(max_length=100)
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name="folders"
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="subfolders",
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    class Meta:
        unique_together = ("nombre", "usuario", "parent")
        verbose_name = "Carpeta"
        verbose_name_plural = "Carpetas"

    def get_full_path(self):
        path = [self.nombre]
        parent = self.parent
        while parent:
            path.insert(0, parent.nombre)
            parent = parent.parent
        return "/".join(path)


class Nota(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="notas")
    titulo = models.CharField(max_length=255)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, related_name="notas"
    )
    tags = models.ManyToManyField(Tag, related_name="notas", blank=True)
    folder = models.ForeignKey(
        Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name="notas"
    )
    hash = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    ruta = models.CharField(max_length=255, blank=True)  # Ruta al archivo .md

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        if not self.ruta:
            # Definir el directorio base para almacenar archivos Markdown
            directory = os.path.join(settings.MEDIA_ROOT, "notas_md")
            os.makedirs(directory, exist_ok=True)

            # Generar un nombre de archivo único basado en el hash
            filename = f"{self.hash}.md"
            self.ruta = os.path.join("notas_md", filename)  # Ruta relativa

            # Crear el archivo .md con contenido inicial
            file_path = os.path.join(settings.MEDIA_ROOT, self.ruta)
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(f"# {self.titulo}\n\nContenido inicial...")

        super().save(*args, **kwargs)
