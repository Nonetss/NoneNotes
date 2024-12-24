from django.contrib import admin

from .models import Categoria


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")  # Campos que se mostrarán en la lista del admin
    search_fields = ("nombre",)  # Habilitar búsqueda por nombre
    ordering = ("nombre",)  # Ordenar las categorías por nombre
