from django.db import models

from user_auth.models import User


class JobListing(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    posted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='job_listings',
        default=18,
        # limit_choices_to={'role': 'recruiter'}  # Restrict to recruiters in admin/forms
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} at {self.company}"
