from django.urls import path
from .views import OrderCreateView, OrderHistoryView, OrderBookView, ExecuteTradeView

urlpatterns = [
    path('place_order/', OrderCreateView.as_view(), name='place-order'),
    path('order_history/', OrderHistoryView.as_view(), name='order-history'),
    path('order_book/', OrderBookView.as_view(), name='order-book'),
    path('execute_trade/', ExecuteTradeView.as_view(), name='execute-trade'),
]
