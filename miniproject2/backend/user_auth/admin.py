from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from jobs.admin import JobListingInline
from resumes.admin import ResumeInline
from user_auth.models import User


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_verified', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Role Info', {'fields': ('role', 'is_verified')}),
    )
    inlines = [ResumeInline, JobListingInline]  # Show related resumes and job listings

admin.site.register(User, UserAdmin)