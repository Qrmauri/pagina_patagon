from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('juguetes', 'Juguetes'),
        ('electrónica', 'Electrónica'),
        ('libros', 'Libros'),
    ]

    title = models.CharField(max_length=200, verbose_name="Título")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='juguetes', verbose_name="Categoría")
    price = models.PositiveIntegerField(verbose_name="Precio (CLP)")
    stock = models.PositiveIntegerField(default=10, verbose_name="Stock disponible")
    description = models.TextField(verbose_name="Descripción")
    characteristics = models.TextField(blank=True, default='', verbose_name="Características y compatibilidad")
    shopping_needs = models.JSONField(default=list, blank=True, verbose_name="Selecciones de compra")
    gallery = models.JSONField(default=list, blank=True, verbose_name="Imágenes adicionales")
    specifications = models.JSONField(default=dict, blank=True, verbose_name="Ficha técnica")
    cost_price = models.PositiveIntegerField(blank=True, null=True, verbose_name="Costo unitario (CLP)")
    image = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL de Imagen")
    image_file = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Archivo de imagen (JPEG/PNG)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        ordering = ['-id']
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return f"{self.title} - ${self.price:,} (Stock: {self.stock})"


class StoreSettings(models.Model):
    whatsapp = models.CharField(max_length=15, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    hours = models.CharField(max_length=250, blank=True, default='')
    delivery = models.TextField(blank=True, default='')
    pickup = models.TextField(blank=True, default='')
    returns = models.TextField(blank=True, default='')


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'En preparación'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    customer_name = models.CharField(max_length=150, verbose_name="Nombre del cliente")
    customer_email = models.EmailField(verbose_name="Email")
    customer_phone = models.CharField(max_length=50, verbose_name="Teléfono")
    address = models.CharField(max_length=255, verbose_name="Dirección")
    city = models.CharField(max_length=100, verbose_name="Ciudad")
    postal_code = models.CharField(max_length=20, verbose_name="Código postal")
    total = models.PositiveIntegerField(verbose_name="Total")
    subtotal = models.PositiveIntegerField(default=0, verbose_name="Subtotal")
    shipping = models.PositiveIntegerField(default=0, verbose_name="Costo de Envío")
    discount_amount = models.PositiveIntegerField(default=0, verbose_name="Descuento (CLP)")
    coupon_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Cupón aplicado")
    payment_method = models.CharField(max_length=50, default='webpay', verbose_name="Método de pago")
    payment_authorization = models.CharField(max_length=100, blank=True, null=True, verbose_name="Código de autorización")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Estado")
    payment_status = models.CharField(max_length=20, choices=[('pending', 'Pendiente'), ('paid', 'Confirmado')], default='pending')
    paid_at = models.DateTimeField(blank=True, null=True)
    items_data = models.JSONField(default=list, verbose_name="Productos del pedido")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"

    def __str__(self):
        return f"Pedido #{self.id} - {self.customer_name} (${self.total:,})"


class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percentage', 'Porcentaje'),
        ('fixed', 'Monto fijo'),
        ('shipping', 'Envío gratis'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name="Código del cupón")
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='percentage', verbose_name="Tipo de descuento")
    discount_value = models.PositiveIntegerField(default=10, verbose_name="Valor del descuento")
    active = models.BooleanField(default=True, verbose_name="Activo")
    min_purchase = models.PositiveIntegerField(default=0, verbose_name="Compra mínima requerida")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cupón de descuento"
        verbose_name_plural = "Cupones de descuento"

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.discount_value})"


class Testimonial(models.Model):
    name = models.CharField(max_length=150, verbose_name="Nombre del cliente")
    city = models.CharField(max_length=100, blank=True, default="Chile", verbose_name="Ciudad / Región")
    rating = models.PositiveSmallIntegerField(default=5, verbose_name="Calificación (1-5)")
    comment = models.TextField(verbose_name="Comentario o experiencia")
    avatar = models.CharField(max_length=20, blank=True, default="👤", verbose_name="Avatar / Emoji")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de publicación")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Testimonio / Reseña"
        verbose_name_plural = "Testimonios / Reseñas"

    def __str__(self):
        return f"{self.name} ({self.rating}★) - {self.city}"
