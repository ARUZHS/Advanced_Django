from django.contrib import admin

from jobs.models import JobListing


class JobListingInline(admin.TabularInline):
    model = JobListing
    extra = 1
    fields = ('title', 'company', 'is_active')
    can_delete = True

@admin.register(JobListing)
class JobListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'posted_by', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at', 'posted_by__role')
    search_fields = ('title', 'company', 'posted_by__username')
    readonly_fields = ('created_at',)
    fieldsets = (
        (None, {'fields': ('title', 'company', 'description', 'location', 'posted_by', 'is_active')}),
        ('Metadata', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        # Optional: Restrict recruiters to see only their own jobs (not applied here, but could be)
        qs = super().get_queryset(request)
        return qs
