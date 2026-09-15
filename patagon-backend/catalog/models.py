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
    description = models.TextField(verbose_name="Descripción")
    image = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL de Imagen")
    image_file = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Archivo de imagen (JPEG/PNG)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        ordering = ['-id']
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return f"{self.title} - ${self.price:,}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Estado")
    items_data = models.JSONField(default=list, verbose_name="Productos del pedido")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"

    def __str__(self):
        return f"Pedido #{self.id} - {self.customer_name} (${self.total:,})"


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
