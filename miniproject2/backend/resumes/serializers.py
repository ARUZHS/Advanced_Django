# resumes/serializers.py
from marshmallow import Schema, fields, post_load
from rest_framework import serializers

from resumes.models import Resume

# class ResumeSerializer(Schema):
#     id = fields.Int(dump_only=True)
#     user = fields.Nested('UserSchema', dump_only=True)  # Nested schema for user
#     file = fields.Str(required=True)  # File path as string
#     title = fields.Str(allow_none=True)
#     extracted_data = fields.Dict(dump_only=True)  # Read-only
#     uploaded_at = fields.DateTime(dump_only=True)  # Read-only
#     processed = fields.Boolean(dump_only=True)  # Read-only
#
#     class UserSchema(Schema):
#         id = fields.Int()
#         username = fields.Str()
#
#     @post_load
#     def make_resume(self, data, **kwargs):
#         # Convert validated data to a Resume instance
#         return Resume(**data)
#
#     def to_representation(self, obj):
#         # Customize serialization from Resume model
#         data = super().dump(obj)
#         data['file'] = obj.file.path  # Convert FileField to path
#         return data

class ResumeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    file = serializers.FileField()
    file_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'file', 'file_name', 'file_url', 'description', 'skills', 'created_at', 'updated_at', 'username']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'username']

    def get_file_name(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else None

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['file'] = instance.file.url
        return representation

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({"error": "Authentication required"})
        
        # Create the resume with the authenticated user
        resume = Resume.objects.create(
            user=request.user,
            **validated_data
        )
        return resume