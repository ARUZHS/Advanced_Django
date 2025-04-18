from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import F
import sentry_sdk
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsAdmin
from .models import SalesOrder, Invoice, Discount
from django.db import transaction as db_transaction
from .serializers import SalesOrderSerializer, InvoiceSerializer, DiscountSerializer
from products.models import Product
from rest_framework import serializers
import pdfkit
from django.core.files.base import ContentFile
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

# ✅ Create Sales Order
class SalesOrderCreateView(generics.CreateAPIView):
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        # Check if product has enough stock
        if product.quantity_available < quantity:
            raise serializers.ValidationError("Not enough stock available")

        # Apply discount if available
        discount = Discount.objects.filter(product=product, active=True).first()
        discount_amount = 0
        if discount:
            discount_amount = (product.price * discount.discount_percentage) / 100

        total_price = (product.price - discount_amount) * quantity

        serializer.save(customer=self.request.user, price=total_price)

        # Reduce product stock
        product.quantity_available = F('quantity_available') - quantity
        product.save()

# ✅ List Sales Orders (for customers)
class SalesOrderListView(generics.ListAPIView):
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SalesOrder.objects.filter(customer=self.request.user)

# ✅ Approve Sales Order (Admin Only)
class SalesOrderApprovalView(generics.UpdateAPIView):
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, *args, **kwargs):
        order = get_object_or_404(SalesOrder, id=kwargs["pk"], status="pending")

        with db_transaction.atomic():
            order.status = "approved"
            order.save()

            # Generate PDF Invoice
            pdf_content = f"""
            <h1>Invoice for Order #{order.id}</h1>
            <p>Product: {order.product.name}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Total Price: ${order.price}</p>
            <p>Customer: {order.customer.username}</p>
            """

            pdf_file = pdfkit.from_string(pdf_content, False)
            invoice = Invoice.objects.create(sales_order=order)
            invoice.pdf.save(f"invoice_{order.id}.pdf", ContentFile(pdf_file))

        return Response({"message": "Order approved and invoice generated", "invoice_id": invoice.id}, status=status.HTTP_200_OK)

# ✅ Generate Invoice (PDF)
class InvoiceGenerateView(generics.CreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order = get_object_or_404(SalesOrder, id=kwargs["pk"], status="approved")

        # Generate PDF content
        pdf_content = f"""
        <h1>Invoice for Order #{order.id}</h1>
        <p>Product: {order.product.name}</p>
        <p>Quantity: {order.quantity}</p>
        <p>Total Price: ${order.price}</p>
        <p>Customer: {order.customer.username}</p>
        """

        pdf_file = pdfkit.from_string(pdf_content, False)
        invoice = Invoice.objects.create(sales_order=order)
        invoice.pdf.save(f"invoice_{order.id}.pdf", ContentFile(pdf_file))

        return Response({"message": "Invoice generated", "invoice_id": invoice.id}, status=status.HTTP_201_CREATED)

# ✅ List Discounts
class DiscountListView(generics.ListAPIView):
    serializer_class = DiscountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Discount.objects.filter(active=True)

class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        order = get_object_or_404(SalesOrder, id=order_id, customer=request.user)

        try:
            # Create a PaymentIntent in Stripe
            intent = stripe.PaymentIntent.create(
                amount=int(order.price * 100),  # Convert to cents
                currency="usd",
                payment_method_types=["card"],
            )

            return Response({"client_secret": intent.client_secret}, status=status.HTTP_201_CREATED)

        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)