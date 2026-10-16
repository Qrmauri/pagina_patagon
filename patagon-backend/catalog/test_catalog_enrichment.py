from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from .models import Product


class CatalogEnrichmentTests(APITestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(username='catalog-admin', password='test-only', is_staff=True)

    def test_only_staff_can_save_metadata_and_contact(self):
        payload = dict(title='Cuaderno', category='libros', price=2000, stock=3, description='Cuaderno escolar',
                       shopping_needs=['escolar'], gallery=['https://example.com/photo.png'],
                       specifications={'dimensions': '20 × 25 cm', 'contents': '1 cuaderno'})
        self.assertIn(self.client.post('/api/products/', payload, format='json').status_code, [401, 403])
        self.assertIn(self.client.put('/api/store-settings/', {'email': 'hola@example.cl'}, format='json').status_code, [401, 403])
        self.client.force_authenticate(self.admin)
        saved = self.client.post('/api/products/', payload, format='json')
        self.assertEqual(saved.status_code, 201, saved.data)
        self.assertEqual(saved.data['shopping_needs'], ['escolar'])
        self.assertEqual(saved.data['specifications']['contents'], '1 cuaderno')
        settings = self.client.put('/api/store-settings/', {'email': 'hola@example.cl', 'pickup': 'Retiro previa coordinación'}, format='json')
        self.assertEqual(settings.status_code, 200, settings.data)
        self.client.force_authenticate(None)
        public = self.client.get('/api/store-settings/')
        self.assertEqual(public.status_code, 200)
        self.assertEqual(public.data['email'], 'hola@example.cl')
        self.assertEqual(public.data['pickup'], 'Retiro previa coordinación')

    def test_rejects_unsafe_images_unknown_tags_and_invalid_contact(self):
        self.client.force_authenticate(self.admin)
        base = dict(title='Prueba', price=2000, description='Prueba')
        for extra in [{'gallery': ['javascript:alert(1)']}, {'shopping_needs': ['inexistente']},
                      {'specifications': {'secret': 'dato'}}, {'gallery': ['https://example.com/a.png'] * 9}]:
            self.assertEqual(self.client.post('/api/products/', {**base, **extra}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/store-settings/', {'whatsapp': 'javascript:test'}, format='json').status_code, 400)

    def test_existing_products_remain_editable_and_tags_can_be_cleared(self):
        product = Product.objects.create(title='Libro', price=2000, description='Libro')
        self.client.force_authenticate(self.admin)
        response = self.client.patch(f'/api/products/{product.id}/', {'shopping_needs': []}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['shopping_needs'], [])

    def test_metadata_is_decoded_in_multipart_and_can_be_cleared(self):
        self.client.force_authenticate(self.admin)
        payload = dict(title='Cuaderno', price='2000', stock='2', description='Prueba', cost_price='',
                       shopping_needs='["escolar"]', gallery='["https://example.com/a.png"]',
                       specifications='{"contents": "1 unidad"}')
        response = self.client.post('/api/products/', payload, format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['specifications'], {'contents': '1 unidad'})
        updated = self.client.patch(f"/api/products/{response.data['id']}/", {'shopping_needs': '[]', 'gallery': '[]', 'specifications': '{}'}, format='multipart')
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertEqual(updated.data['shopping_needs'], [])
        self.assertEqual(updated.data['gallery'], [])
        self.assertEqual(updated.data['specifications'], {})

    def test_demo_catalog_enriches_without_overwriting_existing_products(self):
        existing = Product.objects.create(title='Cuaderno escolar · ejemplo', category='libros', price=9999, description='Dato propio')
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post('/api/products/seed/').status_code, 200)
        existing.refresh_from_db()
        self.assertEqual(existing.price, 9999)
        self.assertEqual(Product.objects.get(title='Lápices de colores · ejemplo').shopping_needs, ['escolar', 'crear'])
