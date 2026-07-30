from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def inventory_exception_handler(exc, context):

    response = exception_handler(exc, context)

    if response is not None:
        return response

    return Response(
        {
            "success": False,
            "message": "An unexpected error occurred.",
            "details": str(exc),
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )