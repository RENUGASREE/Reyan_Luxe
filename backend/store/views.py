
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client
import random
import datetime
from django.utils import timezone

from .models import Bracelet, OTP, CartItem, Category, Chain, Order, OrderItem, ProductReview, Material, ChainType, BraceletSize, CustomizationOption, CustomizedProduct, WishlistItem
from .email_utils import send_order_status_update_email
from .serializers import (
    BraceletSerializer, UserSerializer, OTPSerializer, CartItemSerializer, 
    CategorySerializer, ChainSerializer, OrderSerializer, ProductReviewSerializer,
    MaterialSerializer, ChainTypeSerializer, BraceletSizeSerializer, 
    CustomizationOptionSerializer, CustomizedProductSerializer, WishlistItemSerializer
)

User = get_user_model()


class BraceletViewSet(viewsets.ModelViewSet):
    queryset = Bracelet.objects.all()
    serializer_class = BraceletSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ChainViewSet(viewsets.ModelViewSet):
    queryset = Chain.objects.all()
    serializer_class = ChainSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]





class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username
        })


class SendOTPView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def send_otp(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

        otp_secret = ''.join(random.choices('0123456789', k=6))
        OTP.objects.update_or_create(user=user, defaults={'otp_secret': otp_secret, 'is_verified': False, 'created_at': timezone.now()})

        # Send OTP via email (robust in development)
        email_sent = True
        email_error = None
        try:
            send_mail(
                'Your OTP for Reyan Luxe',
                f'Your OTP is {otp_secret}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            # In development, we still proceed and expose minimal debug info
            email_sent = False
            email_error = str(e)

        # Send OTP via SMS (Twilio) if settings are configured
        try:
            if (
                user.phone_number
                and getattr(settings, 'TWILIO_ACCOUNT_SID', '')
                and getattr(settings, 'TWILIO_AUTH_TOKEN', '')
                and getattr(settings, 'TWILIO_PHONE_NUMBER', '')
            ):
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                client.messages.create(
                    body=f'Your OTP is {otp_secret}',
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=user.phone_number
                )
        except Exception:
            # Silently ignore SMS errors to avoid blocking email-based OTP
            pass

        payload = {'message': 'OTP generated'}
        if email_sent:
            payload['email'] = 'sent'
        else:
            payload['email'] = 'failed'
            if settings.DEBUG:
                payload['debug'] = {'otp_preview': otp_secret, 'email_error': email_error}

        return Response(payload, status=status.HTTP_200_OK)


class VerifyOTPView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')

        if not email or not otp_code:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp_instance = OTP.objects.get(user=user, otp_secret=otp_code)

            # Check if OTP is expired (e.g., 5 minutes)
            if (timezone.now() - otp_instance.created_at).total_seconds() > 300:
                return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

            otp_instance.is_verified = True
            otp_instance.save()

            return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        new_password = request.data.get('new_password')

        if not email or not otp_code or not new_password:
            return Response({'error': 'Email, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp_instance = OTP.objects.get(user=user, otp_secret=otp_code, is_verified=True)

            user.set_password(new_password)
            user.save()

            otp_instance.delete()  # OTP used, so delete it

            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid or unverified OTP'}, status=status.HTTP_400_BAD_REQUEST)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        if order.status in ['pending', 'confirmed']:
            order.status = 'cancelled'
            order.save()
            
            # Send order cancellation email
            try:
                send_order_status_update_email(
                    user_email=request.user.email,
                    order_number=order.order_number,
                    status='cancelled'
                )
            except Exception as email_error:
                print(f"Email notification error: {email_error}")
            
            return Response({'message': 'Order cancelled successfully'})
        return Response({'error': 'Order cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status with email notification"""
        order = self.get_object()
        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')
        
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if status can be updated
        if order.status == 'delivered' and new_status != 'delivered':
            return Response({'error': 'Delivered orders cannot be updated'}, status=status.HTTP_400_BAD_REQUEST)
        
        if order.status == 'cancelled':
            return Response({'error': 'Cancelled orders cannot be updated'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status
        order.status = new_status
        if tracking_number:
            order.tracking_number = tracking_number
        order.save()
        
        # Send email notification
        try:
            send_order_status_update_email(
                user_email=order.user.email,
                order_number=order.order_number,
                status=new_status,
                tracking_number=tracking_number
            )
        except Exception as email_error:
            print(f"Email notification error: {email_error}")
        
        return Response({
            'message': f'Order status updated to {new_status}',
            'order_id': order.id,
            'new_status': new_status
        })


class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        product_type = self.request.query_params.get('product_type')
        product_id = self.request.query_params.get('product_id')
        
        queryset = ProductReview.objects.filter(is_approved=True)
        
        if product_type and product_id:
            queryset = queryset.filter(product_type=product_type, product_id=product_id)
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WishlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [AllowAny]


class ChainTypeViewSet(viewsets.ModelViewSet):
    queryset = ChainType.objects.all()
    serializer_class = ChainTypeSerializer
    permission_classes = [AllowAny]


class BraceletSizeViewSet(viewsets.ModelViewSet):
    queryset = BraceletSize.objects.all()
    serializer_class = BraceletSizeSerializer
    permission_classes = [AllowAny]


class CustomizationOptionViewSet(viewsets.ModelViewSet):
    queryset = CustomizationOption.objects.all()
    serializer_class = CustomizationOptionSerializer
    permission_classes = [AllowAny]


class CustomizedProductViewSet(viewsets.ModelViewSet):
    serializer_class = CustomizedProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomizedProduct.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def generate_preview(self, request):
        """Generate a preview image for the customized product"""
        customization_data = request.data.get('customization_data')
        product_type = request.data.get('product_type')
        
        if not customization_data or not product_type:
            return Response(
                {'error': 'Customization data and product type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Here you would integrate with an image generation service
        # For now, we'll return a placeholder response
        preview_url = f"https://via.placeholder.com/400x400/000000/FFFFFF?text=Custom+{product_type.title()}"
        
        return Response({
            'preview_url': preview_url,
            'message': 'Preview generated successfully'
        })

    @action(detail=True, methods=['post'])
    def add_to_cart(self, request, pk=None):
        """Add the customized product to cart"""
        customized_product = self.get_object()
        
        # Create a cart item with the customized product
        cart_item = CartItem.objects.create(
            user=request.user,
            product_type='customized',
            product_id=customized_product.id,
            quantity=1,
            price=customized_product.total_price
        )
        
        return Response({
            'message': 'Customized product added to cart successfully',
            'cart_item_id': cart_item.id
        })
