import razorpay
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
import json

from .models import Order, OrderItem
from .email_utils import send_order_confirmation_email, send_payment_confirmation_email, send_admin_order_notification


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayPaymentViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create a Razorpay order for payment"""
        try:
            order_id = request.data.get('order_id')
            amount = request.data.get('amount')  # Amount in paise
            
            if not order_id or not amount:
                return Response(
                    {'error': 'Order ID and amount are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize Razorpay client
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            # Create Razorpay order
            razorpay_order = client.order.create({
                'amount': amount,  # Amount in paise
                'currency': 'INR',
                'payment_capture': '1'  # Auto capture
            })
            
            # Update order with Razorpay order ID
            order = Order.objects.get(id=order_id, user=request.user)
            order.razorpay_order_id = razorpay_order['id']
            order.save()
            
            return Response({
                'success': True,
                'razorpay_order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'key_id': settings.RAZORPAY_KEY_ID,
                'name': 'Reyan Luxe',
                'description': f'Order #{order.order_number}',
                'prefill': {
                    'name': request.user.username,
                    'email': request.user.email,
                    'contact': request.user.phone_number or ''
                }
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """Verify Razorpay payment signature"""
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            order_id = request.data.get('order_id')
            
            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id]):
                return Response(
                    {'error': 'All payment details are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize Razorpay client
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            # Verify payment signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            try:
                client.utility.verify_payment_signature(params_dict)
                
                # Update order status
                order = Order.objects.get(id=order_id, user=request.user)
                order.payment_status = 'completed'
                order.transaction_id = razorpay_payment_id
                order.status = 'confirmed'
                order.save()
                
                # Send email notifications
                try:
                    # Get order items for email
                    order_items = OrderItem.objects.filter(order=order)
                    items_data = []
                    for item in order_items:
                        items_data.append({
                            'name': item.product.name if item.product else f"Custom {item.product_type}",
                            'quantity': item.quantity,
                            'price': float(item.price),
                            'total': float(item.price * item.quantity)
                        })
                    
                    # Send payment confirmation email
                    send_payment_confirmation_email(
                        user_email=request.user.email,
                        order_number=order.order_number,
                        amount=float(order.total_amount),
                        payment_method='Razorpay'
                    )
                    
                    # Send order confirmation email
                    send_order_confirmation_email(
                        user_email=request.user.email,
                        order_number=order.order_number,
                        total_amount=float(order.total_amount),
                        items=items_data,
                        shipping_address=order.shipping_address
                    )
                    
                    # Send admin notification
                    send_admin_order_notification(
                        order_number=order.order_number,
                        total_amount=float(order.total_amount),
                        customer_email=request.user.email,
                        customer_name=request.user.username
                    )
                    
                except Exception as email_error:
                    # Log email error but don't fail the payment verification
                    print(f"Email notification error: {email_error}")
                
                return Response({
                    'success': True,
                    'message': 'Payment verified successfully',
                    'order_id': order.id
                })
                
            except razorpay.errors.SignatureVerificationError:
                # Payment verification failed
                order = Order.objects.get(id=order_id, user=request.user)
                order.payment_status = 'failed'
                order.save()
                
                return Response(
                    {'error': 'Payment verification failed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def payment_failed(self, request):
        """Handle payment failure"""
        try:
            order_id = request.data.get('order_id')
            error_code = request.data.get('error_code')
            error_description = request.data.get('error_description')
            
            if not order_id:
                return Response(
                    {'error': 'Order ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update order status
            order = Order.objects.get(id=order_id, user=request.user)
            order.payment_status = 'failed'
            order.notes = f"Payment failed: {error_code} - {error_description}"
            order.save()
            
            return Response({
                'success': True,
                'message': 'Payment failure recorded'
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@csrf_exempt
def razorpay_webhook(request):
    """Handle Razorpay webhook events"""
    if request.method == 'POST':
        try:
            # Verify webhook signature
            webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
            if webhook_secret:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                client.utility.verify_webhook_signature(
                    request.body.decode(),
                    request.META.get('HTTP_X_RAZORPAY_SIGNATURE'),
                    webhook_secret
                )
            
            # Process webhook event
            webhook_data = json.loads(request.body.decode())
            event = webhook_data.get('event')
            
            if event == 'payment.captured':
                payment_data = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})
                order_id = payment_data.get('notes', {}).get('order_id')
                
                if order_id:
                    try:
                        order = Order.objects.get(id=order_id)
                        order.payment_status = 'completed'
                        order.transaction_id = payment_data.get('id')
                        order.status = 'confirmed'
                        order.save()
                    except Order.DoesNotExist:
                        pass
            
            return JsonResponse({'status': 'ok'})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)