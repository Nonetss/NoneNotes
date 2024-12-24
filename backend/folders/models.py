from django.db import models

from usuarios.models import Usuario


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
        return self.get_full_path()

    class Meta:
        unique_together = ("nombre", "usuario", "parent")
        verbose_name = "Carpeta"
        verbose_name_plural = "Carpetas"

    def get_full_path(self):
        """
        Retorna la ruta completa de la carpeta desde la raíz.
        """
        path = [self.nombre]
        parent = self.parent
        while parent:
            path.insert(0, parent.nombre)
            parent = parent.parent
        return "/".join(path)

    def delete(self, *args, **kwargs):
        # Eliminar recursivamente todas las subcarpetas
        for subfolder in self.subfolders.all():
            subfolder.delete()
        super().delete(*args, **kwargs)
