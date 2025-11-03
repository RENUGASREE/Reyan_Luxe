from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ContactSerializer
from django.core.mail import EmailMessage

class ContactView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data['name']
            email = serializer.validated_data['email']
            message = serializer.validated_data['message']

            email_subject = f'Contact Form Submission from {name}'
            email_body = f'Name: {name}\nEmail: {email}\nMessage: {message}'
            from_email = 'reyanluxe@gmail.com'  # Your verified sending email
            recipient_list = ['reyanluxe@gmail.com']  # Your receiving email

            email_message = EmailMessage(
                email_subject,
                email_body,
                from_email,
                recipient_list,
                reply_to=[email]  # Set the reply-to address to the sender's email
            )
            email_message.send(fail_silently=False)

            return Response({"message": "Contact form submitted successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
