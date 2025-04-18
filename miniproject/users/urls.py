from django.urls import path
from .views import (
    RegisterView, LoginView, UserListView, UserProfileView,
    TraderDashboardView, SalesDashboardView, CustomerDashboardView, UserProfileUpdateView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),  # Admin-only
    path('profile/', UserProfileView.as_view(), name='user-profile'),  # Authenticated users
    path('trader-dashboard/', TraderDashboardView.as_view(), name='trader-dashboard'),  # Traders only
    path('sales-dashboard/', SalesDashboardView.as_view(), name='sales-dashboard'),  # Sales Reps only
    path('customer-dashboard/', CustomerDashboardView.as_view(), name='customer-dashboard'),  # Customers only
    path('profile/', UserProfileUpdateView.as_view(), name='user-profile-update'),
]
