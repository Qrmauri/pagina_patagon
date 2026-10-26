"""
Django settings for productos project.
"""

from pathlib import Path
import os
import secrets
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.environ.get('DJANGO_DEBUG', 'false').lower() == 'true'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '').strip()
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured('Define DJANGO_SECRET_KEY para ejecutar el servidor sin DEBUG.')
    # Clave aleatoria persistente para desarrollo, excluida de Git.
    secret_path = BASE_DIR / '.django-secret-key'
    try:
        with secret_path.open('x', encoding='utf-8') as secret_file:
            secret_file.write(secrets.token_urlsafe(64))
    except FileExistsError:
        pass
    SECRET_KEY = secret_path.read_text(encoding='utf-8').strip()

if not DEBUG and (len(SECRET_KEY) < 50 or len(set(SECRET_KEY)) < 5 or SECRET_KEY.startswith('django-insecure-')):
    raise ImproperlyConfigured('DJANGO_SECRET_KEY debe ser una clave aleatoria de al menos 50 caracteres en producción.')

# HTTPS es obligatorio fuera del desarrollo local. El proxy solo se confía
# cuando el operador confirma que elimina y reescribe X-Forwarded-Proto.
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 8 * 60 * 60
SESSION_SAVE_EVERY_REQUEST = False
CSRF_COOKIE_SAMESITE = 'Lax'
SECURE_HSTS_SECONDS = 0 if DEBUG else 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG and os.environ.get('DJANGO_HSTS_INCLUDE_SUBDOMAINS', 'false').lower() == 'true'
SECURE_HSTS_PRELOAD = not DEBUG and os.environ.get('DJANGO_HSTS_PRELOAD', 'false').lower() == 'true'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
X_FRAME_OPTIONS = 'DENY'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') if os.environ.get('DJANGO_TRUST_PROXY', 'false').lower() == 'true' else None
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in os.environ.get('DJANGO_CSRF_TRUSTED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173' if DEBUG else '').split(',') if origin.strip()]
ALLOW_DEMO_DATA = DEBUG and os.environ.get('DJANGO_ALLOW_DEMO_DATA', 'true').lower() == 'true'
DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024

ALLOWED_HOSTS = [host.strip() for host in os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,[::1]').split(',') if host.strip()]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'corsheaders',
    'rest_framework',
    'django_filters',
    # Local apps
    'catalog',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Cors debe ir antes de CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'productos.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'productos.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'es-cl'
TIME_ZONE = 'America/Santiago'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media Files (Archivos subidos por usuarios: JPEG, PNG, etc.)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': None,  # Devuelve listas completas para el front-end simple
}

# Configuración CORS para comunicarse con el frontend de Vite
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get('DJANGO_CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = False

# Emails transaccionales (Consola en desarrollo para pruebas inmediatas)
EMAIL_BACKEND = os.environ.get('DJANGO_EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.dummy.EmailBackend')
DEFAULT_FROM_EMAIL = os.environ.get('DJANGO_DEFAULT_FROM_EMAIL', 'Patagon Store <noreply@example.com>')
EMAIL_HOST = os.environ.get('DJANGO_EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('DJANGO_EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('DJANGO_EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('DJANGO_EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('DJANGO_EMAIL_USE_TLS', 'true').lower() == 'true'
EMAIL_TIMEOUT = 10
STOREFRONT_URL = os.environ.get('STOREFRONT_URL', 'http://localhost:5173')
STORE_TRANSFER_INSTRUCTIONS = os.environ.get('STORE_TRANSFER_INSTRUCTIONS', 'Los datos bancarios todavía no están configurados.')

