from .models import SystemActivity

REDACTED_FIELDS = {'password', 'id_number', 'temp_password', 'reset_code', 'code'}


def sanitize_diff(data: dict | None) -> dict | None:
    if data is None:
        return None
    return {k: ('***REDACTED***' if k in REDACTED_FIELDS else v) for k, v in data.items()}


def log_activity(
    module, action, entity_type=None, entity_id=None, reference_number='',
    action_type='updated', description='', performed_by=None,
    old_data=None, new_data=None, request=None,
):
    """Single entry point every app calls. Never expose SystemActivity write access via API directly."""
    if request is not None:
        # Mark both DRF's wrapper and its underlying Django request. The global
        # audit middleware uses this to avoid duplicating detailed domain events.
        setattr(request, '_system_activity_logged', True)
        underlying_request = getattr(request, '_request', None)
        if underlying_request is not None:
            setattr(underlying_request, '_system_activity_logged', True)

    department = ''
    if performed_by and getattr(performed_by, 'is_administrator', False):
        department = 'Administration'
    elif performed_by and getattr(performed_by, 'employee', None) and performed_by.employee.job_title:
        department = performed_by.employee.job_title.department.name

    ip_address, user_agent = None, ''
    if request:
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        user_agent = request.META.get('HTTP_USER_AGENT', '')

    if performed_by:
        full_name = performed_by.get_full_name().strip() if hasattr(performed_by, 'get_full_name') else ''
        performed_by_name = full_name or getattr(performed_by, 'username', '') or getattr(performed_by, 'email', '')
    else:
        performed_by_name = ''

    SystemActivity.objects.create(
        module=module, action=action, action_type=action_type, description=description,
        reference_type=entity_type or '', reference_id=str(reference_number or entity_id or ''),
        performed_by=performed_by, performed_by_name=performed_by_name, department=department,
        # Some deployed databases predate the nullable JSON columns, so use
        # empty objects for events that do not have a before/after snapshot.
        old_value=sanitize_diff(old_data) or {}, new_value=sanitize_diff(new_data) or {},
        ip_address=ip_address, user_agent=user_agent,
    )
