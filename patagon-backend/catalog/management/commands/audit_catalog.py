from urllib.parse import urlsplit

from django.core.management.base import BaseCommand, CommandError

from catalog.models import Product
from catalog.views import INITIAL_PRODUCTS_DATA


class Command(BaseCommand):
    help = 'Revisa el catálogo antes de publicar. No cambia ni elimina productos.'

    def handle(self, *args, **options):
        demo_titles = {item['title'] for item in INITIAL_PRODUCTS_DATA}
        products = Product.objects.all()
        if not products.exists():
            raise CommandError('El catálogo está vacío. Solicita y carga los productos confirmados por el cliente.')
        pending = 0
        for product in products.iterator():
            issues = []
            if product.title in demo_titles or 'ejemplo' in product.title.casefold():
                issues.append('revisar producto de ejemplo')
            if not product.description.strip():
                issues.append('falta descripción')
            if product.price <= 0:
                issues.append('falta precio de venta positivo')
            if not product.image_file:
                image = urlsplit(product.image or '')
                if image.scheme != 'https' or not image.netloc:
                    issues.append('falta fotografía propia subida o URL HTTPS')
                elif image.hostname in ['images.unsplash.com', 'example.com']:
                    issues.append('fotografía de ejemplo; confirmar foto del artículo')
            if issues:
                pending += 1
                self.stdout.write(f'Producto {product.pk} — {product.title}: {"; ".join(issues)}')
        if pending:
            raise CommandError(f'{pending} productos requieren revisión. No se modificó el catálogo.')
        self.stdout.write(self.style.SUCCESS(
            'Validación técnica del catálogo aprobada. El cliente debe confirmar fotos, precios y stock antes de vender.'
        ))
