from . import views
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import VerifyEmailView, PasswordResetView, PasswordResetConfirmView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name="register"),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('login/', views.LoginAPIView.as_view(), name="login"),
    path('logout/', views.LogoutAPIView.as_view(), name="logout"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]