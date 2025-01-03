# Generated by Django 5.1.4 on 2024-12-24 20:09

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('folders', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='folder',
            name='usuario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='folders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='folder',
            unique_together={('nombre', 'usuario', 'parent')},
        ),
    ]
