from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

ORDER_TYPES = (
    ('buy', 'Buy'),
    ('sell', 'Sell'),
)

ORDER_STATUS = (
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
)

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=ORDER_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_type} {self.quantity} {self.product.name} @ {self.price}"

class Transaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="transactions")
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="buyer_transactions")
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="seller_transactions")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction: {self.quantity} {self.product.name} @ {self.price}"
