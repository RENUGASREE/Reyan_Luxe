
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='store_users_groups',
        blank=True,
        help_text=
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='store_users_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.email


class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_secret = models.CharField(max_length=16)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.otp_secret}"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)
    GROUP_CHOICES = [
        ("bracelet", "Bracelet"),
        ("chain", "Chain"),
    ]
    group = models.CharField(max_length=32, choices=GROUP_CHOICES, default="bracelet")
    is_active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0)
    show_in_menu = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ChainCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "Chain Category"
        verbose_name_plural = "Chain Categories"


class Bracelet(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    imageUrl = models.URLField(blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    # New admin-visible fields
    IMAGE_CATEGORY_CHOICES = [
        ("Bracelet", "Bracelet"),
        ("Necklace", "Necklace"),
    ]

    BADGE_CHOICES = [
        ("Modern Classic", "Modern Classic"),
        ("Limited Edition", "Limited Edition"),
        ("Bestseller", "Bestseller"),
    ]

    # Optional local image upload; in serializers we will surface its URL via imageUrl
    image = models.ImageField(upload_to="bracelets/", blank=True, null=True)
    category = models.CharField(max_length=32, choices=IMAGE_CATEGORY_CHOICES, default="Bracelet")
    badge = models.CharField(max_length=64, choices=BADGE_CHOICES, blank=True, default="Modern Classic")
    is_signature_piece = models.BooleanField(default=False)
    SIGNATURE_CATEGORY_CHOICES = [
        ("fashion", "Fashion Bracelets"),
        ("trending", "Trending Bracelets"),
        ("latest", "Latest Bracelet"),
    ]
    signature_category = models.CharField(max_length=32, choices=SIGNATURE_CATEGORY_CHOICES, blank=True, null=True)
    # New dynamic category support
    category_ref = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name='bracelets')

    def __str__(self):
        return self.name

    def is_in_stock(self):
        return self.stock_quantity > 0





class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_id = models.CharField(max_length=255)  # Assuming product_id can be a string
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.quantity})"


class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_type = models.CharField(max_length=20, choices=[('bracelet', 'Bracelet'), ('chain', 'Chain')])
    product_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product_type', 'product_id')

    def __str__(self):
        return f"{self.user.email} - {self.product_type} #{self.product_id}"


class Chain(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    imageUrl = models.URLField(blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)

    IMAGE_CATEGORY_CHOICES = [
        ("Chain", "Chain"),
        ("Necklace", "Necklace"),
    ]

    BADGE_CHOICES = [
        ("Modern Classic", "Modern Classic"),
        ("Limited Edition", "Limited Edition"),
        ("Bestseller", "Bestseller"),
    ]

    image = models.ImageField(upload_to="chains/", blank=True, null=True)
    category = models.CharField(max_length=32, choices=IMAGE_CATEGORY_CHOICES, default="Chain")
    badge = models.CharField(max_length=64, choices=BADGE_CHOICES, blank=True, default="Modern Classic")
    is_signature_piece = models.BooleanField(default=False)
    SIGNATURE_CATEGORY_CHOICES = [
        ("fashion", "Fashion Chains"),
        ("trending", "Trending Chains"),
        ("latest", "Latest Chain"),
    ]
    signature_category = models.CharField(max_length=32, choices=SIGNATURE_CATEGORY_CHOICES, blank=True, null=True)
    category_ref = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='chains',
        limit_choices_to={'group': 'chain'}
    )

    def __str__(self):
        return self.name

    def is_in_stock(self):
        return self.stock_quantity > 0


class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    billing_address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_method = models.CharField(max_length=50, default='cod')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD{timezone.now().strftime('%Y%m%d%H%M%S')}{self.user.id}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_type = models.CharField(max_length=20, choices=[('bracelet', 'Bracelet'), ('chain', 'Chain')])
    product_id = models.PositiveIntegerField()
    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    customization_details = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class ProductReview(models.Model):
    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_type = models.CharField(max_length=20, choices=[('bracelet', 'Bracelet'), ('chain', 'Chain')])
    product_id = models.PositiveIntegerField()
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'product_type', 'product_id']

    def __str__(self):
        return f"{self.user.email} - {self.rating} stars"


class Material(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=[
        ('metal', 'Metal'),
        ('bead', 'Bead'),
        ('charm', 'Charm'),
        ('chain', 'Chain'),
        ('clasp', 'Clasp'),
    ])
    color = models.CharField(max_length=50, blank=True, null=True)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.type})"


class ChainType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class BraceletSize(models.Model):
    SIZE_CHOICES = [
        ('XS', 'Extra Small (5.5-6.0")'),
        ('S', 'Small (6.0-6.5")'),
        ('M', 'Medium (6.5-7.0")'),
        ('L', 'Large (7.0-7.5")'),
        ('XL', 'Extra Large (7.5-8.0")'),
        ('CUSTOM', 'Custom Size'),
    ]
    
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, unique=True)
    measurement_inches = models.CharField(max_length=20, blank=True, null=True)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.size} - {self.measurement_inches}"


class CustomizationOption(models.Model):
    OPTION_TYPES = [
        ('chain_type', 'Chain Type'),
        ('bead_type', 'Bead Type'),
        ('charm_type', 'Charm Type'),
        ('color', 'Color'),
        ('size', 'Size'),
        ('clasp_type', 'Clasp Type'),
        ('engraving', 'Engraving'),
    ]
    
    name = models.CharField(max_length=100)
    option_type = models.CharField(max_length=20, choices=OPTION_TYPES)
    product_type = models.CharField(max_length=20, choices=[('bracelet', 'Bracelet'), ('chain', 'Chain')])
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    image_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.option_type})"


class CustomizedProduct(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_type = models.CharField(max_length=20, choices=[('bracelet', 'Bracelet'), ('chain', 'Chain')])
    base_product_id = models.PositiveIntegerField(null=True, blank=True)
    customization_data = models.JSONField()
    preview_image = models.ImageField(upload_to="custom_previews/", blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_saved = models.BooleanField(default=False)
    cart_item = models.OneToOneField(CartItem, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Custom {self.product_type} for {self.user.email}"
