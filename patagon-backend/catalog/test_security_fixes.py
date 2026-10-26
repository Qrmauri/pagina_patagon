from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Order, Product, Testimonial


@override_settings(SECURE_SSL_REDIRECT=False, EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class SecurityFixTests(APITestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user('security-admin', password='fixture-password', is_staff=True)
        self.product = Product.objects.create(title='Libro', price=10000, stock=2)
        self.payload = dict(customer_name='Fixture', customer_email='fixture@example.com',
                            customer_phone='12345678', address='Calle 1', city='Ciudad', postal_code='1',
                            payment_method='transferencia', items_data=[{'id': self.product.id, 'quantity': 2}])

    def place(self):
        response = self.client.post('/api/orders/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        return response

    def test_unpaid_order_cannot_exhaust_inventory(self):
        self.place()
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_confirm_payment_consumes_stock_once_and_cancellation_returns_it_once(self):
        order_id = self.place().data['id']
        self.client.force_authenticate(self.admin)
        for _ in range(2):
            response = self.client.post(f'/api/orders/{order_id}/confirm-payment/')
            self.assertEqual(response.status_code, 200, response.data)
            self.product.refresh_from_db()
            self.assertEqual(self.product.stock, 0)
        for _ in range(2):
            self.assertEqual(self.client.patch(f'/api/orders/{order_id}/', {'status': 'cancelled'}).status_code, 200)
            self.product.refresh_from_db()
            self.assertEqual(self.product.stock, 2)

    def test_competing_pending_orders_cannot_both_be_confirmed(self):
        first, second = self.place().data['id'], self.place().data['id']
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(f'/api/orders/{first}/confirm-payment/').status_code, 200)
        self.assertEqual(self.client.post(f'/api/orders/{second}/confirm-payment/').status_code, 400)
        self.assertEqual(Order.objects.get(pk=second).payment_status, 'pending')

    def test_payment_stock_failure_rolls_back_every_product(self):
        second = Product.objects.create(title='Segundo', price=1000, stock=1)
        self.payload['items_data'].append({'id': second.id, 'quantity': 1})
        order_id = self.place().data['id']
        second.stock = 0
        second.save(update_fields=['stock'])
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(f'/api/orders/{order_id}/confirm-payment/').status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)
        self.assertFalse(Order.objects.get(pk=order_id).inventory_committed)

    def test_unpaid_order_cannot_be_dispatched_or_deleted(self):
        order_id = self.place().data['id']
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.patch(f'/api/orders/{order_id}/', {'status': 'shipped'}).status_code, 400)
        self.assertEqual(self.client.delete(f'/api/orders/{order_id}/').status_code, 405)

    def test_tracking_rejects_email_and_id_and_get(self):
        order_id = self.place().data['id']
        self.assertEqual(self.client.get('/api/orders/track/', {'id': order_id, 'email': self.payload['customer_email']}).status_code, 403)
        self.assertEqual(self.client.post('/api/orders/track/', {'id': order_id, 'email': self.payload['customer_email']}).status_code, 400)

    def test_tracking_requires_random_code_and_returns_only_shipping_summary(self):
        created = self.place()
        code = created.data['tracking_token']
        self.assertGreaterEqual(len(code), 40)
        response = self.client.post('/api/orders/track/', {'token': code}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        for field in ['address', 'customer_phone', 'customer_name', 'customer_email', 'postal_code', 'tracking_token']:
            self.assertNotIn(field, response.data)
        self.assertIn('no-store', response['Cache-Control'])
        self.assertEqual(self.client.post('/api/orders/track/', {'token': 'x' * 43}).status_code, 404)

    def test_tracking_code_expires_and_email_has_no_personal_data_in_url(self):
        from django.core import mail
        created = self.place()
        self.assertIn('/seguimiento#token=', mail.outbox[-1].body)
        self.assertNotIn('/seguimiento?id=', mail.outbox[-1].body)
        Order.objects.filter(pk=created.data['id']).update(created_at=timezone.now() - timedelta(days=31))
        self.assertEqual(self.client.post('/api/orders/track/', {'token': created.data['tracking_token']}).status_code, 404)

    def test_legacy_jwt_no_longer_authenticates(self):
        token = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        self.assertEqual(self.client.get('/api/orders/').status_code, 403)
        self.assertEqual(self.client.post('/api/token/refresh/', {'refresh': str(token)}).status_code, 404)

    def test_session_login_csrf_and_server_side_logout(self):
        client = APIClient(enforce_csrf_checks=True)
        credentials = {'username': 'security-admin', 'password': 'fixture-password'}
        self.assertEqual(client.post('/api/auth/login/', credentials, format='json').status_code, 403)
        csrf = client.get('/api/auth/session/').json()['csrfToken']
        self.assertEqual(client.post('/api/auth/login/', credentials, format='json', HTTP_X_CSRFTOKEN=csrf, HTTP_ORIGIN='https://untrusted.example').status_code, 403)
        logged_in = client.post('/api/auth/login/', credentials, format='json', HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(logged_in.status_code, 200, logged_in.content)
        self.assertNotIn('access', logged_in.json())
        self.assertTrue(logged_in.cookies[settings.SESSION_COOKIE_NAME]['httponly'])
        copied_cookie = client.cookies[settings.SESSION_COOKIE_NAME].value
        self.assertEqual(client.get('/api/orders/').status_code, 200)
        self.assertEqual(client.post('/api/products/', {}, format='json').status_code, 403)
        csrf = logged_in.json()['csrfToken']
        self.assertEqual(client.post('/api/auth/logout/', {}, format='json', HTTP_X_CSRFTOKEN=csrf).status_code, 200)
        copied = APIClient()
        copied.cookies[settings.SESSION_COOKIE_NAME] = copied_cookie
        self.assertEqual(copied.get('/api/orders/').status_code, 403)

    def test_non_staff_cannot_start_admin_session(self):
        get_user_model().objects.create_user('buyer', password='fixture-password')
        response = self.client.post('/api/auth/login/', {'username': 'buyer', 'password': 'fixture-password'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_anonymous_review_is_pending_until_admin_approves(self):
        response = self.client.post('/api/testimonials/', {'name': 'Fixture', 'rating': 5, 'comment': 'Opinión', 'approved': True})
        self.assertEqual(response.status_code, 201)
        review = Testimonial.objects.get(pk=response.data['id'])
        self.assertFalse(review.approved)
        self.assertEqual(self.client.get('/api/testimonials/').data['results'], [])
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.patch(f'/api/testimonials/{review.pk}/', {'approved': True}).status_code, 200)
        self.client.force_authenticate(None)
        self.assertEqual(len(self.client.get('/api/testimonials/').data['results']), 1)

    def test_review_length_is_bounded_and_listing_is_paginated(self):
        response = self.client.post('/api/testimonials/', {'name': 'Fixture', 'rating': 5, 'comment': 'A' * 2001})
        self.assertEqual(response.status_code, 400)
        Testimonial.objects.bulk_create([Testimonial(name='Fixture', comment='Opinión', approved=True) for _ in range(25)])
        response = self.client.get('/api/testimonials/')
        self.assertEqual(len(response.data['results']), 20)
        self.assertIsNotNone(response.data['next'])
