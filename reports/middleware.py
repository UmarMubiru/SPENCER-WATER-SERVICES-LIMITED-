"""A lightweight, shared audit feed for successful authenticated API writes."""

from rest_framework_simplejwt.authentication import JWTAuthentication

from reports.audit import log_activity


MODULE_BY_PATH = {
    'employees': 'employees',
    'users': 'users',
    'roles': 'users',
    'projects': 'projects',
    'inventory': 'inventory',
    'quotations': 'crm',
    'tenders': 'tenders',
    'finance': 'finance',
    'content': 'content',
    'notifications': 'notifications',
    'reports': 'reports',
}

ACTION_TYPES = {
    'approve': 'approved',
    'reject': 'warning',
    'cancel': 'warning',
    'delete': 'deleted',
    'remove': 'deleted',
    'archive': 'updated',
    'restore': 'updated',
    'issue': 'updated',
    'return': 'updated',
}


class SystemActivityMiddleware:
    """Records one generic event for API writes not already logged in detail."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (
            request.method not in {'POST', 'PUT', 'PATCH', 'DELETE'}
            or response.status_code >= 400
            or getattr(request, '_system_activity_logged', False)
        ):
            return response

        path_parts = [part for part in request.path.strip('/').split('/') if part]
        if len(path_parts) < 2 or path_parts[0] != 'api':
            return response

        module = MODULE_BY_PATH.get(path_parts[1])
        if not module:
            return response

        user = self._authenticated_user(request)
        if not user:
            return response

        try:
            action, action_type, reference = self._describe_action(request.method, path_parts[2:])
            log_activity(
                module=module,
                action=action,
                action_type=action_type,
                entity_type=path_parts[1].rstrip('s').replace('-', ' ').title(),
                reference_number=reference,
                description=f"{action} via the {module.title()} module.",
                performed_by=user,
                request=request,
            )
        except Exception:
            # Activity reporting must never turn a successful business action
            # into an error for the user.
            pass

        return response

    @staticmethod
    def _authenticated_user(request):
        if getattr(request.user, 'is_authenticated', False):
            return request.user
        try:
            result = JWTAuthentication().authenticate(request)
            return result[0] if result else None
        except Exception:
            return None

    @staticmethod
    def _describe_action(method, route_parts):
        parts = [part for part in route_parts if part]
        last_part = parts[-1] if parts else ''
        command = last_part.replace('-', '_').lower()
        reference = next((part for part in reversed(parts) if len(part) >= 8 and '-' in part), '')

        if command in ACTION_TYPES:
            return f"{command.replace('_', ' ').title()} action completed", ACTION_TYPES[command], reference

        verb = {
            'POST': ('Created record', 'created'),
            'PUT': ('Updated record', 'updated'),
            'PATCH': ('Updated record', 'updated'),
            'DELETE': ('Deleted record', 'deleted'),
        }[method]
        return verb[0], verb[1], reference
