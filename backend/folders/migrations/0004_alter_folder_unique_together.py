# Generated by Django 5.1.4 on 2024-12-26 14:28

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('folders', '0003_alter_folder_unique_together'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='folder',
            unique_together={('nombre', 'usuario', 'parent')},
        ),
    ]