from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.utils.translation import gettext_lazy as _


class UsuarioManager(BaseUserManager):
    """Manager para usuarios personalizados."""

    def create_user(self, email, password=None, **extra_fields):
        """Crear y devolver un usuario regular."""
        if not email:
            raise ValueError(_("El correo electrónico es obligatorio"))
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crear y devolver un superusuario."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("El superusuario debe tener is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("El superusuario debe tener is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Modelo de usuario personalizado con email en lugar de username."""

    email = models.EmailField(_("Correo electrónico"), unique=True)
    nombre = models.CharField(_("Nombre"), max_length=150, blank=True)
    is_active = models.BooleanField(_("Activo"), default=True)
    is_staff = models.BooleanField(_("Es staff"), default=False)
    date_joined = models.DateTimeField(_("Fecha de registro"), auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("usuario")
        verbose_name_plural = _("usuarios")

    def __str__(self):
        return self.email
