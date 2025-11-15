from django.core.management.base import BaseCommand
from django.utils.text import slugify
from store.models import Bracelet, Chain, Category


class Command(BaseCommand):
    help = 'Populate products with sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate products...'))
        self.create_categories_and_subcategories()
        
        # Create sample bracelets
        self.create_bracelets()
        
        # Create sample chains  
        self.create_chains()
        
        self.stdout.write(self.style.SUCCESS('Product population completed!'))

    def create_categories_and_subcategories(self):
        bracelet_categories = [
            'Beaded Bracelet',
            'Thread Bracelet',
            'Charm Bracelet',
            'Macramé Bracelet',
            'Leather Bracelet',
            'Wire-Wrapped Bracelet',
            'Resin Bracelet',
            'Fabric Bracelet',
            'Crochet Bracelet',
            'Embroidery Bracelet',
        ]

        bracelet_subcategories = [
            'Gemstone Beads',
            'Seed Beads',
            'Evil Eye',
            'Friendship Style',
            'Adjustable Knot',
            'Wrap Style',
            'Braided',
            'Personalized Name',
            'Birthstone',
            'Minimalist',
            'Colorful Patterns',
            'Nature-Inspired (leaves, flowers)',
        ]

        chain_categories = [
            'Beaded Chain',
            'Thread Chain',
            'Wire Chain',
            'Resin Chain',
            'Fabric Chain',
            'Crochet Chain',
            'Leather Cord Chain',
        ]

        chain_subcategories = [
            'Pendant Holder',
            'Layered Style',
            'Choker Style',
            'Adjustable Length',
            'Minimalist',
            'Statement Piece',
            'Nature-Inspired',
            'Colorful Beads',
            'Name/Letter Charms',
            'Festival/Traditional Style',
        ]

        position_counter = 1

        def ensure_category(group: str, name: str):
            nonlocal position_counter
            slug = f"{group}-{slugify(name)}"
            obj, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'group': group,
                    'show_in_menu': True,
                    'position': position_counter,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created {group} category: {name}"))
            position_counter += 1
            return obj

        for name in bracelet_categories:
            ensure_category('bracelet', name)

        for name in bracelet_subcategories:
            ensure_category('bracelet', name)

        for name in chain_categories:
            ensure_category('chain', name)

        for name in chain_subcategories:
            ensure_category('chain', name)

    def create_bracelets(self):
        # Get or create women's category
        womens_category, _ = Category.objects.get_or_create(
            slug='bracelet-womens-bracelets',
            defaults={
                'name': "Women's Bracelets",
                'group': 'bracelet',
                'show_in_menu': True,
                'position': 1
            }
        )
        
        # Create sample bracelets
        bracelets = [
            {
                'name': 'Elegant Gold Chain Bracelet',
                'description': 'A sophisticated gold chain bracelet perfect for everyday wear.',
                'price': 8999,
                'category': womens_category,
                'is_signature_piece': True,
                'signature_category': 'fashion',
                'stock_quantity': 15,
                'is_in_stock': True,
                'is_active': True
            },
            {
                'name': 'Silver Cuban Link Bracelet',
                'description': 'Classic Cuban link bracelet in sterling silver for men.',
                'price': 6499,
                'category': womens_category,
                'is_signature_piece': True,
                'signature_category': 'trending',
                'stock_quantity': 20,
                'is_in_stock': True,
                'is_active': True
            }
        ]
        
        for bracelet_data in bracelets:
            bracelet, created = Bracelet.objects.get_or_create(
                name=bracelet_data['name'],
                defaults=bracelet_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created bracelet: {bracelet.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Bracelet already exists: {bracelet.name}'))

    def create_chains(self):
        # Get or create chain category
        chain_category, _ = Category.objects.get_or_create(
            slug='chain-cuban-chains',
            defaults={
                'name': 'Cuban Chains',
                'group': 'chain',
                'show_in_menu': True,
                'position': 1
            }
        )
        
        # Create sample chains
        chains = [
            {
                'name': '14K Gold Cuban Link Chain',
                'description': 'Premium 14K gold Cuban link chain.',
                'price': 18999,
                'category': chain_category,
                'is_signature_piece': True,
                'signature_category': 'trending',
                'stock_quantity': 7,
                'is_in_stock': True,
                'is_active': True
            },
            {
                'name': 'Sterling Silver Rope Chain',
                'description': 'Classic sterling silver rope chain.',
                'price': 8499,
                'category': chain_category,
                'is_signature_piece': True,
                'signature_category': 'fashion',
                'stock_quantity': 12,
                'is_in_stock': True,
                'is_active': True
            }
        ]
        
        for chain_data in chains:
            chain, created = Chain.objects.get_or_create(
                name=chain_data['name'],
                defaults=chain_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created chain: {chain.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Chain already exists: {chain.name}'))