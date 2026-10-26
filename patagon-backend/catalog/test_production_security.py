import json
import os
import secrets
import subprocess
import sys

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.middleware.security import SecurityMiddleware
from django.test import RequestFactory, SimpleTestCase, override_settings
from rest_framework.test import APITestCase
from .models import Coupon


class ProductionSettingsTests(SimpleTestCase):
    def read_settings(self, debug):
        env = os.environ.copy()
        env.update(DJANGO_DEBUG=str(debug).lower(), DJANGO_SECRET_KEY=secrets.token_urlsafe(64))
        env.pop('DJANGO_SETTINGS_MODULE', None)
        env.pop('DJANGO_TRUST_PROXY', None)
        env.pop('DJANGO_HSTS_INCLUDE_SUBDOMAINS', None)
        env.pop('DJANGO_HSTS_PRELOAD', None)
        result = subprocess.run([
            sys.executable, '-c',
            "import json; from productos import settings as s; "
            "print(json.dumps({k: getattr(s, k) for k in "
            "['SECURE_SSL_REDIRECT', 'SESSION_COOKIE_SECURE', 'CSRF_COOKIE_SECURE', "
            "'SECURE_HSTS_SECONDS', 'SECURE_HSTS_INCLUDE_SUBDOMAINS', "
            "'SECURE_HSTS_PRELOAD', 'SECURE_PROXY_SSL_HEADER', 'ALLOW_DEMO_DATA']}))",
        ], env=env, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)

    def test_production_requires_https_and_secure_cookies(self):
        values = self.read_settings(False)
        for key in ['SECURE_SSL_REDIRECT', 'SESSION_COOKIE_SECURE', 'CSRF_COOKIE_SECURE']:
            self.assertIs(values[key], True, key)
        self.assertGreater(values['SECURE_HSTS_SECONDS'], 0)
        self.assertFalse(values['SECURE_HSTS_INCLUDE_SUBDOMAINS'])
        self.assertFalse(values['SECURE_HSTS_PRELOAD'])
        self.assertIsNone(values['SECURE_PROXY_SSL_HEADER'])
        self.assertFalse(values['ALLOW_DEMO_DATA'])

    def test_local_development_does_not_force_https(self):
        values = self.read_settings(True)
        self.assertFalse(values['SECURE_SSL_REDIRECT'])
        self.assertFalse(values['SESSION_COOKIE_SECURE'])
        self.assertEqual(values['SECURE_HSTS_SECONDS'], 0)

    @override_settings(SECURE_SSL_REDIRECT=True, SECURE_HSTS_SECONDS=3600, ALLOWED_HOSTS=['testserver'])
    def test_http_redirect_and_https_security_headers(self):
        middleware = SecurityMiddleware(lambda request: HttpResponse('OK'))
        factory = RequestFactory()
        response = middleware(factory.get('/api/products/'))
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response['Location'], 'https://testserver/api/products/')
        response = middleware(factory.get('/api/products/', secure=True))
        self.assertIn('max-age=3600', response['Strict-Transport-Security'])
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')

    @override_settings(SECURE_SSL_REDIRECT=True, SECURE_PROXY_SSL_HEADER=None, ALLOWED_HOSTS=['testserver'])
    def test_untrusted_forwarded_header_cannot_bypass_https(self):
        middleware = SecurityMiddleware(lambda request: HttpResponse('OK'))
        response = middleware(RequestFactory().get('/api/products/', HTTP_X_FORWARDED_PROTO='https'))
        self.assertEqual(response.status_code, 301)

    def test_weak_production_secret_is_rejected(self):
        env = os.environ.copy()
        env.update(DJANGO_DEBUG='false', DJANGO_SECRET_KEY='weak-test-key')
        result = subprocess.run([sys.executable, '-c', 'from productos import settings'], env=env, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('ImproperlyConfigured', result.stderr)


@override_settings(ALLOW_DEMO_DATA=False)
class ProductionDemoProtectionTests(APITestCase):
    def test_even_staff_cannot_seed_examples_in_production(self):
        user = get_user_model().objects.create_user(username='production-admin', is_staff=True)
        self.client.force_authenticate(user)
        for path in ['/api/products/seed/', '/api/testimonials/seed/']:
            self.assertEqual(self.client.post(path).status_code, 403, path)

    def test_coupon_validation_does_not_create_demo_discounts(self):
        response = self.client.post('/api/coupons/validate/', {'code': 'PATAGON10', 'subtotal': 20000})
        self.assertEqual(response.status_code, 404)
        self.assertFalse(Coupon.objects.exists())
