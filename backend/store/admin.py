
from django.contrib import admin
from .models import Bracelet, Category

class BraceletAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'badge', 'is_signature_piece', 'signature_category', 'category_ref')
    search_fields = ('name', 'description')
    list_filter = ('category', 'badge', 'is_signature_piece', 'signature_category', 'category_ref')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'price')
        }),
        ('Media', {
            'fields': ('image', 'imageUrl')
        }),
        ('Classification', {
            'fields': ('category', 'badge', 'is_signature_piece', 'signature_category', 'category_ref')
        }),
    )

admin.site.register(Bracelet, BraceletAdmin)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'group', 'parent', 'is_active', 'position', 'show_in_menu')
    search_fields = ('name', 'slug')
    list_filter = ('group', 'is_active', 'show_in_menu')
