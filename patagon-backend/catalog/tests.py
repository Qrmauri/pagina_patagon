from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Product, Order, Coupon
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from unittest.mock import patch
from io import StringIO

class CommercialImprovementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser('owner', 'owner@example.com', 'test-password-123')
        self.order = Order.objects.create(customer_name='Prueba', customer_email='test@example.com', customer_phone='123', address='Calle', city='Ciudad', postal_code='1', total=15000, subtotal=15000, payment_method='transferencia')

    def test_only_admin_can_confirm_transfer_and_repeated_confirmation_is_safe(self):
        path = f'/api/orders/{self.order.id}/confirm-payment/'
        self.assertEqual(self.client.post(path).status_code, 401)
        self.client.force_authenticate(self.admin)
        first = self.client.post(path)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.data['payment_status'], 'paid')
        second = self.client.post(path)
        self.assertEqual(second.data['paid_at'], first.data['paid_at'])

    def test_cancelled_order_cannot_be_confirmed(self):
        self.order.status = 'cancelled'
        self.order.save()
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(f'/api/orders/{self.order.id}/confirm-payment/').status_code, 400)

    def test_public_catalog_and_tracking_do_not_expose_costs(self):
        Product.objects.create(title='Libro', price=15000, cost_price=5000, characteristics='Tapa dura')
        self.order.items_data = [{'id': 1, 'quantity': 1, 'cost_price': 5000}]
        self.order.save()
        self.assertNotIn('cost_price', self.client.get('/api/products/').data[0])
        tracked = self.client.get('/api/orders/track/', {'id': self.order.id, 'email': self.order.customer_email})
        self.assertNotIn('cost_price', tracked.data['items_data'][0])

    def test_client_cannot_mark_a_new_order_as_paid(self):
        product = Product.objects.create(title='Libro', price=15000, stock=2, cost_price=5000)
        payload = {
            'customer_name': 'Prueba', 'customer_email': 'test@example.com',
            'customer_phone': '123', 'address': 'Calle', 'city': 'Ciudad', 'postal_code': '1',
            'payment_method': 'transferencia', 'payment_status': 'paid',
            'items_data': [{'id': product.id, 'quantity': 1, 'cost_price': 0}],
        }
        response = self.client.post('/api/orders/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['payment_status'], 'pending')
        saved = Order.objects.get(pk=response.data['id'])
        self.assertEqual(saved.items_data[0]['cost_price'], 5000)

    def test_webpay_cannot_be_manually_confirmed(self):
        self.order.payment_method = 'webpay'
        self.order.save()
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(f'/api/orders/{self.order.id}/confirm-payment/').status_code, 400)

class PatagonApiTests(APITestCase):
    def setUp(self):
        # Crear usuario administrador
        self.admin_user = User.objects.create_superuser(
            username='admin',
            password='patagon2025',
            email='admin@patagonstore.cl'
        )

        # Crear producto de prueba con stock 10
        self.product = Product.objects.create(
            title='Peluche Patagónico',
            category='juguetes',
            price=15000,
            stock=10,
            description='Peluche suave'
        )

        # Obtener token JWT
        res = self.client.post('/api/token/', {
            'username': 'admin',
            'password': 'patagon2025'
        }, format='json')
        self.token = res.data.get('access')

    def test_anonymous_can_list_products(self):
        res = self.client.get('/api/products/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_anonymous_cannot_create_product(self):
        res = self.client.post('/api/products/', {
            'title': 'Hacker Item',
            'category': 'juguetes',
            'price': 9999,
            'stock': 5,
            'description': 'Item no autorizado'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_product_with_stock(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post('/api/products/', {
            'title': 'Robot Inteligente',
            'category': 'electrónica',
            'price': 49990,
            'stock': 7,
            'description': 'Robot de última generación'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['stock'], 7)

    def test_anonymous_can_place_order_and_discounts_stock(self):
        initial_stock = self.product.stock
        order_payload = {
            'customer_name': 'Juan Pérez',
            'customer_email': 'juan@patagon.cl',
            'customer_phone': '+56 9 1234 5678',
            'address': 'Av. Costanera 100',
            'city': 'Punta Arenas',
            'postal_code': '6200000',
            'total': 30000,
            'subtotal': 30000,
            'shipping': 0,
            'items_data': [
                {
                    'id': self.product.id,
                    'title': self.product.title,
                    'price': self.product.price,
                    'quantity': 3
                }
            ]
        }

        res = self.client.post('/api/orders/', order_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'pending')

        # Verificar que el stock disminuyó de 10 a 7
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock - 3)

    def test_insufficient_stock_rejects_order(self):
        # Intentar comprar más del stock disponible (25 unidades cuando solo hay 7)
        order_payload = {
            'customer_name': 'Comprador Excesivo',
            'customer_email': 'exceso@test.cl',
            'customer_phone': '987654321',
            'address': 'Av. Principal 123',
            'city': 'Temuco',
            'postal_code': '4780000',
            'total': 150000,
            'subtotal': 150000,
            'shipping': 0,
            'items_data': [
                {
                    'id': self.product.id,
                    'title': self.product.title,
                    'price': self.product.price,
                    'quantity': 25,
                }
            ]
        }

        res = self.client.post('/api/orders/', order_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Stock insuficiente', str(res.data))

        # Verificar que el stock no fue modificado y sigue siendo 10
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_anonymous_cannot_read_orders(self):
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_update_order_status(self):
        # Crear orden
        order = Order.objects.create(
            customer_name='María Test',
            customer_email='maria@test.com',
            customer_phone='12345678',
            address='Calle 1',
            city='Santiago',
            postal_code='1000',
            total=15000,
            status='pending'
        )

        # Admin cambia estado a "shipped"
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.patch(f'/api/orders/{order.id}/', {'status': 'shipped'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertEqual(order.status, 'shipped')

    def test_testimonials_permissions(self):
        # Anónimo puede crear testimonio
        res = self.client.post('/api/testimonials/', {
            'name': 'Consumidor Feliz',
            'city': 'Valdivia',
            'rating': 5,
            'comment': 'Excelente servicio!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        testimonio_id = res.data['id']

        # Anónimo NO puede borrar testimonio
        res_del = self.client.delete(f'/api/testimonials/{testimonio_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_401_UNAUTHORIZED)

        # Admin SÍ puede borrar testimonio
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res_del_auth = self.client.delete(f'/api/testimonials/{testimonio_id}/')
        self.assertEqual(res_del_auth.status_code, status.HTTP_204_NO_CONTENT)

    def test_anonymous_can_track_order(self):
        order = Order.objects.create(
            customer_name='Rastreo Test',
            customer_email='rastreo@patagon.cl',
            customer_phone='12345678',
            address='Calle Falsa 123',
            city='Punta Arenas',
            postal_code='6200000',
            total=25000,
            status='processing'
        )

        # Consulta válida
        res = self.client.get(f'/api/orders/track/?id={order.id}&email=rastreo@patagon.cl')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'processing')
        self.assertEqual(res.data['customer_name'], 'Rastreo Test')

        # Email incorrecto -> 404
        res_wrong = self.client.get(f'/api/orders/track/?id={order.id}&email=otro@patagon.cl')
        self.assertEqual(res_wrong.status_code, status.HTTP_404_NOT_FOUND)

        # Faltan parámetros -> 400
        res_empty = self.client.get(f'/api/orders/track/')
        self.assertEqual(res_empty.status_code, status.HTTP_400_BAD_REQUEST)

    def test_coupon_validation(self):
        # Validar cupón válido PATAGON10 (10% descuento)
        res = self.client.post('/api/coupons/validate/', {
            'code': 'PATAGON10',
            'subtotal': 20000,
            'shipping': 3990
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['valid'])
        self.assertEqual(res.data['discount_amount'], 2000)

        # Validar cupón inválido
        res_invalid = self.client.post('/api/coupons/validate/', {
            'code': 'INVALIDO999',
            'subtotal': 20000,
            'shipping': 3990
        }, format='json')
        self.assertEqual(res_invalid.status_code, status.HTTP_404_NOT_FOUND)


    def order_payload(self, items=None, **extra):
        data = {
            'customer_name': 'Prueba', 'customer_email': 'prueba@example.com',
            'customer_phone': '12345678', 'address': 'Calle 1', 'city': 'Punta Arenas',
            'postal_code': '6200000', 'total': 1, 'subtotal': 1, 'shipping': 0,
            'items_data': items if items is not None else [{'id': self.product.id, 'quantity': 1, 'price': 1}],
        }
        data.update(extra)
        return data

    def test_order_recalculates_prices_and_does_not_trust_payment(self):
        response = self.client.post('/api/orders/', self.order_payload(status='completed', payment_authorization='FAKE'), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['subtotal'], 15000)
        self.assertEqual(response.data['total'], 18990)
        self.assertEqual(response.data['status'], 'pending')
        self.assertIsNone(response.data['payment_authorization'])

    def test_invalid_items_never_change_stock(self):
        for items in [[], [{'id': self.product.id, 'quantity': -1}], [{'id': self.product.id, 'quantity': 0}], [{'id': 999999, 'quantity': 1}], [{'id': self.product.id, 'quantity': 1.5}], ['invalid']]:
            with self.subTest(items=items):
                response = self.client.post('/api/orders/', self.order_payload(items), format='json')
                self.assertEqual(response.status_code, 400)
                self.product.refresh_from_db()
                self.assertEqual(self.product.stock, 10)
        self.assertEqual(Order.objects.count(), 0)

    def test_duplicate_items_cannot_bypass_stock(self):
        items = [{'id': self.product.id, 'quantity': 6}, {'id': self.product.id, 'quantity': 6}]
        response = self.client.post('/api/orders/', self.order_payload(items), format='json')
        self.assertEqual(response.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_free_shipping_coupon_is_not_subtracted_twice(self):
        Coupon.objects.create(code='ENVIOGRATIS', discount_type='shipping', discount_value=0)
        response = self.client.post('/api/orders/', self.order_payload(coupon_code='ENVIOGRATIS', discount_amount=3990), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['total'], 15000)
        self.assertEqual(response.data['shipping'], 0)
        self.assertEqual(response.data['discount_amount'], 0)

    def test_invalid_coupon_rolls_back_stock(self):
        response = self.client.post('/api/orders/', self.order_payload(coupon_code='FAKE'), format='json')
        self.assertEqual(response.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)
        self.assertEqual(Order.objects.count(), 0)

    def test_cancellation_restores_stock_once_and_cannot_be_reopened(self):
        response = self.client.post('/api/orders/', self.order_payload(), format='json')
        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 9)
        self.client.force_authenticate(self.admin_user)
        url = f"/api/orders/{response.data['id']}/"
        for _ in range(2):
            cancelled = self.client.patch(url, {'status': 'cancelled'}, format='json')
            self.assertEqual(cancelled.status_code, 200)
            self.product.refresh_from_db()
            self.assertEqual(self.product.stock, 10)
        reopened = self.client.patch(url, {'status': 'pending'}, format='json')
        self.assertEqual(reopened.status_code, 400)
        self.assertEqual(Order.objects.get(pk=response.data['id']).status, 'cancelled')

    def test_invalid_tracking_ids_return_bad_request(self):
        for order_id in ['abc', '-1', '0', '1.5', '9' * 100]:
            with self.subTest(order_id=order_id):
                response = self.client.get('/api/orders/track/', {'id': order_id, 'email': 'test@example.com'})
                self.assertEqual(response.status_code, 400)

    def test_order_items_cannot_be_changed_before_cancellation(self):
        response = self.client.post('/api/orders/', self.order_payload(), format='json')
        self.client.force_authenticate(self.admin_user)
        url = f"/api/orders/{response.data['id']}/"
        changed = self.client.patch(url, {'items_data': [{'id': self.product.id, 'quantity': 100}]}, format='json')
        self.assertEqual(changed.status_code, 400)
        cancelled = self.client.patch(url, {'status': 'cancelled'}, format='json')
        self.assertEqual(cancelled.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)


class EnsureAdminTests(TestCase):
    @patch.dict('os.environ', {'ADMIN_USER': 'review-admin', 'ADMIN_PASSWORD': 'new-password'}, clear=True)
    def test_existing_admin_password_is_preserved(self):
        user = User.objects.create_superuser('review-admin', password='original-password')
        call_command('ensure_admin', stdout=StringIO())
        user.refresh_from_db()
        self.assertTrue(user.check_password('original-password'))

    @patch.dict('os.environ', {'ADMIN_USER': 'review-admin'}, clear=True)
    def test_new_admin_requires_explicit_password(self):
        with self.assertRaises(CommandError):
            call_command('ensure_admin', stdout=StringIO())
        self.assertFalse(User.objects.filter(username='review-admin').exists())

    @patch.dict('os.environ', {'ADMIN_USER': 'review-admin', 'ADMIN_PASSWORD': 'explicit-password'}, clear=True)
    def test_new_admin_is_created_with_explicit_password(self):
        call_command('ensure_admin', stdout=StringIO())
        user = User.objects.get(username='review-admin')
        self.assertTrue(user.is_superuser and user.is_staff)
        self.assertTrue(user.check_password('explicit-password'))

    @patch.dict('os.environ', {'ADMIN_USER': 'review-user', 'ADMIN_PASSWORD': 'explicit-password'}, clear=True)
    def test_existing_regular_user_is_not_promoted(self):
        user = User.objects.create_user('review-user', password='original-password')
        with self.assertRaises(CommandError):
            call_command('ensure_admin', stdout=StringIO())
        user.refresh_from_db()
        self.assertFalse(user.is_superuser or user.is_staff)

class ProductUploadTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user('upload-owner', password='test-upload-only', is_staff=True)
        self.client.force_authenticate(self.owner)
        self.payload = {'title': 'Cuaderno de prueba', 'category': 'libros', 'price': 1990, 'stock': 4, 'description': 'Cuaderno escolar', 'characteristics': '', 'cost_price': None, 'image': 'https://example.com/cuaderno.jpg'}

    def test_create_with_image_link_then_edit_persists_fields(self):
        response = self.client.post('/api/products/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        product = Product.objects.get(pk=response.data['id'])
        self.assertEqual(product.image, self.payload['image'])
        updated = {**self.payload, 'title': 'Cuaderno actualizado', 'image': 'https://example.com/nueva.jpg'}
        response = self.client.put(f'/api/products/{product.pk}/', updated, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        product.refresh_from_db()
        self.assertEqual(product.title, updated['title'])
        self.assertEqual(product.image, updated['image'])

    def test_image_file_with_empty_optional_cost(self):
        from io import BytesIO
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile
        buffer = BytesIO()
        Image.new('RGB', (4, 4), 'white').save(buffer, format='PNG')
        payload = {**self.payload, 'cost_price': '', 'image': '', 'image_file': SimpleUploadedFile('test.png', buffer.getvalue(), content_type='image/png')}
        with self.settings(STORAGES={'default': {'BACKEND': 'django.core.files.storage.InMemoryStorage'}}):
            response = self.client.post('/api/products/', payload, format='multipart')
            self.assertEqual(response.status_code, 201, response.data)
            self.assertIn('/media/products/', response.data['image'])

    def test_invalid_image_link_is_rejected_without_creating_product(self):
        response = self.client.post('/api/products/', {**self.payload, 'image': 'esto no es un enlace'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('image', response.data)
        self.assertEqual(Product.objects.count(), 0)

    def test_expired_access_can_refresh_and_create_product(self):
        from datetime import timedelta
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.owner)
        access = refresh.access_token
        access.set_exp(lifetime=timedelta(seconds=-1))
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        denied = self.client.post('/api/products/', self.payload, format='json')
        self.assertEqual(denied.status_code, 401)
        self.assertEqual(Product.objects.count(), 0)
        self.client.credentials()
        renewed = self.client.post('/api/token/refresh/', {'refresh': str(refresh)}, format='json')
        self.assertEqual(renewed.status_code, 200, renewed.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {renewed.data['access']}")
        saved = self.client.post('/api/products/', self.payload, format='json')
        self.assertEqual(saved.status_code, 201, saved.data)
        self.assertEqual(Product.objects.count(), 1)
