from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from projects.models_extras import ProjectFundTransaction
from projects.serializers import ProjectFundTransactionSerializer
from projects.services.fund_service import FundService


class ProjectFundTransactionListAPIView(generics.ListCreateAPIView):
    """List and create fund transactions for a project"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectFundTransactionSerializer

    def get_queryset(self):
        queryset = ProjectFundTransaction.objects.select_related(
            'project', 'activity', 'resource_allocation', 'spent_by'
        )
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            spent_by=self.request.user,
            created_by=self.request.user
        )


class ProjectFundTransactionDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve and update fund transactions"""
    permission_classes = [IsAuthenticated]
    queryset = ProjectFundTransaction.objects.select_related(
        'project', 'activity', 'resource_allocation', 'spent_by'
    )
    serializer_class = ProjectFundTransactionSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_fund_transaction(request, pk):
    """Approve a pending fund transaction"""
    try:
        transaction = FundService.approve_transaction(pk, approved_by=request.user)
        serializer = ProjectFundTransactionSerializer(transaction)
        return Response(serializer.data)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_fund_transaction(request, pk):
    """Reject a pending or approved fund transaction"""
    reason = request.data.get('reason', '')
    try:
        transaction = FundService.reject_transaction(pk, rejected_by=request.user, reason=reason)
        serializer = ProjectFundTransactionSerializer(transaction)
        return Response(serializer.data)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_fund_transaction(request, pk):
    """Post an approved transaction to project costs"""
    try:
        transaction = FundService.post_transaction(pk, posted_by=request.user)
        serializer = ProjectFundTransactionSerializer(transaction)
        return Response(serializer.data)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_fund_transaction(request, pk):
    """Cancel a pending fund transaction"""
    reason = request.data.get('reason', '')
    try:
        transaction = FundService.cancel_transaction(pk, cancelled_by=request.user, reason=reason)
        serializer = ProjectFundTransactionSerializer(transaction)
        return Response(serializer.data)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_fund_summary(request, project_id):
    """Get fund summary for a project"""
    from projects.models import Project
    try:
        project = Project.objects.get(pk=project_id)
        summary = FundService.get_project_fund_summary(project)
        return Response(summary)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
