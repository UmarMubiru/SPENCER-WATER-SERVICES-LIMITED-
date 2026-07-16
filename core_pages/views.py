from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import CorePage
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def core_page_list(request):
    if request.method == "GET":
        page_type = request.GET.get('page_type')
        section_type = request.GET.get('section_type')
        pages = CorePage.objects.all()
        if page_type:
            pages = pages.filter(page_type=page_type)
        if section_type:
            pages = pages.filter(section_type=section_type)
        
        pages_data = [{
            'id': p.id,
            'page_type': p.page_type,
            'section_name': p.section_name,
            'section_type': p.section_type,
            'section_order': p.section_order,
            'content': p.content,
            'image': p.image.url if p.image else None,
            'image_url': p.image_url,
            'image_source': p.image_source,
            'alt_text': p.alt_text,
            'is_active': p.is_active,
            'created_at': p.created_at.isoformat(),
            'updated_at': p.updated_at.isoformat(),
        } for p in pages]
        return JsonResponse({'pages': pages_data})
    
    elif request.method == "POST":
        try:
            if request.content_type.startswith('multipart/form-data'):
                page = CorePage.objects.create(
                    page_type=request.POST.get('page_type'),
                    section_name=request.POST.get('section_name'),
                    section_type=request.POST.get('section_type', 'BACKGROUND'),
                    section_order=int(request.POST.get('section_order', 0)),
                    content=request.POST.get('content', ''),
                    image=request.FILES.get('image') if 'image' in request.FILES else None,
                    image_url=request.POST.get('image_url'),
                    alt_text=request.POST.get('alt_text', ''),
                    is_active=request.POST.get('is_active', 'true').lower() == 'true',
                )
            else:
                data = json.loads(request.body)
                page = CorePage.objects.create(
                    page_type=data.get('page_type'),
                    section_name=data.get('section_name'),
                    section_type=data.get('section_type', 'BACKGROUND'),
                    section_order=data.get('section_order', 0),
                    content=data.get('content', ''),
                    image_url=data.get('image_url'),
                    alt_text=data.get('alt_text', ''),
                    is_active=data.get('is_active', True),
                )
            return JsonResponse({'id': page.id, 'message': 'Core page section created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def core_page_detail(request, page_id):
    try:
        page = CorePage.objects.get(id=page_id)
    except CorePage.DoesNotExist:
        return JsonResponse({'error': 'Core page section not found'}, status=404)
    
    if request.method == "GET":
        page_data = {
            'id': page.id,
            'page_type': page.page_type,
            'section_name': page.section_name,
            'section_type': page.section_type,
            'section_order': page.section_order,
            'content': page.content,
            'image': page.image.url if page.image else None,
            'image_url': page.image_url,
            'image_source': page.image_source,
            'alt_text': page.alt_text,
            'is_active': page.is_active,
            'created_at': page.created_at.isoformat(),
            'updated_at': page.updated_at.isoformat(),
        }
        return JsonResponse(page_data)
    
    elif request.method == "PUT":
        try:
            if request.content_type.startswith('multipart/form-data'):
                page.page_type = request.POST.get('page_type', page.page_type)
                page.section_name = request.POST.get('section_name', page.section_name)
                page.section_type = request.POST.get('section_type', page.section_type)
                page.section_order = int(request.POST.get('section_order', page.section_order))
                page.content = request.POST.get('content', page.content)
                if 'image' in request.FILES:
                    page.image = request.FILES['image']
                if request.POST.get('image_url'):
                    page.image_url = request.POST.get('image_url')
                page.alt_text = request.POST.get('alt_text', page.alt_text)
                page.is_active = request.POST.get('is_active', 'true').lower() == 'true'
            else:
                data = json.loads(request.body)
                page.page_type = data.get('page_type', page.page_type)
                page.section_name = data.get('section_name', page.section_name)
                page.section_type = data.get('section_type', page.section_type)
                page.section_order = data.get('section_order', page.section_order)
                page.content = data.get('content', page.content)
                page.image_url = data.get('image_url', page.image_url)
                page.alt_text = data.get('alt_text', page.alt_text)
                page.is_active = data.get('is_active', page.is_active)
            page.save()
            return JsonResponse({'message': 'Core page section updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == "DELETE":
        page.delete()
        return JsonResponse({'message': 'Core page section deleted'})
