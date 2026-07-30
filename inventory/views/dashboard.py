from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.permissions import IsInventoryUser
from inventory.services.dashboard_service import DashboardService


class InventoryDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsInventoryUser]

    def get(self, request):
        return Response(DashboardService.summary())
