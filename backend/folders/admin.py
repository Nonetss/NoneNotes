from django.contrib import admin

from .models import Folder


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "usuario", "parent", "fecha_creacion")
    search_fields = ("nombre",)
    list_filter = ("usuario", "parent")
    ordering = ("nombre",)
