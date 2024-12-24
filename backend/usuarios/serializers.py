from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializador para el modelo de usuario."""

    class Meta:
        model = Usuario
        fields = ["id", "email", "nombre", "is_active"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Personalizar el token para incluir información adicional del usuario."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update(
            {
                "user_id": self.user.id,
                "email": self.user.email,
                "nombre": self.user.nombre,
            }
        )
        return data
