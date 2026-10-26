from django.contrib import admin
from .models import Product, Order, Testimonial

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'price', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('id',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'customer_email', 'total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'customer_email', 'city')
    # El flujo API concilia pagos e inventario; no permitir ediciones que lo omitan.
    readonly_fields = tuple(field.name for field in Order._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'city', 'rating', 'approved', 'created_at')
    list_filter = ('approved', 'rating', 'created_at')
    search_fields = ('name', 'city', 'comment')
    readonly_fields = ('created_at',)

