
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import Bracelet, User, OTP, CartItem, Category, Chain, Order, OrderItem, ProductReview, Material, ChainType, BraceletSize, CustomizationOption, CustomizedProduct, WishlistItem


class BraceletSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()

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
            "stock_quantity",
            "is_active",
            "sku",
            "is_in_stock",
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

    def get_is_in_stock(self, obj):
        return obj.is_in_stock()

    def get_category_name(self, obj):
        try:
            return obj.category_ref.name if obj.category_ref else None
        except Exception:
            return None


class ChainSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Chain
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
            "stock_quantity",
            "is_active",
            "sku",
            "is_in_stock",
        ]

    def get_imageUrl(self, obj):
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

    def get_is_in_stock(self, obj):
        return obj.is_in_stock()


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


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'total_amount',
            'shipping_address', 'billing_address', 'phone_number', 'email',
            'notes', 'created_at', 'updated_at', 'payment_method', 'transaction_id', 'items'
        ]


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'user_name', 'product_type', 'product_id', 'rating',
            'title', 'comment', 'is_verified_purchase', 'created_at', 'is_approved'
        ]
        read_only_fields = ['created_at', 'is_approved']
    
    def get_user_name(self, obj):
        return obj.user.username if obj.user.username else obj.user.email.split('@')[0]


class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = '__all__'


class CustomAuthTokenSerializer(serializers.Serializer):
    # Accept either email or username
    email = serializers.CharField(label="Email", required=False)
    username = serializers.CharField(label="Username", required=False)
    password = serializers.CharField(label="Password", style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, attrs):
        identifier_email = attrs.get('email')
        identifier_username = attrs.get('username')
        password = attrs.get('password')

        if not password:
            raise serializers.ValidationError('Password is required.', code='authorization')

        # Resolve to email for authentication (USERNAME_FIELD = email)
        if not identifier_email and identifier_username:
            User = get_user_model()
            try:
                user_obj = User.objects.get(username=identifier_username)
                identifier_email = user_obj.email
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid username.', code='authorization')

        if not identifier_email:
            raise serializers.ValidationError('Must include "email" or "username" and "password".', code='authorization')

        user = authenticate(request=self.context.get('request'), username=identifier_email, password=password)
        if not user:
            raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')

        attrs['user'] = user
        return attrs


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'color', 'price_per_unit', 'image']


class ChainTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChainType
        fields = ['id', 'name', 'description', 'price_modifier']


class BraceletSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BraceletSize
        fields = ['id', 'size', 'length_cm', 'price_modifier']


class CustomizationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomizationOption
        fields = ['id', 'option_type', 'name', 'description', 'price_modifier', 'image']


class CustomizedProductSerializer(serializers.ModelSerializer):
    preview_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomizedProduct
        fields = [
            'id', 'user', 'product_type', 'base_product_id', 
            'customization_data', 'preview_image', 'preview_image_url',
            'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_preview_image_url(self, obj):
        if obj.preview_image:
            return obj.preview_image.url
        return None
    
    def create(self, validated_data):
        # Set the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
