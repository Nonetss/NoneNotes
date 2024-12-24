from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .serializers import CustomTokenObtainPairSerializer, UsuarioSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UsuarioListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = []
