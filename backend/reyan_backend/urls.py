
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from store.admin_site import custom_admin_site

urlpatterns = [
    # Serve the built frontend index.html (for production/deploy)
    path('', TemplateView.as_view(template_name='index.html'), name='frontend'),
    path('admin/', custom_admin_site.urls),
    path('api/', include('store.urls')),
    path('api/', include('contact.urls')),
    path('api/newsletter/', include('newsletter.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
