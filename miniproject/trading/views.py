from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction as db_transaction
from .models import Order, Transaction
from .serializers import OrderSerializer, TransactionSerializer
from products.models import Product

# ✅ Place Buy/Sell Order
class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ✅ List User's Order History
class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(buyer=self.request.user) | Transaction.objects.filter(seller=self.request.user)

# ✅ View All Orders (Order Book)
class OrderBookView(generics.ListAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.filter(status='pending')

# ✅ Execute Trade (Matches Buy/Sell Orders)
class ExecuteTradeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get("order_id")
        trade_transaction = None
        try:
            with db_transaction.atomic():
                order = Order.objects.select_for_update().get(id=order_id, status="pending")

                # Find opposite orders (buyers for sell orders and sellers for buy orders)
                opposite_order = Order.objects.filter(
                    product=order.product,
                    order_type="buy" if order.order_type == "sell" else "sell",
                    status="pending",
                    price=order.price
                ).first()

                if not opposite_order:
                    return Response({"error": "No matching orders found"}, status=status.HTTP_400_BAD_REQUEST)

                # Determine trade quantity
                trade_quantity = min(order.quantity, opposite_order.quantity)

                # Create transaction
                transaction = Transaction.objects.create(
                    order=order,
                    buyer=opposite_order.user if order.order_type == "sell" else order.user,
                    seller=order.user if order.order_type == "sell" else opposite_order.user,
                    product=order.product,
                    quantity=trade_quantity,
                    price=order.price
                )

                # Update order quantities
                order.quantity -= trade_quantity
                opposite_order.quantity -= trade_quantity

                if order.quantity == 0:
                    order.status = "completed"
                if opposite_order.quantity == 0:
                    opposite_order.status = "completed"

                order.save()
                opposite_order.save()

                return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)

        except Order.DoesNotExist:
            return Response({"error": "Order not found or already processed"}, status=status.HTTP_400_BAD_REQUEST)

