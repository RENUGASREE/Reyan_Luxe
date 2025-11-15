from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _

from .models import User, Bracelet, Category, ChainCategory, Chain, CartItem, Order, OrderItem, ProductReview, OTP, WishlistItem
from .admin import UserAdmin, BraceletAdmin, CategoryAdmin, ChainCategoryAdmin, ChainAdmin


class CustomAdminSite(AdminSite):
    site_header = _('Reyan Admin')
    site_title = _('Reyan Administration')
    index_title = _('Manage Store')

    def get_app_list(self, request):
        app_list = super().get_app_list(request)

        for app in app_list:
            if app.get('app_label') == 'store':
                preferred_order = [
                    'User',
                    'Chain',
                    'Category',
                    'Bracelet',
                    'CartItem',
                    'OTP',
                ]
                order_map = {name: i for i, name in enumerate(preferred_order)}
                app['models'] = sorted(app['models'], key=lambda m: order_map.get(m.get('object_name'), 999))
        return app_list


custom_admin_site = CustomAdminSite(name='custom_admin')

# Register store models with the custom site using existing ModelAdmin classes
custom_admin_site.register(User, UserAdmin)
custom_admin_site.register(Chain, ChainAdmin)
# custom_admin_site.register(ChainCategory, ChainCategoryAdmin)
custom_admin_site.register(Category, CategoryAdmin)
custom_admin_site.register(Bracelet, BraceletAdmin)
custom_admin_site.register(CartItem)
custom_admin_site.register(Order)
custom_admin_site.register(OrderItem)
custom_admin_site.register(ProductReview)
custom_admin_site.register(OTP)
custom_admin_site.register(WishlistItem)