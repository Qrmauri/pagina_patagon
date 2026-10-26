from io import StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from .models import Product


class CatalogReadinessTests(TestCase):
    def test_empty_catalog_is_not_ready(self):
        with self.assertRaisesMessage(CommandError, 'vacío'):
            call_command('audit_catalog', stdout=StringIO())

    def test_examples_are_reported_without_deleting_or_updating(self):
        product = Product.objects.create(title='Cuaderno escolar · ejemplo', price=2490, stock=10, description='Prueba')
        with self.assertRaisesMessage(CommandError, 'requieren revisión'):
            call_command('audit_catalog', stdout=StringIO())
        product.refresh_from_db()
        self.assertEqual(product.stock, 10)
        self.assertEqual(Product.objects.count(), 1)

    def test_complete_article_passes_technical_validation(self):
        Product.objects.create(title='Cuaderno confirmado', price=2500, stock=0, description='Cuaderno de 100 hojas', image='https://fotos.tienda.cl/cuaderno.jpg')
        output = StringIO()
        call_command('audit_catalog', stdout=output)
        self.assertIn('Validación técnica', output.getvalue())
