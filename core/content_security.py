from functools import wraps

from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken


SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def authenticated_content_write(view):
    """Allow public reads, but require a logged-in CMS user for all mutations."""
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if request.method in SAFE_METHODS:
            return view(request, *args, **kwargs)

        if getattr(request, "user", None) and request.user.is_authenticated:
            return view(request, *args, **kwargs)

        try:
            authenticated = JWTAuthentication().authenticate(request)
        except (AuthenticationFailed, InvalidToken):
            authenticated = None

        if not authenticated:
            return JsonResponse({"detail": "Authentication is required to change content."}, status=401)

        request.user = authenticated[0]
        return view(request, *args, **kwargs)

    return wrapped
