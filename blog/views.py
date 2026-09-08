from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import BlogPost, BlogCategory, BlogTag
from core.content_security import authenticated_content_write
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def blog_list(request):
    if request.method == "GET":
        posts = BlogPost.objects.all().select_related('category', 'author').prefetch_related('tags')
        posts_data = [{
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt,
            'content': post.content,
            'featured_image': post.featured_image,
            'author': post.author.username if post.author else None,
            'category': post.category.name if post.category else None,
            'category_id': post.category.id if post.category else None,
            'tags': [tag.name for tag in post.tags.all()],
            'tag_ids': [tag.id for tag in post.tags.all()],
            'status': post.status,
            'published_at': post.published_at.isoformat() if post.published_at else None,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
            'is_featured': post.is_featured,
            'meta_description': post.meta_description,
            'meta_keywords': post.meta_keywords,
            'reading_time': post.reading_time,
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
                meta_description=data.get('meta_description'),
                meta_keywords=data.get('meta_keywords'),
            )

            # Handle category
            if data.get('category_id'):
                post.category_id = data.get('category_id')

            # Handle tags
            if data.get('tag_ids'):
                post.tags.set(data.get('tag_ids'))

            post.save()
            return JsonResponse({'id': post.id, 'message': 'Blog post created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
@authenticated_content_write
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
            'category': post.category.name if post.category else None,
            'category_id': post.category.id if post.category else None,
            'tags': [tag.name for tag in post.tags.all()],
            'tag_ids': [tag.id for tag in post.tags.all()],
            'status': post.status,
            'published_at': post.published_at.isoformat() if post.published_at else None,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
            'is_featured': post.is_featured,
            'meta_description': post.meta_description,
            'meta_keywords': post.meta_keywords,
            'reading_time': post.reading_time,
        }
        return JsonResponse(post_data)

    elif request.method in ("PUT", "PATCH"):
        try:
            data = json.loads(request.body)
            post.title = data.get('title', post.title)
            post.slug = data.get('slug', post.slug)
            post.excerpt = data.get('excerpt', post.excerpt)
            post.content = data.get('content', post.content)
            post.featured_image = data.get('featured_image', post.featured_image)
            post.status = data.get('status', post.status)
            post.is_featured = data.get('is_featured', post.is_featured)
            post.meta_description = data.get('meta_description', post.meta_description)
            post.meta_keywords = data.get('meta_keywords', post.meta_keywords)

            # Handle category
            if data.get('category_id') is not None:
                post.category_id = data.get('category_id')

            # Handle tags
            if data.get('tag_ids') is not None:
                post.tags.set(data.get('tag_ids'))

            post.save()
            return JsonResponse({'message': 'Blog post updated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == "DELETE":
        post.delete()
        return JsonResponse({'message': 'Blog post deleted'})


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def category_list(request):
    if request.method == "GET":
        categories = BlogCategory.objects.all()
        categories_data = [{
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'created_at': cat.created_at.isoformat(),
        } for cat in categories]
        return JsonResponse({'categories': categories_data})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            category = BlogCategory.objects.create(
                name=data.get('name'),
                slug=data.get('slug'),
                description=data.get('description'),
            )
            return JsonResponse({'id': category.id, 'message': 'Category created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def tag_list(request):
    if request.method == "GET":
        tags = BlogTag.objects.all()
        tags_data = [{
            'id': tag.id,
            'name': tag.name,
            'slug': tag.slug,
            'created_at': tag.created_at.isoformat(),
        } for tag in tags]
        return JsonResponse({'tags': tags_data})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            tag = BlogTag.objects.create(
                name=data.get('name'),
                slug=data.get('slug'),
            )
            return JsonResponse({'id': tag.id, 'message': 'Tag created'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
