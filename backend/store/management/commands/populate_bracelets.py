from django.core.management.base import BaseCommand
from store.models import Bracelet

class Command(BaseCommand):
    help = 'Populates the database with initial bracelet data'

    def handle(self, *args, **options):
        bracelets_data = [
            {
                "name": "Obsidian Elegance",
                "description": "Handcrafted obsidian beads with rose gold accent",
                "price": 149,
                "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
                "category": "womens_bracelets",
                "badge": "Premium Collection",
                "is_signature_piece": True
            },
            {
                "name": "The Grace",
                "description": "Delicate rose gold chain with curated charms",
                "price": 199,
                "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
                "category": "gold_bracelets",
                "badge": "Bestseller",
                "is_signature_piece": False
            },
            {
                "name": "Minimalist Chic",
                "description": "Clean lines with subtle sophistication",
                "price": 89,
                "image": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
                "category": "fashion_bracelets",
                "badge": "New Arrival",
                "is_signature_piece": True
            },
            {
                "name": "Earthen Vibes",
                "description": "Natural stone beads with earth tones",
                "price": 129,
                "image": "https://pixabay.com/get/g37654aaac49552584c34efc20e1b4e2b4aa5e915dd7ec08d528e2f9ac417278d5c9299a264bd7485d44212682aa2a63863429a75593dade23a44c94a3fefb21c_1280.jpg",
                "category": "gemstone_bracelets",
                "badge": "Limited Edition",
                "is_signature_piece": False
            },
            {
                "name": "Celestial Dreams",
                "description": "Vintage-inspired celestial charm collection",
                "price": 179,
                "image": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
                "category": "charm_bracelets",
                "badge": "Featured",
                "is_signature_piece": True
            },
            {
                "name": "Pure Essence",
                "description": "Contemporary design meets timeless appeal",
                "price": 119,
                "image": "/placeholders/placeholder.png",
                "category": "crystal_bracelets",
                "badge": "Modern Classic",
                "is_signature_piece": False
            }
        ]

        for bracelet_data in bracelets_data:
            Bracelet.objects.create(**bracelet_data)
            self.stdout.write(self.style.SUCCESS(f'Successfully added bracelet: {bracelet_data["name"]}'))

        self.stdout.write(self.style.SUCCESS('Successfully populated bracelet data.'))