from django.urls import path

from .views import CustomTokenObtainPairView, UsuarioListCreateView

urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("usuarios/", UsuarioListCreateView.as_view(), name="usuario_list_create"),
]
