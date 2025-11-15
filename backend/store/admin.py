
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Bracelet, Category, User, ChainCategory, Chain

class BraceletAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'price', 'category', 'badge', 'is_signature_piece',
        'signature_category', 'category_ref', 'created_at', 'updated_at'
    )
    search_fields = ('name', 'description')
    list_filter = ('category', 'badge', 'is_signature_piece', 'signature_category', 'category_ref')
    autocomplete_fields = ('category_ref',)
    list_editable = ('badge', 'is_signature_piece', 'signature_category')
    save_on_top = True
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


class ChainAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'price', 'category', 'badge', 'is_signature_piece',
        'signature_category', 'category_ref', 'created_at', 'updated_at'
    )
    search_fields = ('name', 'description')
    list_filter = ('category', 'badge', 'is_signature_piece', 'signature_category', 'category_ref')
    autocomplete_fields = ('category_ref',)
    list_editable = ('badge', 'is_signature_piece', 'signature_category')
    save_on_top = True
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

admin.site.register(Chain, ChainAdmin)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'group', 'parent', 'is_active', 'position', 'show_in_menu')
    search_fields = ('name', 'slug')
    list_filter = ('group', 'is_active', 'show_in_menu')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('parent',)
    list_editable = ('position', 'show_in_menu', 'is_active')
    ordering = ('group', 'position', 'name')
    save_on_top = True

    actions = ('activate_selected', 'deactivate_selected', 'show_in_menu_selected', 'hide_from_menu_selected')

    def activate_selected(self, request, queryset):
        queryset.update(is_active=True)
    activate_selected.short_description = 'Activate selected categories'

    def deactivate_selected(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_selected.short_description = 'Deactivate selected categories'

    def show_in_menu_selected(self, request, queryset):
        queryset.update(show_in_menu=True)
    show_in_menu_selected.short_description = 'Show selected in menu'

    def hide_from_menu_selected(self, request, queryset):
        queryset.update(show_in_menu=False)
    hide_from_menu_selected.short_description = 'Hide selected from menu'


@admin.register(ChainCategory)
class ChainCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'position', 'show_in_menu')
    search_fields = ('name', 'slug')
    list_filter = ('is_active', 'show_in_menu')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('parent',)
    list_editable = ('position', 'show_in_menu', 'is_active')
    ordering = ('position', 'name')
    save_on_top = True

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(group='chain')

    def save_model(self, request, obj, form, change):
        obj.group = 'chain'
        super().save_model(request, obj, form, change)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'first_name', 'last_name', 'phone_number', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    list_display = ('email', 'username', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username')
    ordering = ('email',)
