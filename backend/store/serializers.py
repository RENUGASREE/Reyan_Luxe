
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Bracelet, User, OTP, CartItem, Category


class BraceletSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Bracelet
        fields = [
            "id",
            "name",
            "description",
            "price",
            "imageUrl",
            "created_at",
            "updated_at",
            "category",
            "badge",
            "is_signature_piece",
            "signature_category",
            "category_slug",
            "category_name",
        ]

    def get_imageUrl(self, obj):
        # Prefer the uploaded image URL if present, otherwise fall back to stored imageUrl
        try:
            if obj.image:
                return obj.image.url
        except Exception:
            pass
        return obj.imageUrl

    def get_category_slug(self, obj):
        try:
            return obj.category_ref.slug if obj.category_ref else None
        except Exception:
            return None

    def get_category_name(self, obj):
        try:
            return obj.category_ref.name if obj.category_ref else None
        except Exception:
            return None


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "phone_number", "address")


class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = "__all__"





class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "parent",
            "group",
            "is_active",
            "position",
            "show_in_menu",
        ]


class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(label="Email")
    password = serializers.CharField(label="Password", style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                username=email, password=password)
            if not user:
                msg = ('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = ('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs
