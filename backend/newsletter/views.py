from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NewsletterSubscriber, Newsletter
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.conf import settings
from .serializers import NewsletterSerializer
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class NewsletterSubscribeView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if NewsletterSubscriber.objects.filter(email=email).exists():
            return Response({'message': 'You are already subscribed.'}, status=status.HTTP_200_OK)

        NewsletterSubscriber.objects.create(email=email)

        # Send initial newsletter email
        subject = 'Welcome to the World of Reyan Luxe!'
        html_message = render_to_string('newsletter/welcome_email.html', {'email': email})
        plain_message = strip_tags(html_message)
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]

        try:
            email_message = EmailMultiAlternatives(subject, plain_message, from_email, recipient_list)
            email_message.attach_alternative(html_message, "text/html")
            email_message.send()
            return Response({'message': 'Successfully subscribed! A welcome email has been sent.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
                import traceback
                traceback.print_exc()
                return Response({'error': f'Subscription successful, but failed to send welcome email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NewsletterCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = NewsletterSerializer(data=request.data)
        if serializer.is_valid():
            newsletter = serializer.save()
            subscribers = NewsletterSubscriber.objects.all()
            recipient_list = [subscriber.email for subscriber in subscribers]

            subject = newsletter.subject
            html_message = render_to_string('newsletter/newsletter_email.html', {'subject': newsletter.subject, 'content': newsletter.content})
            plain_message = strip_tags(html_message)
            from_email = settings.EMAIL_HOST_USER

            try:
                email_message = EmailMultiAlternatives(subject, plain_message, from_email, recipient_list)
                email_message.attach_alternative(html_message, "text/html")
                email_message.send()
                return Response({'message': 'Newsletter created and sent to all subscribers!'}, status=status.HTTP_201_CREATED)
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response({'error': f'Newsletter created, but failed to send emails: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NewsletterUnsubscribeView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subscriber = NewsletterSubscriber.objects.get(email=email)
            subscriber.delete()
            return render(request, 'newsletter/unsubscribed.html')
        except NewsletterSubscriber.DoesNotExist:
            return render(request, 'newsletter/unsubscribed.html', {'message': 'Email not found in subscription list.'})
        except Exception as e:
            return render(request, 'newsletter/unsubscribed.html', {'message': f'An error occurred during unsubscription: {str(e)}'})

    def get(self, request, *args, **kwargs):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subscriber = NewsletterSubscriber.objects.get(email=email)
            subscriber.delete()
            return render(request, 'newsletter/unsubscribed.html')
        except NewsletterSubscriber.DoesNotExist:
            return render(request, 'newsletter/unsubscribed.html', {'message': 'Email not found in subscription list.'})
        except Exception as e:
            return render(request, 'newsletter/unsubscribed.html', {'message': f'An error occurred during unsubscription: {str(e)}'})
