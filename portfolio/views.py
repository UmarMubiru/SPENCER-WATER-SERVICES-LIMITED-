from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import PortfolioProject, PortfolioImage
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def portfolio_list(request):
    if request.method == "GET":
        projects = PortfolioProject.objects.all()
        projects_data = [{
            'id': p.id,
            'title': p.title,
            'slug': p.slug,
            'description': p.description,
            'client_name': p.client_name,
            'location': p.location,
            'project_type': p.project_type,
            'status': p.status,
            'completion_date': p.completion_date.isoformat() if p.completion_date else None,
            'budget': str(p.budget) if p.budget else None,
            'cover_image': p.cover_image,
            'is_featured': p.is_featured,
            'created_at': p.created_at.isoformat(),
            'updated_at': p.updated_at.isoformat(),
            'images': [{'id': img.id, 'image_url': img.image_url, 'caption': img.caption, 'is_cover': img.is_cover, 'order': img.order} for img in p.images.all()]
        } for p in projects]
        return JsonResponse({'projects': projects_data})
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            project = PortfolioProject.objects.create(
                title=data.get('title'),
                slug=data.get('slug'),
                description=data.get('description'),
                client_name=data.get('client_name'),
                location=data.get('location'),
                project_type=data.get('project_type'),
                status=data.get('status', 'COMPLETED'),
                completion_date=data.get('completion_date'),
                budget=data.get('budget'),
                cover_image=data.get('cover_image'),
                is_featured=data.get('is_featured', False),
            )
            return JsonResponse({'id': project.id, 'message': 'Portfolio project created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def portfolio_detail(request, project_id):
    try:
        project = PortfolioProject.objects.get(id=project_id)
    except PortfolioProject.DoesNotExist:
        return JsonResponse({'error': 'Portfolio project not found'}, status=404)
    
    if request.method == "GET":
        project_data = {
            'id': project.id,
            'title': project.title,
            'slug': project.slug,
            'description': project.description,
            'client_name': project.client_name,
            'location': project.location,
            'project_type': project.project_type,
            'status': project.status,
            'completion_date': project.completion_date.isoformat() if project.completion_date else None,
            'budget': str(project.budget) if project.budget else None,
            'cover_image': project.cover_image,
            'is_featured': project.is_featured,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            'images': [{'id': img.id, 'image_url': img.image_url, 'caption': img.caption, 'is_cover': img.is_cover, 'order': img.order} for img in project.images.all()]
        }
        return JsonResponse(project_data)
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            project.title = data.get('title', project.title)
            project.slug = data.get('slug', project.slug)
            project.description = data.get('description', project.description)
            project.client_name = data.get('client_name', project.client_name)
            project.location = data.get('location', project.location)
            project.project_type = data.get('project_type', project.project_type)
            project.status = data.get('status', project.status)
            project.completion_date = data.get('completion_date', project.completion_date)
            project.budget = data.get('budget', project.budget)
            project.cover_image = data.get('cover_image', project.cover_image)
            project.is_featured = data.get('is_featured', project.is_featured)
            project.save()
            return JsonResponse({'message': 'Portfolio project updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == "DELETE":
        project.delete()
        return JsonResponse({'message': 'Portfolio project deleted'})
