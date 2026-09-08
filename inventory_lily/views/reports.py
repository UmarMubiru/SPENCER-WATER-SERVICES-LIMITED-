from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory_lily.permissions import (
    IsInventoryUser,
)

from inventory_lily.services.report_service import (
    ReportService,
)


class InventoryReportAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsInventoryUser,
    ]

    def get(self, request):
        days = request.query_params.get('days')
        days = int(days) if days else None

        return Response({

            "inventory":
            ReportService.inventory_summary(days),

            "suppliers":
            ReportService.supplier_summary(days),

            "movements":
            ReportService.movement_summary(days),

        })
