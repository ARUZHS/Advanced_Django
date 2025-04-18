from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework import permissions, status
from resumes.models import Resume, ResumeFeedback
from resumes.serializers import ResumeSerializer
import requests
from resumes.tasks import process_resume, generate_resume_feedback
import json
from django.conf import settings
import re
from openai import OpenAI
import os


class ResumeFeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, resume_id):
        try:
            # Get the resume
            resume = Resume.objects.get(id=resume_id, user=request.user)
            
            # Get or create feedback
            feedback, created = ResumeFeedback.objects.get_or_create(resume=resume)
            
            # If feedback is pending, start the task
            if feedback.status == 'pending':
                generate_resume_feedback.delay(feedback.id)
                return Response({
                    'status': 'pending',
                    'message': 'Your feedback will be displayed soon.'
                })
            
            # If feedback is completed, return the content
            if feedback.status == 'completed':
                return Response({
                    'status': 'completed',
                    'content': feedback.content
                })
            
            # If feedback failed
            return Response({
                'status': 'failed',
                'message': 'Failed to generate feedback. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Resume.DoesNotExist:
            return Response({
                'error': 'Resume not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResumeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get resumes for the authenticated user
        resumes = Resume.objects.filter(user=request.user).order_by('-created_at')
        serializer = ResumeSerializer(resumes, many=True, context={'request': request})
        return Response(
            {"resumes": serializer.data},
            status=status.HTTP_200_OK
        )


class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ResumeSerializer(
            data=request.data, 
            context={'request': request}
        )
        if serializer.is_valid():
            resume = serializer.save()
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResumeDeleteView(DestroyAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        resume = self.get_object()
        
        # Check if the user owns this resume
        if resume.user != request.user:
            return Response(
                {"error": "You don't have permission to delete this resume"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete the file from storage if it exists
        if resume.file:
            file_path = os.path.join(settings.MEDIA_ROOT, str(resume.file))
            if os.path.exists(file_path):
                os.remove(file_path)

        # Delete the resume object
        resume.delete()
        
        return Response(
            {"message": "Resume deleted successfully"},
            status=status.HTTP_200_OK
        )
