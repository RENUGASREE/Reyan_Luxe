
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError


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


class Bracelet(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    imageUrl = models.URLField(blank=True, null=True)
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





class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_id = models.CharField(max_length=255)  # Assuming product_id can be a string
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.quantity})"
