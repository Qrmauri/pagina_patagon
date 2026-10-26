"""Sesiones nativas de Django; las credenciales nunca se devuelven a JavaScript."""
import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET, require_POST


@never_cache
@require_GET
def session_status(request):
    return JsonResponse({'isAdmin': request.user.is_authenticated and request.user.is_staff,
                         'csrfToken': get_token(request)})


@never_cache
@require_POST
@csrf_protect
def session_login(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({'detail': 'Solicitud inválida.'}, status=400)
    if not isinstance(data, dict):
        return JsonResponse({'detail': 'Solicitud inválida.'}, status=400)
    username, password = data.get('username'), data.get('password')
    if not isinstance(username, str) or not isinstance(password, str) or len(username) > 150 or len(password) > 1024:
        return JsonResponse({'detail': 'Credenciales inválidas.'}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is None or not user.is_staff:
        return JsonResponse({'detail': 'Usuario o contraseña incorrectos.'}, status=401)
    login(request, user)
    return JsonResponse({'isAdmin': True, 'csrfToken': get_token(request)})


@never_cache
@require_POST
@csrf_protect
def session_logout(request):
    logout(request)  # Borra la sesión en el servidor, incluidas sus copias.
    return JsonResponse({'isAdmin': False, 'csrfToken': get_token(request)})
