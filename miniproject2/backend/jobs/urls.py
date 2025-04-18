"""
URL configuration for mysite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from jobs.views import JobListView, JobCreateView, JobUpdateView, JobDeleteView

urlpatterns = [
    path('', JobListView.as_view(), name='job_list'),  # View all jobs
    path('create/', JobCreateView.as_view(), name='job_create'),  # Create job
    path('<int:job_id>/update/', JobUpdateView.as_view(), name='job_update'),  # Update job
    path('<int:job_id>/delete/', JobDeleteView.as_view(), name='job_delete'),  # Delete job
]


