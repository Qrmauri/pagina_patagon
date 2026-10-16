from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = "Crea un administrador con ADMIN_PASSWORD; conserva las cuentas existentes."

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USER", "admin")
        password = os.environ.get("ADMIN_PASSWORD")
        email = os.environ.get("ADMIN_EMAIL", "admin@patagonstore.cl")

        user = User.objects.filter(username=username).first()
        if user is not None:
            if not (user.is_staff and user.is_superuser):
                raise CommandError('La cuenta existente no es superusuario. No se modificarán sus permisos.')
            self.stdout.write(self.style.SUCCESS(f"Superusuario '{username}' existente; cuenta conservada."))
            return
        if not password or not password.strip():
            raise CommandError('Define ADMIN_PASSWORD o crea el administrador con manage.py createsuperuser.')
        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Superusuario '{username}' creado exitosamente."))
