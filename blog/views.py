from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import BlogPost
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def blog_list(request):
    if request.method == "GET":
        posts = BlogPost.objects.all()
        posts_data = [{
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt,
            'content': post.content,
            'featured_image': post.featured_image,
            'author': post.author.username if post.author else None,
            'status': post.status,
            'published_at': post.published_at.isoformat() if post.published_at else None,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
            'is_featured': post.is_featured,
        } for post in posts]
        return JsonResponse({'posts': posts_data})
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            post = BlogPost.objects.create(
                title=data.get('title'),
                slug=data.get('slug'),
                excerpt=data.get('excerpt'),
                content=data.get('content'),
                featured_image=data.get('featured_image'),
                status=data.get('status', 'DRAFT'),
                is_featured=data.get('is_featured', False),
            )
            return JsonResponse({'id': post.id, 'message': 'Blog post created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def blog_detail(request, post_id):
    try:
        post = BlogPost.objects.get(id=post_id)
    except BlogPost.DoesNotExist:
        return JsonResponse({'error': 'Blog post not found'}, status=404)
    
    if request.method == "GET":
        post_data = {
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt,
            'content': post.content,
            'featured_image': post.featured_image,
            'author': post.author.username if post.author else None,
            'status': post.status,
            'published_at': post.published_at.isoformat() if post.published_at else None,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
            'is_featured': post.is_featured,
        }
        return JsonResponse(post_data)
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            post.title = data.get('title', post.title)
            post.slug = data.get('slug', post.slug)
            post.excerpt = data.get('excerpt', post.excerpt)
            post.content = data.get('content', post.content)
            post.featured_image = data.get('featured_image', post.featured_image)
            post.status = data.get('status', post.status)
            post.is_featured = data.get('is_featured', post.is_featured)
            post.save()
            return JsonResponse({'message': 'Blog post updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == "DELETE":
        post.delete()
        return JsonResponse({'message': 'Blog post deleted'})
