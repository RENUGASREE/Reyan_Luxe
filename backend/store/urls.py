
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BraceletViewSet, UserViewSet, SendOTPView, VerifyOTPView, ResetPasswordView, 
    CartItemViewSet, CategoryViewSet, ChainViewSet, OrderViewSet, ProductReviewViewSet,
    MaterialViewSet, ChainTypeViewSet, BraceletSizeViewSet, CustomizationOptionViewSet, CustomizedProductViewSet,
    WishlistItemViewSet
)
from .authentication import CustomAuthToken, RegisterView
from .payment_views import RazorpayPaymentViewSet, razorpay_webhook

router = DefaultRouter()
router.register(r'bracelets', BraceletViewSet)
router.register(r'chains', ChainViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)

# Customization endpoints
router.register(r'materials', MaterialViewSet)
router.register(r'chain-types', ChainTypeViewSet)
router.register(r'bracelet-sizes', BraceletSizeViewSet)
router.register(r'customization-options', CustomizationOptionViewSet)
router.register(r'customized-products', CustomizedProductViewSet, basename='customized-product')

router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ProductReviewViewSet, basename='review')
router.register(r'payments/razorpay', RazorpayPaymentViewSet, basename='razorpay-payment')
router.register(r'wishlist', WishlistItemViewSet, basename='wishlist')

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('register/', RegisterView.as_view(), name='api_register'),
    # These endpoints are already under '/api/' from root urls
    path('send-otp/', SendOTPView.as_view({'post': 'send_otp'}), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view({'post': 'verify_otp'}), name='verify_otp'),
    path('reset-password/', ResetPasswordView.as_view({'post': 'reset_password'}), name='reset_password'),
    path('payments/razorpay/webhook/', razorpay_webhook, name='razorpay_webhook'),
    path('', include(router.urls)),
]
