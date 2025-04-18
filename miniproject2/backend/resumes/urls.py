from django.urls import path

from resumes.views import ResumeUploadView, ResumeFeedbackView, ResumeListView, ResumeDeleteView

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('list/', ResumeListView.as_view(), name='resume-list'),
    path('delete/<int:pk>/', ResumeDeleteView.as_view(), name='resume-delete'),
    path('feedback/<int:resume_id>/', ResumeFeedbackView.as_view(), name='resume-feedback'),
]