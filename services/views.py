from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Service
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def service_list(request):
    if request.method == "GET":
        services = Service.objects.all()
        services_data = [{
            'id': s.id,
            'name': s.name,
            'slug': s.slug,
            'description': s.description,
            'icon': s.icon,
            'is_active': s.is_active,
            'display_order': s.display_order,
            'created_at': s.created_at.isoformat(),
            'updated_at': s.updated_at.isoformat(),
        } for s in services]
        return JsonResponse({'services': services_data})
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            service = Service.objects.create(
                name=data.get('name'),
                slug=data.get('slug'),
                description=data.get('description'),
                icon=data.get('icon'),
                is_active=data.get('is_active', True),
                display_order=data.get('display_order', 0),
            )
            return JsonResponse({'id': service.id, 'message': 'Service created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def service_detail(request, service_id):
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return JsonResponse({'error': 'Service not found'}, status=404)
    
    if request.method == "GET":
        service_data = {
            'id': service.id,
            'name': service.name,
            'slug': service.slug,
            'description': service.description,
            'icon': service.icon,
            'is_active': service.is_active,
            'display_order': service.display_order,
            'created_at': service.created_at.isoformat(),
            'updated_at': service.updated_at.isoformat(),
        }
        return JsonResponse(service_data)
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            service.name = data.get('name', service.name)
            service.slug = data.get('slug', service.slug)
            service.description = data.get('description', service.description)
            service.icon = data.get('icon', service.icon)
            service.is_active = data.get('is_active', service.is_active)
            service.display_order = data.get('display_order', service.display_order)
            service.save()
            return JsonResponse({'message': 'Service updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == "DELETE":
        service.delete()
        return JsonResponse({'message': 'Service deleted'})
