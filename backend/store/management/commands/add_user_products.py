from django.core.management.base import BaseCommand
from django.utils.text import slugify
from store.models import Bracelet, Chain, Category


BRACELET_URLS = [
    "https://i.pinimg.com/originals/0f/9a/03/0f9a03af2d62f310c61450e6c32046ea.jpg",
    "https://bucketlistadventuresguide.com/wp-content/uploads/2016/04/DIY-bracelets.jpg",
    "https://i.pinimg.com/originals/47/8f/43/478f43fd7677f3701be946edf020cdb5.jpg",
    "https://i.pinimg.com/originals/eb/17/22/eb1722088ab6e0ba5c3af6188bbd5505.jpg",
    "https://i.pinimg.com/originals/59/c7/54/59c754998901f93dd2e6109ac1fbf998.jpg",
    "https://tse4.mm.bing.net/th/id/OIP.hL5rtCZgs29Fw7bH-4lqqAHaG6?pid=Api&P=0&h=180",
    "https://i.pinimg.com/originals/ed/cf/92/edcf9231657fe9e78f10aa86839bc5d1.jpg",
    "https://i.pinimg.com/originals/3b/ec/90/3bec90dffb1c6448fab5c294aa70a192.jpg",
]

CHAIN_URLS = [
    "https://i.ytimg.com/vi/UsOpJcUUq9U/maxresdefault.jpg",
    "https://tse1.mm.bing.net/th/id/OIP.rdp0ldJ4OqaKR-FNYW5BggHaHa?pid=Api&P=0&h=180",
    "https://i.ytimg.com/vi/yZr2BvDOhhU/maxresdefault.jpg?sqp=-oaymwEoCIAKENAF8quKqQMcGADwAQH4AbYIgAKAD4oCDAgAEAEYQCBlKCgwDw==&rs=AOn4CLAFdSHQPyx5VRRTy24UkZ9Fcn6stQ",
    "https://tse4.mm.bing.net/th/id/OIP.5mDuLRgv-wFcIOW830qJbAHaHa?pid=Api&P=0&h=180",
    "https://i.etsystatic.com/20467051/r/il/51ce4a/6652020835/il_340x270.6652020835_nxso.jpg",
    "https://mokshaaccessories.com/wp-content/uploads/2024/12/4545.jpg",
    "https://i.ytimg.com/vi/UsOpJcUUq9U/maxresdefault.jpg",
]


def ensure_category(name: str, group: str) -> Category:
    slug = slugify(name)
    category, _ = Category.objects.get_or_create(
        slug=slug,
        defaults={
            "name": name,
            "group": group,
            "is_active": True,
            "position": 0,
            "show_in_menu": True,
        },
    )
    return category


class Command(BaseCommand):
    help = "Import user-provided bracelet and chain products using given image URLs"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting import of user products"))

        bracelet_cat = ensure_category("User Bracelets", "bracelet")
        chain_cat = ensure_category("User Chains", "chain")

        created_count = 0
        # Bracelets
        for idx, url in enumerate(BRACELET_URLS, start=1):
            name = f"Bracelet #{idx}"
            defaults = {
                "description": "Imported bracelet based on provided image URL",
                "price": 1999,
                "imageUrl": url,
                "stock_quantity": 20,
                "is_active": True,
                "badge": "Bestseller",
                "is_signature_piece": True,
                "category": "Bracelet",
                "category_ref": bracelet_cat,
            }
            obj, created = Bracelet.objects.get_or_create(name=name, defaults=defaults)
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created bracelet: {name}"))
            else:
                # update image if missing
                if not obj.imageUrl:
                    obj.imageUrl = url
                    obj.save(update_fields=["imageUrl"])
                self.stdout.write(self.style.WARNING(f"Bracelet exists: {name}"))

        # Chains
        for idx, url in enumerate(CHAIN_URLS, start=1):
            name = f"Chain #{idx}"
            defaults = {
                "description": "Imported chain based on provided image URL",
                "price": 4999,
                "imageUrl": url,
                "stock_quantity": 15,
                "is_active": True,
                "badge": "Bestseller",
                "is_signature_piece": True,
                "category": "Chain",
                "category_ref": chain_cat,
            }
            obj, created = Chain.objects.get_or_create(name=name, defaults=defaults)
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created chain: {name}"))
            else:
                if not obj.imageUrl:
                    obj.imageUrl = url
                    obj.save(update_fields=["imageUrl"])
                self.stdout.write(self.style.WARNING(f"Chain exists: {name}"))

        self.stdout.write(self.style.SUCCESS(f"Import completed. Created {created_count} new products."))

