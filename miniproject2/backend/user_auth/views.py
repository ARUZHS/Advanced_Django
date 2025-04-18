from datetime import timedelta

from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed

from mysite import settings
from user_auth.models import EmailVerificationToken, User, PasswordResetToken
from user_auth.serializers import RegisterSerializer, LoginSerializer, LogoutSerializer, UserSerializer, \
    PasswordResetConfirmSerializer, PasswordResetSerializer
import logging

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        # Create verification token
        token = EmailVerificationToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        print(f"Generated token: {token.token}")
        logger.debug(f"Generated verification token for {user.email}: {token.token}")

        # Send email
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"
        try:
            send_mail(
                subject="Verify Your Email",
                message=f"Click here to verify your email: {verification_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print("Email sent successfully")
            logger.info(f"Verification email sent to {user.email}")
        except Exception as e:
            print(f"Email failed: {str(e)}")
            logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
            user.delete()  # Rollback if email fails
            raise  # Let the view handle the error

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "message": "Registration successful. Please verify your email.",
            "role": serializer.validated_data['role']  # Include role in response
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(generics.GenericAPIView):
    queryset = EmailVerificationToken.objects.all()

    def get_token(self, request):
        # Try to get token from query params (GET request)
        token = request.query_params.get('token')
        if not token:
            # Try to get token from request data (POST request)
            token = request.data.get('token')
        return token

    def get(self, request, *args, **kwargs):
        return self.verify_email(request)

    def post(self, request, *args, **kwargs):
        return self.verify_email(request)

    def verify_email(self, request):
        token = self.get_token(request)
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification_token = self.get_queryset().get(token=token)
            if verification_token.expires_at < timezone.now():
                logger.warning(f"Expired verification token used: {token}")
                verification_token.delete()
                return Response({"error": "Token has expired"}, status=status.HTTP_400_BAD_REQUEST)

            user = verification_token.user
            if user.is_verified:
                logger.info(f"Email verified for user: {user.email}")
                return Response({"message": "Email already verified"}, status=status.HTTP_200_OK)

            user.is_verified = True
            user.is_active = True
            user.save()
            verification_token.delete()

            return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)

        except EmailVerificationToken.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error verifying email: {str(e)}")
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.debug(f"Login attempt with data: {request.data}")
        
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Login validation failed: {serializer.errors}")
            return Response(
                {"error": "Invalid input", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            logger.debug("Attempting to validate credentials")
            validated_data = serializer.validated_data
            logger.info(f"Login successful for user: {validated_data.get('username')}")
            return Response(validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            logger.warning(f"Authentication failed: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutAPIView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f"User logged out: {request.user.email}")
        return Response({"message": "Logout successful"}, status=status.HTTP_204_NO_CONTENT)



class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        logger.info(f"Password reset requested for {user.email}")

        # Create reset token
        token = PasswordResetToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(hours=1)  # 1-hour expiration
        )
        print(f"Reset token: {token.token}")  # Debug
        logger.debug(f"Password reset token: {token.token}")

        # Send email
        reset_link = f"{settings.FRONTEND_URL}/password-reset-confirm?token={token.token}"
        try:
            send_mail(
                subject="Reset Your Password",
                message=f"Click here to reset your password: {reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print("Reset email sent successfully")
        except Exception as e:
            print(f"Email failed: {str(e)}")
            token.delete()
            logger.error(f"Failed to send reset email to {user.email}: {str(e)}")
            return Response({"error": "Failed to send email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if reset_token.expires_at < timezone.now():
                reset_token.delete()
                return Response({"error": "Token has expired"}, status=status.HTTP_400_BAD_REQUEST)

            user = reset_token.user
            user.set_password(password)  # Hash the new password
            user.save()
            reset_token.delete()  # One-time use

            logger.info(f"Password reset confirmed for {user.email}")
            return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            logger.warning(f"Invalid password reset token: {token}")
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
