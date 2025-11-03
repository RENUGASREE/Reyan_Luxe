
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from newsletter.views import NewsletterSubscribeView
from store.views import SendOTPView, VerifyOTPView, ResetPasswordView
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', RedirectView.as_view(url='http://localhost:5173/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
    path('api/', include('contact.urls')),
    path('api/newsletter/', include('newsletter.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
