from django.contrib import admin

from .models import Nota


@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "titulo",
        "usuario",
        "fecha_creacion",
        "categoria",
        "folder",
        "hash",
    )
    search_fields = ("titulo", "hash")
    list_filter = ("fecha_creacion", "categoria", "tags", "folder")
    readonly_fields = ("ruta", "hash")
