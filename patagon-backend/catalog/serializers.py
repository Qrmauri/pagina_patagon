from rest_framework import serializers
from .models import Product, Order, Testimonial, Coupon, StoreSettings
from urllib.parse import urlsplit
import re
import json

class ProductSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        if hasattr(data, 'getlist'):
            data = data.dict()
            if data.get('cost_price') == '':
                data['cost_price'] = None
            for key in ['shopping_needs', 'gallery', 'specifications']:
                if key in data:
                    try:
                        data[key] = json.loads(data[key])
                    except (ValueError, TypeError):
                        raise serializers.ValidationError({key: 'Formato JSON inválido.'})
        return super().to_internal_value(data)

    shopping_needs = serializers.ListField(child=serializers.ChoiceField(choices=['escolar', 'oficina', 'crear', 'regalos']), max_length=4, required=False)
    gallery = serializers.ListField(child=serializers.URLField(max_length=500), max_length=8, required=False)
    specifications = serializers.DictField(child=serializers.CharField(max_length=500, allow_blank=True), required=False)

    def validate_gallery(self, value):
        if any(urlsplit(url).scheme not in ['https', 'http'] for url in value):
            raise serializers.ValidationError('Usa enlaces HTTP o HTTPS para las fotografías.')
        return list(dict.fromkeys(value))

    def validate_specifications(self, value):
        if set(value) - {'dimensions', 'materials', 'contents', 'colors'}:
            raise serializers.ValidationError('Campos permitidos: dimensions, materials, contents, colors.')
        return value

    class Meta:
        model = Product
        fields = ['id', 'title', 'category', 'price', 'stock', 'description', 'characteristics', 'shopping_needs', 'gallery', 'specifications', 'cost_price', 'image', 'image_file', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo.")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            data.pop('cost_price', None)
        if instance.image_file:
            if request:
                data['image'] = request.build_absolute_uri(instance.image_file.url)
            else:
                data['image'] = instance.image_file.url
        return data


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = ['whatsapp', 'email', 'hours', 'delivery', 'pickup', 'returns']
        extra_kwargs = {key: {'max_length': 2000} for key in ['delivery', 'pickup', 'returns']}

    def validate_whatsapp(self, value):
        if value and not re.fullmatch(r'\d{8,15}', value):
            raise serializers.ValidationError('Usa entre 8 y 15 dígitos, con código de país y sin símbolos.')
        return value


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
            'discount_amount',
            'coupon_code',
            'payment_method',
            'payment_authorization',
            'status',
            'payment_status',
            'paid_at',
            'items_data',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'total', 'subtotal', 'shipping', 'discount_amount', 'payment_authorization', 'payment_status', 'paid_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_staff:
            data['tracking_token'] = instance.tracking_token
        if not request or not request.user.is_staff:
            data['items_data'] = [{k: v for k, v in item.items() if k != 'cost_price'} for item in data['items_data']]
        return data


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'active', 'min_purchase']


class TestimonialSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(max_length=2000)
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'city', 'rating', 'comment', 'avatar', 'created_at', 'approved']
        read_only_fields = ['id', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5 estrellas.")
        return value

