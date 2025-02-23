import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Mini_project.settings")

app = Celery("Mini_project")
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks in installed apps
app.autodiscover_tasks()
