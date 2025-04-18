from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """Allow access only to Admin users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsTrader(BasePermission):
    """Allow access only to Trader users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'trader'

class IsSalesRep(BasePermission):
    """Allow access only to Sales Representatives"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'sales_rep'

class IsCustomer(BasePermission):
    """Allow access only to Customers"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'
