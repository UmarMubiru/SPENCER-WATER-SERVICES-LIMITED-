from rest_framework import serializers
from .models import Project
from .models_extras import ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = "__all__"


class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = "__all__"


class ProjectCostLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCostLine
        fields = "__all__"


class ProjectHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectHistory
        fields = "__all__"


class ProjectTeamAssignmentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTeamAssignmentHistory
        fields = "__all__"
