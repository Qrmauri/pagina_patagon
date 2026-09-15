from rest_framework import serializers
from .models import Product, Order, Testimonial

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'category', 'price', 'description', 'image', 'image_file', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image_file:
            if request:
                data['image'] = request.build_absolute_uri(instance.image_file.url)
            else:
                data['image'] = instance.image_file.url
        return data


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'customer_email',
            'customer_phone',
            'address',
            'city',
            'postal_code',
            'total',
            'subtotal',
            'shipping',
            'status',
            'items_data',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'status']


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'city', 'rating', 'comment', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5 estrellas.")
        return value

