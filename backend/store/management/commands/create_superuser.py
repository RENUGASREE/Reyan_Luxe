from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create a superuser non-interactively using provided credentials"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Email for the superuser")
        parser.add_argument(
            "--username",
            required=False,
            help="Optional username; defaults to email if not provided",
        )
        parser.add_argument("--password", required=True, help="Password for the superuser")

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"].strip()
        username = (options.get("username") or email).strip()
        password = options["password"]

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"A user with email '{email}' already exists."))
            return

        user = User.objects.create_superuser(email=email, username=username, password=password)
        self.stdout.write(self.style.SUCCESS(f"Superuser created: {user.email}"))