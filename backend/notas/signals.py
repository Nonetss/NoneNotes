import os

from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Nota


@receiver(post_delete, sender=Nota)
def delete_markdown_file(sender, instance, **kwargs):
    if instance.ruta and os.path.exists(instance.ruta):
        os.remove(instance.ruta)
