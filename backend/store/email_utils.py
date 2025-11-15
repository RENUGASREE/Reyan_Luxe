from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from typing import List, Optional


def send_order_confirmation_email(
    user_email: str, 
    order_number: str, 
    total_amount: float,
    items: List[dict],
    shipping_address: str
) -> bool:
    """Send order confirmation email to customer"""
    try:
        subject = f'Order Confirmation - #{order_number} | Reyan Luxe'
        
        # Render HTML email template
        html_message = render_to_string('emails/order_confirmation.html', {
            'order_number': order_number,
            'total_amount': total_amount,
            'items': items,
            'shipping_address': shipping_address,
            'customer_name': items[0]['customer_name'] if items else 'Valued Customer',
            'support_email': settings.DEFAULT_FROM_EMAIL,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending order confirmation email: {e}")
        return False


def send_order_status_update_email(
    user_email: str,
    order_number: str,
    status: str,
    tracking_number: Optional[str] = None
) -> bool:
    """Send order status update email to customer"""
    try:
        status_messages = {
            'confirmed': 'Your order has been confirmed and is being prepared for shipment.',
            'shipped': f'Your order has been shipped. Tracking number: {tracking_number}' if tracking_number else 'Your order has been shipped.',
            'delivered': 'Your order has been delivered successfully.',
            'cancelled': 'Your order has been cancelled.',
        }
        
        subject = f'Order Update - #{order_number} | Reyan Luxe'
        message = status_messages.get(status, f'Your order status has been updated to: {status}')
        
        # Render HTML email template
        html_message = render_to_string('emails/order_status_update.html', {
            'order_number': order_number,
            'status': status,
            'message': message,
            'tracking_number': tracking_number,
            'support_email': settings.DEFAULT_FROM_EMAIL,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending order status update email: {e}")
        return False


def send_payment_confirmation_email(
    user_email: str,
    order_number: str,
    amount: float,
    payment_method: str
) -> bool:
    """Send payment confirmation email to customer"""
    try:
        subject = f'Payment Confirmed - Order #{order_number} | Reyan Luxe'
        
        # Render HTML email template
        html_message = render_to_string('emails/payment_confirmation.html', {
            'order_number': order_number,
            'amount': amount,
            'payment_method': payment_method,
            'support_email': settings.DEFAULT_FROM_EMAIL,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending payment confirmation email: {e}")
        return False


def send_admin_order_notification(
    order_number: str,
    total_amount: float,
    customer_email: str,
    customer_name: str
) -> bool:
    """Send order notification to admin"""
    try:
        subject = f'New Order - #{order_number} | Reyan Luxe'
        message = f'''
        New order received:
        
        Order Number: {order_number}
        Customer: {customer_name}
        Customer Email: {customer_email}
        Total Amount: ₹{total_amount}
        
        Please log in to the admin panel to process the order.
        '''
        
        # Send to admin email (can be configured in settings)
        admin_email = getattr(settings, 'ADMIN_EMAIL', settings.DEFAULT_FROM_EMAIL)
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending admin order notification: {e}")
        return False