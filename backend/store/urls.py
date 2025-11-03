
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BraceletViewSet, UserViewSet, SendOTPView, VerifyOTPView, ResetPasswordView, CartItemViewSet, CategoryViewSet
from .authentication import CustomAuthToken

router = DefaultRouter()
router.register(r'bracelets', BraceletViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)

router.register(r'cart-items', CartItemViewSet, basename='cart-item')

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api/send-otp/', SendOTPView.as_view({'post': 'send_otp'}), name='send_otp'),
    path('api/verify-otp/', VerifyOTPView.as_view({'post': 'verify_otp'}), name='verify_otp'),
    path('api/reset-password/', ResetPasswordView.as_view({'post': 'reset_password'}), name='reset_password'),
    path('', include(router.urls)),
]
