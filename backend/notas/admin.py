from django.contrib import admin

from .models import Categoria, Folder, Nota, Tag


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")
    search_fields = ("nombre",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")
    search_fields = ("nombre",)


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "usuario", "parent", "fecha_creacion")
    search_fields = ("nombre",)
    list_filter = ("usuario", "fecha_creacion")


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
