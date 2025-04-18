from django.contrib.auth.models import AbstractUser
from django.db import models

# User Roles
USER_ROLES = (
    ('admin', 'Admin'),
    ('trader', 'Trader'),
    ('sales_rep', 'Sales Representative'),
    ('customer', 'Customer'),
)

class CustomUser(AbstractUser):
    role = models.CharField(max_length=20, choices=USER_ROLES, default='customer')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    def __str__(self):
        return self.username
