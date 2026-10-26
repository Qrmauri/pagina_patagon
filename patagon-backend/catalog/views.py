from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.db.models import F
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Order, Testimonial, Coupon
from .serializers import ProductSerializer, OrderSerializer, TestimonialSerializer, CouponSerializer
from .models import StoreSettings
from .serializers import StoreSettingsSerializer
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from datetime import timedelta


class StoreSettingsView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method in ['GET', 'HEAD', 'OPTIONS'] else [IsAdminUser()]

    def get(self, request):
        instance = StoreSettings.objects.filter(pk=1).first() or StoreSettings(pk=1)
        return Response(StoreSettingsSerializer(instance).data)

    def put(self, request):
        instance = StoreSettings.objects.filter(pk=1).first() or StoreSettings(pk=1)
        serializer = StoreSettingsSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

INITIAL_PRODUCTS_DATA = [
    {
        "title": "Peluche Clásico",
        "shopping_needs": ["regalos"],
        "category": "juguetes",
        "price": 15990,
        "stock": 15,
        "image": "https://images.unsplash.com/photo-1594787318286-3d835c1cabab?w=400&auto=format&fit=crop",
        "description": "Peluche suave y adorable para los más pequeños",
    },
    {
        "title": "Consola Gaming",
        "category": "electrónica",
        "price": 299990,
        "stock": 8,
        "image": "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&auto=format&fit=crop",
        "description": "Última generación para juegos ultra HD",
    },
    {
        "title": "Libro Aventuras",
        "category": "libros",
        "price": 8990,
        "stock": 20,
        "image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop",
        "description": "Historias fascinantes para todas las edades",
    },
    {
        "title": "Robot Educativo",
        "shopping_needs": ["regalos"],
        "category": "juguetes",
        "price": 45990,
        "stock": 5,
        "image": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop",
        "description": "Aprende programación de forma divertida",
    },
    {
        "title": "Audífonos Premium",
        "category": "electrónica",
        "price": 129990,
        "stock": 12,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
        "description": "Sonido cristalino con cancelación de ruido",
    },
    {
        "title": "Libro de Ciencia",
        "category": "libros",
        "price": 12990,
        "stock": 18,
        "image": "https://images.unsplash.com/photo-150784272343-583f20270319?w=400&auto=format&fit=crop",
        "description": "Explora los misterios del universo",
    },
]

# Estos ejemplos solo se incorporan al usar la acción explícita de catálogo demo.
INITIAL_PRODUCTS_DATA.extend([
    dict(title='Cuaderno escolar · ejemplo', category='libros', price=2490, stock=10, shopping_needs=['escolar', 'oficina'], description='Producto de demostración para organizar apuntes. Reemplazar con un artículo real antes de vender.'),
    dict(title='Lápices de colores · ejemplo', category='libros', price=3990, stock=10, shopping_needs=['escolar', 'crear'], description='Ejemplo de materiales escolares y creativos. Precio y stock de demostración.'),
    dict(title='Carpeta de oficina · ejemplo', category='libros', price=1990, stock=10, shopping_needs=['oficina', 'escolar'], description='Ejemplo para organizar documentos. Reemplazar con información y fotografías reales.'),
    dict(title='Pinturas para manualidades · ejemplo', category='libros', price=4990, stock=10, shopping_needs=['crear', 'escolar'], description='Producto de demostración para proyectos creativos. No corresponde a una oferta real.'),
])

INITIAL_TESTIMONIALS_DATA = [
    {
        "name": "Camila Valenzuela",
        "city": "Punta Arenas",
        "rating": 5,
        "comment": "Compré el peluche y un libro de cuentos para mi sobrino. La calidad es increíble y llegó antes de lo esperado a Magallanes. ¡100% recomendados!",
        "avatar": "👩‍🦰",
    },
    {
        "name": "Matías Osorio",
        "city": "Santiago",
        "rating": 5,
        "comment": "Los audífonos llegaron impecables y con un empaque muy cuidado. El proceso de compra fue súper sencillo y la atención excelente.",
        "avatar": "👨‍💼",
    },
    {
        "name": "Francisca Morales",
        "city": "Concepción",
        "rating": 5,
        "comment": "Excelente catálogo. Es muy reconfortante encontrar una tienda que cuide los detalles y ofrezca productos educativos de tan buen nivel.",
        "avatar": "👩‍🏫",
    },
]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['price', 'stock', 'created_at', 'id']
    ordering = ['id']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], url_path='seed')
    def seed(self, request):
        """Poblar o restablecer productos de demostración."""
        if not settings.ALLOW_DEMO_DATA:
            raise PermissionDenied('La carga de ejemplos está deshabilitada en este entorno.')
        created_count = 0
        for item in INITIAL_PRODUCTS_DATA:
            obj, created = Product.objects.get_or_create(
                title=item['title'],
                defaults=item
            )
            if created:
                created_count += 1
        return Response(
            {"message": f"Catálogo sincronizado. {created_count} productos agregados."},
            status=status.HTTP_200_OK
        )


class OrderViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'no-store'
        response['Referrer-Policy'] = 'no-referrer'
        return response

    @action(detail=True, methods=['post'], url_path='confirm-payment')
    def confirm_payment(self, request, pk=None):
        with transaction.atomic():
            order = self.get_queryset().select_for_update().get(pk=self.get_object().pk)
            if order.status == 'cancelled' or order.payment_method != 'transferencia':
                raise ValidationError({'detail': 'Solo se puede confirmar una transferencia de un pedido vigente.'})
            if order.payment_status != 'paid':
                if not order.inventory_committed:
                    for item in sorted(order.items_data, key=lambda item: item['id']):
                        updated = Product.objects.filter(pk=item['id'], stock__gte=item['quantity']).update(stock=F('stock') - item['quantity'])
                        if not updated:
                            raise ValidationError({'detail': 'Stock insuficiente. No se confirmó el pago; revisa el pedido y concilia o devuelve la transferencia.'})
                    order.inventory_committed = True
                order.payment_status = 'paid'
                order.paid_at = timezone.now()
                order.save(update_fields=['payment_status', 'paid_at', 'inventory_committed'])
        return Response(self.get_serializer(order).data)

    def update(self, request, *args, **kwargs):
        # Serializar la transición para que cancelar dos veces no duplique stock.
        with transaction.atomic():
            order = self.get_queryset().select_for_update().get(pk=self.get_object().pk)
            if set(request.data) - {'status'}:
                raise ValidationError({'detail': 'Solo se puede modificar el estado de un pedido.'})
            serializer = self.get_serializer(order, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            new_status = serializer.validated_data.get('status', order.status)
            if order.status == 'cancelled' and new_status != 'cancelled':
                raise ValidationError({'detail': 'Un pedido cancelado no puede reabrirse. Crea un nuevo pedido.'})
            if new_status not in ['pending', 'cancelled'] and order.payment_status != 'paid':
                raise ValidationError({'detail': 'Confirma el pago antes de preparar o despachar el pedido.'})
            if new_status == 'cancelled' and order.status != 'cancelled' and order.inventory_committed:
                for item in order.items_data:
                    Product.objects.filter(pk=item['id']).update(stock=F('stock') + item['quantity'])
                order.inventory_committed = False
                order.save(update_fields=['inventory_committed'])
            serializer.save()
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['create', 'track']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        items_data = serializer.validated_data.get('items_data', [])
        if not isinstance(items_data, list) or not items_data:
            raise ValidationError({'detail': 'El pedido debe incluir productos.'})

        quantities = {}
        for item in items_data:
            if not isinstance(item, dict):
                raise ValidationError({'detail': 'Artículo inválido.'})
            prod_id, qty = item.get('id'), item.get('quantity')
            if type(prod_id) is not int or prod_id <= 0 or type(qty) is not int or qty <= 0:
                raise ValidationError({'detail': 'Producto y cantidad deben ser enteros positivos.'})
            quantities[prod_id] = quantities.get(prod_id, 0) + qty

        with transaction.atomic():
            products = list(Product.objects.select_for_update().filter(id__in=quantities).order_by('id'))
            if len(products) != len(quantities):
                raise ValidationError({'detail': 'Uno de los productos ya no existe.'})
            subtotal = 0
            trusted_items = []
            for product in products:
                qty = quantities[product.id]
                if qty > product.stock:
                    raise ValidationError({'detail': f"Stock insuficiente para '{product.title}'. Solicitados: {qty}, disponibles: {product.stock}."})
                subtotal += product.price * qty
                trusted_items.append({'id': product.id, 'title': product.title, 'price': product.price, 'quantity': qty, 'image': product.image or '', 'cost_price': product.cost_price})

            shipping = 0 if subtotal >= 30000 else 3990
            discount = 0
            code = str(serializer.validated_data.get('coupon_code') or '').strip().upper()
            if code:
                coupon = Coupon.objects.filter(code=code, active=True).first()
                if not coupon or subtotal < coupon.min_purchase:
                    raise ValidationError({'detail': 'Cupón inválido o compra mínima no alcanzada.'})
                if coupon.discount_type == 'shipping':
                    shipping = 0
                elif coupon.discount_type == 'percentage':
                    discount = min(subtotal, subtotal * coupon.discount_value // 100)
                elif coupon.discount_type == 'fixed':
                    discount = min(subtotal, coupon.discount_value)

            # Una solicitud sin pago no reserva inventario. Se revalida al confirmar.
            order = serializer.save(
                items_data=trusted_items, subtotal=subtotal, shipping=shipping,
                discount_amount=discount, coupon_code=code or None,
                total=subtotal + shipping - discount, status='pending', payment_authorization=None,
            )

        # 4. Enviar email transaccional de confirmación
        try:
            self._send_order_confirmation_email(order)
        except Exception:
            # No registrar direcciones, enlaces privados ni respuestas del proveedor.
            import logging
            logging.getLogger(__name__).warning('No se pudo enviar la confirmación del pedido %s.', order.pk)

        headers = self.get_success_headers(serializer.data)
        headers['Cache-Control'] = 'no-store'
        return Response({**serializer.data, 'tracking_token': order.tracking_token}, status=status.HTTP_201_CREATED, headers=headers)

    def _send_order_confirmation_email(self, order):
        subject = f"¡Confirmación de Pedido #{order.id} - Patagon Store! 🛍️"
        tracking_url = f"{settings.STOREFRONT_URL.rstrip('/')}/seguimiento#token={order.tracking_token}"
        
        items_summary = "\n".join([
            f" - {it.get('title', 'Producto')} x{it.get('quantity', 1)} (${int(it.get('price', 0)):,} CLP)"
            for it in (order.items_data or [])
        ])

        payment_desc = "Webpay Plus (Transbank - Tarjeta de Débito/Crédito)"
        if order.payment_method == 'transferencia':
            payment_desc = 'Transferencia pendiente de conciliación. ' + settings.STORE_TRANSFER_INSTRUCTIONS
        elif order.payment_authorization:
            payment_desc += f" [Cód. Autorización: {order.payment_authorization}]"

        coupon_line = f"Cupón Aplicado: {order.coupon_code} (-${order.discount_amount:,} CLP)\n" if order.coupon_code else ""

        message = f"""Hola {order.customer_name},

¡Muchas gracias por tu compra en Patagon Store!
Tu pedido ha sido registrado. El pago está pendiente de confirmación antes de preparar el despacho.

Resumen del Pedido #{order.id}:
--------------------------------------------------
{items_summary}

Subtotal: ${order.subtotal:,} CLP
{coupon_line}Costo de Envío: ${order.shipping:,} CLP
Total Final: ${order.total:,} CLP
Método de Pago: {payment_desc}

Dirección de Despacho:
{order.address}, {order.city} (Código Postal: {order.postal_code})

Puedes consultar el estado de tu pedido en vivo en cualquier momento ingresando aquí:
{tracking_url}

Si tienes preguntas, revisa el contacto publicado en nuestra tienda.

Atentamente,
El Equipo de Patagon Store
"""
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'Patagon Store <ventas@patagonstore.cl>'),
            recipient_list=[order.customer_email],
            fail_silently=False,
        )

    @action(detail=False, methods=['post'], url_path='track')
    def track(self, request):
        """El código acredita acceso; correo e ID nunca son credenciales."""
        token = request.data.get('token') if isinstance(request.data, dict) else None
        if not isinstance(token, str) or not 40 <= len(token) <= 64:
            raise ValidationError({'detail': 'Ingresa el código privado recibido al comprar.'})
        order = Order.objects.filter(tracking_token=token, created_at__gte=timezone.now() - timedelta(days=30)).first()
        if not order:
            return Response({'detail': 'Código no válido o vencido.'}, status=404, headers={'Cache-Control': 'no-store'})
        return Response({key: getattr(order, key) for key in ['id', 'status', 'payment_status', 'created_at']}, headers={'Cache-Control': 'no-store'})


class ReviewPagination(PageNumberPagination):
    page_size = 20


class TestimonialViewSet(viewsets.ModelViewSet):
    pagination_class = ReviewPagination
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(approved=True)

    def perform_create(self, serializer):
        serializer.save(approved=False)

    def get_permissions(self):
        if self.action in ['list', 'create']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], url_path='seed')
    def seed(self, request):
        """Poblar o restablecer testimonios iniciales de demostración."""
        if not settings.ALLOW_DEMO_DATA:
            raise PermissionDenied('La carga de ejemplos está deshabilitada en este entorno.')
        created_count = 0
        for item in INITIAL_TESTIMONIALS_DATA:
            obj, created = Testimonial.objects.get_or_create(
                name=item['name'],
                comment=item['comment'],
                defaults=item
            )
            if created:
                created_count += 1
        return Response(
            {"message": f"Testimonios sincronizados. {created_count} testimonios agregados."},
            status=status.HTTP_200_OK
        )


INITIAL_COUPONS = [
    {
        "code": "PATAGON10",
        "discount_type": "percentage",
        "discount_value": 10,
        "active": True,
        "min_purchase": 0,
    },
    {
        "code": "ENVIOGRATIS",
        "discount_type": "shipping",
        "discount_value": 3990,
        "active": True,
        "min_purchase": 10000,
    },
    {
        "code": "BIENVENIDO5",
        "discount_type": "fixed",
        "discount_value": 5000,
        "active": True,
        "min_purchase": 20000,
    },
]


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.action in ['validate']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], url_path='validate')
    def validate(self, request):
        code = str(request.data.get('code', '')).strip().upper()
        try:
            subtotal = max(0, int(request.data.get('subtotal', 0) or 0))
            shipping = 0 if subtotal >= 30000 else 3990
        except (TypeError, ValueError):
            raise ValidationError({'detail': 'Subtotal inválido.'})

        if not code:
            return Response(
                {"valid": False, "detail": "Debes ingresar un código de cupón."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Nunca crear promociones de ejemplo a partir de una consulta real.
        if settings.ALLOW_DEMO_DATA and not Coupon.objects.exists():
            for c in INITIAL_COUPONS:
                Coupon.objects.get_or_create(code=c['code'], defaults=c)

        coupon = Coupon.objects.filter(code=code, active=True).first()
        if not coupon:
            return Response(
                {"valid": False, "detail": "El cupón ingresado no existe o ha expirado."},
                status=status.HTTP_404_NOT_FOUND
            )

        if subtotal < coupon.min_purchase:
            return Response(
                {
                    "valid": False,
                    "detail": f"Este cupón requiere una compra mínima de ${coupon.min_purchase:,} CLP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calcular monto de descuento
        discount_amount = 0
        if coupon.discount_type == 'percentage':
            discount_amount = int(subtotal * (coupon.discount_value / 100))
        elif coupon.discount_type == 'fixed':
            discount_amount = min(subtotal, coupon.discount_value)
        elif coupon.discount_type == 'shipping':
            discount_amount = shipping

        return Response({
            "valid": True,
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "discount_amount": discount_amount,
            "min_purchase": coupon.min_purchase,
            "message": f"¡Cupón {coupon.code} aplicado con éxito!",
        }, status=status.HTTP_200_OK)



