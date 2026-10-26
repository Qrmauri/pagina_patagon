from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from catalog.session_views import session_status, session_login, session_logout
from catalog.views import ProductViewSet, OrderViewSet, TestimonialViewSet, CouponViewSet
from catalog.views import StoreSettingsView

from django.http import HttpResponse

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')
router.register(r'coupons', CouponViewSet, basename='coupon')

def root_view(request):
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patagon Store - Backend Django</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; max-width: 640px; width: 100%; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .badge-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; color: #ffffff; }
        p.subtitle { color: #94a3b8; font-size: 15px; margin-bottom: 28px; line-height: 1.5; }
        .info-box { background: #0f172a; border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 14px; color: #cbd5e1; line-height: 1.6; }
        .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        @media (max-width: 540px) { .actions-grid { grid-template-columns: 1fr; } }
        .btn { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 14px 18px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s; border: 1px solid transparent; }
        .btn-primary { background: #2563eb; color: #ffffff; }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .btn-secondary { background: #334155; color: #f8fafc; border-color: #475569; }
        .btn-secondary:hover { background: #475569; transform: translateY(-1px); }
        .btn span.desc { font-size: 12px; font-weight: 400; opacity: 0.8; margin-top: 3px; }
        .footer-note { font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 18px; }
        code { background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #38bdf8; font-family: monospace; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">
            <span class="badge-dot"></span>
            Backend Django en Ejecución (Puerto 8000)
        </div>
        <h1>Patagon Store API</h1>
        <p class="subtitle">Este puerto (<code>8000</code>) aloja los servicios REST y la base de datos de la tienda. La interfaz visual interactiva de la tienda se ejecuta en Vite.</p>

        <div class="info-box">
            💡 <strong>¿Buscando la tienda visual?</strong><br>
            Abre la aplicación de React en <code>http://localhost:5173</code> o usa los accesos directos a continuación:
        </div>

        <div class="actions-grid">
            <a href="http://localhost:5173" class="btn btn-primary" target="_blank" rel="noreferrer">
                🛒 Abrir Tienda Web
                <span class="desc">Frontend React (localhost:5173)</span>
            </a>
            <a href="http://localhost:5173/admin" class="btn btn-secondary" target="_blank" rel="noreferrer">
                ⚡ Panel Administrador
                <span class="desc">Backoffice React (/admin)</span>
            </a>
            <a href="/api/" class="btn btn-secondary">
                🔌 Explorar API REST
                <span class="desc">Endpoints JSON (/api/)</span>
            </a>
            <a href="/admin/" class="btn btn-secondary">
                🛡️ Django Admin
                <span class="desc">Panel Django nativo (/admin/)</span>
            </a>
        </div>

        <div class="footer-note">
            Patagon Store v2.0 • Django REST Framework con sesiones seguras & Control de Inventario
        </div>
    </div>
</body>
</html>
"""
    return HttpResponse(html_content)

urlpatterns = [
    path('', root_view, name='backend_root'),
    path('admin/', admin.site.urls),
    path('api/auth/session/', session_status, name='session-status'),
    path('api/auth/login/', session_login, name='session-login'),
    path('api/auth/logout/', session_logout, name='session-logout'),
    path('api/store-settings/', StoreSettingsView.as_view(), name='store-settings'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

