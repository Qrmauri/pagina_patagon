from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Order, Testimonial
from .serializers import ProductSerializer, OrderSerializer, TestimonialSerializer

INITIAL_PRODUCTS_DATA = [
    {
        "title": "Peluche Clásico",
        "category": "juguetes",
        "price": 15990,
        "image": "https://images.unsplash.com/photo-1594787318286-3d835c1cabab?w=400&auto=format&fit=crop",
        "description": "Peluche suave y adorable para los más pequeños",
    },
    {
        "title": "Consola Gaming",
        "category": "electrónica",
        "price": 299990,
        "image": "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&auto=format&fit=crop",
        "description": "Última generación para juegos ultra HD",
    },
    {
        "title": "Libro Aventuras",
        "category": "libros",
        "price": 8990,
        "image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop",
        "description": "Historias fascinantes para todas las edades",
    },
    {
        "title": "Robot Educativo",
        "category": "juguetes",
        "price": 45990,
        "image": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop",
        "description": "Aprende programación de forma divertida",
    },
    {
        "title": "Audífonos Premium",
        "category": "electrónica",
        "price": 129990,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
        "description": "Sonido cristalino con cancelación de ruido",
    },
    {
        "title": "Libro de Ciencia",
        "category": "libros",
        "price": 12990,
        "image": "https://images.unsplash.com/photo-150784272343-583f20270319?w=400&auto=format&fit=crop",
        "description": "Explora los misterios del universo",
    },
]

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
    ordering_fields = ['price', 'created_at', 'id']
    ordering = ['id']

    @action(detail=False, methods=['post'], url_path='seed')
    def seed(self, request):
        """Poblar o restablecer productos de demostración."""
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
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    @action(detail=False, methods=['post'], url_path='seed')
    def seed(self, request):
        """Poblar o restablecer testimonios iniciales de demostración."""
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

