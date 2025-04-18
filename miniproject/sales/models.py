from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

SALES_ORDER_STATUS = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('processed', 'Processed'),
    ('cancelled', 'Cancelled'),
)

class SalesOrder(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=SALES_ORDER_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.product.name} x {self.quantity} ({self.status})"

class Invoice(models.Model):
    sales_order = models.OneToOneField(SalesOrder, on_delete=models.CASCADE)
    pdf = models.FileField(upload_to='invoices/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice for Order {self.sales_order.id}"

class Discount(models.Model):
    name = models.CharField(max_length=100)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    product = models.ManyToManyField(Product)
    active = models.BooleanField(default=True)
    valid_until = models.DateTimeField()

    def __str__(self):
        return f"{self.name} - {self.discount_percentage}%"
