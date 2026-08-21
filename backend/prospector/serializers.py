from rest_framework import serializers
from .models import TargetLocation, ProjectAnalysis, Lead

class TargetLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetLocation
        fields = '__all__'

class ProjectAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAnalysis
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'
