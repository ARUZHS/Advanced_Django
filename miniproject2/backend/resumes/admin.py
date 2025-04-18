from django.contrib import admin
from .models import Resume

class ResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'file', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

class ResumeInline(admin.StackedInline):
    model = Resume
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('file', 'description', 'skills', 'created_at', 'updated_at')

admin.site.register(Resume, ResumeAdmin)