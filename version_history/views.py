from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import ContentVersion
import json


@csrf_exempt
@require_http_methods(["GET"])
def version_list(request):
    versions = ContentVersion.objects.all()
    
    # Apply filters
    content_type = request.GET.get('content_type')
    action = request.GET.get('action')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    if content_type:
        versions = versions.filter(content_type=content_type)
    if action:
        versions = versions.filter(action=action)
    if date_from:
        versions = versions.filter(changed_at__gte=date_from)
    if date_to:
        versions = versions.filter(changed_at__lte=date_to)
    
    versions_data = [{
        'id': v.id,
        'content_type': v.content_type,
        'content_id': v.content_id,
        'action': v.action,
        'content_snapshot': v.content_snapshot,
        'changed_by': v.changed_by.username if v.changed_by else None,
        'changed_at': v.changed_at.isoformat(),
        'reason': v.reason,
    } for v in versions]
    
    return JsonResponse({'versions': versions_data})


@csrf_exempt
@require_http_methods(["GET"])
def version_detail(request, version_id):
    try:
        version = ContentVersion.objects.get(id=version_id)
        version_data = {
            'id': version.id,
            'content_type': version.content_type,
            'content_id': version.content_id,
            'action': version.action,
            'content_snapshot': version.content_snapshot,
            'changed_by': version.changed_by.username if version.changed_by else None,
            'changed_at': version.changed_at.isoformat(),
            'reason': version.reason,
        }
        return JsonResponse(version_data)
    except ContentVersion.DoesNotExist:
        return JsonResponse({'error': 'Version not found'}, status=404)
