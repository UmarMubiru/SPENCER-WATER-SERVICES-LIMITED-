from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Testimonial
from core.content_security import authenticated_content_write
from django.utils import timezone
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def public_testimonial_list(request):
    """Public API for viewing and submitting testimonials"""
    if request.method == "GET":
        testimonials = Testimonial.objects.filter(status=Testimonial.Status.APPROVED)
        testimonials_data = [{
            'id': t.id,
            'customer_name': t.customer_name,
            'company_name': t.company_name,
            'rating': t.rating,
            'content': t.content,
            'project_reference': t.project_reference,
            'created_at': t.created_at.isoformat(),
        } for t in testimonials]
        return JsonResponse({'testimonials': testimonials_data})

    elif request.method == "POST":
        """Public testimonial submission - no authentication required"""
        try:
            data = json.loads(request.body)
            testimonial = Testimonial.objects.create(
                customer_name=data.get('customer_name'),
                company_name=data.get('company_name', ''),
                rating=data.get('rating', 5),
                content=data.get('content'),
                project_reference=data.get('project_reference', ''),
                status=Testimonial.Status.PENDING,
            )
            return JsonResponse({
                'id': testimonial.id,
                'message': 'Testimonial submitted for review',
                'status': testimonial.status
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def testimonial_list(request):
    if request.method == "GET":
        testimonials = Testimonial.objects.all()
        testimonials_data = [{
            'id': t.id,
            'customer_name': t.customer_name,
            'company_name': t.company_name,
            'rating': t.rating,
            'content': t.content,
            'project_reference': t.project_reference,
            'status': t.status,
            'approved_by': t.approved_by.username if t.approved_by else None,
            'approved_at': t.approved_at.isoformat() if t.approved_at else None,
            'created_at': t.created_at.isoformat(),
            'is_featured': t.is_featured,
        } for t in testimonials]
        return JsonResponse({'testimonials': testimonials_data})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            testimonial = Testimonial.objects.create(
                customer_name=data.get('customer_name'),
                company_name=data.get('company_name'),
                rating=data.get('rating', 5),
                content=data.get('content'),
                project_reference=data.get('project_reference'),
                status=data.get('status', 'PENDING'),
                is_featured=data.get('is_featured', False),
            )
            return JsonResponse({'id': testimonial.id, 'message': 'Testimonial created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
@authenticated_content_write
def testimonial_detail(request, testimonial_id):
    try:
        testimonial = Testimonial.objects.get(id=testimonial_id)
    except Testimonial.DoesNotExist:
        return JsonResponse({'error': 'Testimonial not found'}, status=404)

    if request.method == "GET":
        testimonial_data = {
            'id': testimonial.id,
            'customer_name': testimonial.customer_name,
            'company_name': testimonial.company_name,
            'rating': testimonial.rating,
            'content': testimonial.content,
            'project_reference': testimonial.project_reference,
            'status': testimonial.status,
            'approved_by': testimonial.approved_by.username if testimonial.approved_by else None,
            'approved_at': testimonial.approved_at.isoformat() if testimonial.approved_at else None,
            'created_at': testimonial.created_at.isoformat(),
            'is_featured': testimonial.is_featured,
        }
        return JsonResponse(testimonial_data)

    elif request.method in ("PUT", "PATCH"):
        try:
            data = json.loads(request.body)
            testimonial.customer_name = data.get('customer_name', testimonial.customer_name)
            testimonial.company_name = data.get('company_name', testimonial.company_name)
            testimonial.rating = data.get('rating', testimonial.rating)
            testimonial.content = data.get('content', testimonial.content)
            testimonial.project_reference = data.get('project_reference', testimonial.project_reference)
            testimonial.status = data.get('status', testimonial.status)
            testimonial.is_featured = data.get('is_featured', testimonial.is_featured)
            if testimonial.status == Testimonial.Status.APPROVED:
                testimonial.is_featured = True
                testimonial.approved_by = request.user if request.user.is_authenticated else None
                testimonial.approved_at = timezone.now()
            elif testimonial.status != Testimonial.Status.APPROVED:
                testimonial.is_featured = False
                testimonial.approved_by = None
                testimonial.approved_at = None
            testimonial.save()
            return JsonResponse({'message': 'Testimonial updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == "DELETE":
        testimonial.delete()
        return JsonResponse({'message': 'Testimonial deleted'})
