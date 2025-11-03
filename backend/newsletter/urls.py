from django.urls import path
from .views import NewsletterSubscribeView, NewsletterCreateView, NewsletterUnsubscribeView

urlpatterns = [
    path('subscribe/', NewsletterSubscribeView.as_view(), name='newsletter_subscribe'),
    path('create/', NewsletterCreateView.as_view(), name='newsletter_create'),
    path('unsubscribe/', NewsletterUnsubscribeView.as_view(), name='newsletter_unsubscribe'),
]