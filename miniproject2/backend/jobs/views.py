# resumes/views.py
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from jobs.models import JobListing
from jobs.serializers import JobListingSerializer
from resumes.models import Resume
import os
import logging
logger = logging.getLogger(__name__)

# Load skills from skills.txt (same as tasks.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_FILE = os.path.join(BASE_DIR, 'resumes', 'skills.txt')

with open(SKILLS_FILE, 'r') as f:
    SKILLS = {line.strip().lower() for line in f if line.strip()}

@method_decorator(cache_page(60 * 15), name='dispatch')  # Cache for 15 min
class JobListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        logger.info("View logic executed — this should appear only once if cache works.")
        jobs = JobListing.objects.filter(is_active=True)
        serializer = JobListingSerializer(jobs, many=True)
        return Response({"jobs": serializer.data}, status=status.HTTP_200_OK)

class JobCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Check if user is a recruiter
        if request.user.role != 'recruiter':
            return Response(
                {"error": "Only recruiters can create job listings"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = JobListingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            job = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobUpdateView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    def put(self, request, job_id):
        if request.user.role != 'recruiter':
            return Response({"error": "Only recruiters can update jobs"}, status=status.HTTP_403_FORBIDDEN)

        try:
            job = JobListing.objects.get(id=job_id, posted_by=request.user)
        except JobListing.DoesNotExist:
            return Response({"error": "Job not found or not owned by you"}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobListingSerializer(job, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobDeleteView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, job_id):
        # if request.user.role != 'recruiter':
        #     return Response({"error": "Only recruiters can delete jobs"}, status=status.HTTP_403_FORBIDDEN)

        try:
            job = JobListing.objects.get(id=job_id, posted_by=request.user)
        except JobListing.DoesNotExist:
            return Response({"error": "Job not found or not owned by you"}, status=status.HTTP_404_NOT_FOUND)

        job.delete()
        return Response({"message": "Job deleted successfully"}, status=status.HTTP_204_NO_CONTENT)