import json

from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from blog.models import BlogPost
from core.content_security import authenticated_content_write
from core_pages.models import PageField, PageImage
from projects.models import Project
from services.models import Service
from testimonials.models import Testimonial
from .models import ContentActivity, MediaAsset, MediaFolder, WebsitePage


FIXED_PAGES = (
    ("home", "Home", "HOME"), ("about", "About us", "ABOUT"),
    ("contact", "Contact", "CONTACT"), ("services", "Services index", "SERVICES"),
    ("projects", "Projects index", "PROJECTS"), ("blog", "Blog index", "BLOG"),
    ("privacy", "Privacy policy", "LEGAL"), ("terms", "Terms of service", "LEGAL"),
    ("service-borehole-drilling", "Borehole Drilling", "SERVICE"),
    ("service-solar-water-pumping-systems", "Solar Water Pumping Systems", "SERVICE"),
    ("service-water-treatment", "Water Treatment", "SERVICE"),
    ("service-plumbing-services", "Plumbing Services", "SERVICE"),
    ("service-pipeline-installation", "Pipeline Installation", "SERVICE"),
    ("service-water-storage-solutions", "Water Storage Solutions", "SERVICE"),
    ("service-water-taps-accessories", "Water Taps & Accessories", "SERVICE"),
    ("service-water-engineering-consultancy", "Water Engineering Consultancy", "SERVICE"),
)


def activity(action, target, request, detail=""):
    ContentActivity.objects.create(
        action=action, target=target, detail=detail,
        actor=request.user if getattr(request.user, "is_authenticated", False) else None,
    )


def page_data(page):
    return {
        "id": page.id, "title": page.title, "slug": page.slug, "page_type": page.page_type,
        "status": page.status, "sections": page.sections, "meta_title": page.meta_title,
        "meta_description": page.meta_description, "canonical_url": page.canonical_url,
        "og_image": page.og_image, "scheduled_for": page.scheduled_for.isoformat() if page.scheduled_for else None,
        "published_at": page.published_at.isoformat() if page.published_at else None,
        "created_at": page.created_at.isoformat(), "updated_at": page.updated_at.isoformat(),
    }


@require_GET
def dashboard(request):
    pages = WebsitePage.objects.count() + len(FIXED_PAGES)
    published_pages = WebsitePage.objects.filter(status=WebsitePage.Status.PUBLISHED).count()
    drafts = WebsitePage.objects.filter(status=WebsitePage.Status.DRAFT).count() + BlogPost.objects.filter(status=BlogPost.Status.DRAFT).count()
    activities = [{"action": item.action, "target": item.target, "detail": item.detail, "created_at": item.created_at.isoformat()}
                  for item in ContentActivity.objects.select_related("actor")[:8]]
    attention = [
        {"label": "Draft content", "count": drafts, "severity": "warning"},
        {"label": "Pages missing meta descriptions", "count": WebsitePage.objects.filter(meta_description="").count(), "severity": "warning"},
        {"label": "Images missing alternative text", "count": MediaAsset.objects.filter(kind=MediaAsset.Kind.IMAGE, alt_text="").count() + PageImage.objects.filter(alt_text="").count(), "severity": "critical"},
    ]
    return JsonResponse({"website_status": "online", "pages": pages, "published_pages": published_pages,
                         "drafts": drafts, "services": Service.objects.count(), "projects": Project.objects.count(),
                         "blogs": BlogPost.objects.count(), "testimonials": Testimonial.objects.count(),
                         "media": MediaAsset.objects.count() + PageImage.objects.count(), "recent_activity": activities,
                         "attention": attention})


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def pages(request):
    if request.method == "GET":
        custom = [page_data(page) for page in WebsitePage.objects.all()]
        managed_slugs = {item["slug"] for item in custom}
        fixed = [{"id": None, "title": title, "slug": slug, "page_type": kind, "status": "PUBLISHED",
                  "sections": [], "meta_title": "", "meta_description": "", "is_fixed": True}
                 for slug, title, kind in FIXED_PAGES if slug not in managed_slugs]
        return JsonResponse({"pages": fixed + custom})
    try:
        data = json.loads(request.body)
        page = WebsitePage.objects.create(
            title=data["title"], slug=data["slug"], page_type=data.get("page_type", "CUSTOM"),
            status=data.get("status", WebsitePage.Status.DRAFT), sections=data.get("sections", []),
            meta_title=data.get("meta_title", ""), meta_description=data.get("meta_description", ""),
            canonical_url=data.get("canonical_url", ""), og_image=data.get("og_image", ""),
            updated_by=request.user if request.user.is_authenticated else None,
        )
        activity("Page created", page.title, request)
        return JsonResponse(page_data(page), status=201)
    except (KeyError, ValueError, TypeError) as exc:
        return JsonResponse({"detail": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
@authenticated_content_write
def page_detail(request, page_id):
    try:
        page = WebsitePage.objects.get(pk=page_id)
    except WebsitePage.DoesNotExist:
        return JsonResponse({"detail": "Page not found."}, status=404)
    if request.method == "GET":
        return JsonResponse(page_data(page))
    if request.method == "DELETE":
        title = page.title
        page.delete()
        activity("Page archived", title, request)
        return JsonResponse({"detail": "Page deleted."})
    try:
        data = json.loads(request.body)
        editable = ("title", "slug", "page_type", "status", "sections", "meta_title", "meta_description", "canonical_url", "og_image", "scheduled_for")
        for name in editable:
            if name in data:
                setattr(page, name, data[name])
        if page.status == WebsitePage.Status.PUBLISHED and page.published_at is None:
            page.published_at = timezone.now()
        page.updated_by = request.user if request.user.is_authenticated else None
        page.save()
        activity("Page updated", page.title, request, f"Moved to {page.get_status_display()}")
        return JsonResponse(page_data(page))
    except (ValueError, TypeError) as exc:
        return JsonResponse({"detail": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def media(request):
    if request.method == "GET":
        assets = [{"id": asset.id, "url": request.build_absolute_uri(asset.file.url), "name": asset.file.name.rsplit("/", 1)[-1],
                   "kind": asset.kind, "folder": asset.folder, "alt_text": asset.alt_text, "caption": asset.caption,
                   "project": asset.project.name if asset.project else None,
                   "project_id": asset.project.id if asset.project else None,
                   "created_at": asset.created_at.isoformat()} for asset in MediaAsset.objects.all()]
        
        print(f"Returning {len(assets)} media assets")
        
        # Include folders
        folders = [{"id": str(folder.id), "name": folder.name, "created_at": folder.created_at.isoformat()} 
                   for folder in MediaFolder.objects.all()]
        
        response_data = {"assets": assets, "folders": folders}
        print(f"Response data: {response_data}")
        return JsonResponse(response_data)
    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"detail": "A file is required."}, status=400)
    try:
        asset = MediaAsset.objects.create(file=file, kind=request.POST.get("kind", "IMAGE"), folder=request.POST.get("folder", ""),
                                          alt_text=request.POST.get("alt_text", ""), caption=request.POST.get("caption", ""),
                                          uploaded_by=request.user if request.user.is_authenticated else None)
        activity("Media uploaded", asset.file.name, request)
        return JsonResponse({"id": asset.id, "url": request.build_absolute_uri(asset.file.url)}, status=201)
    except Exception as e:
        print(f"Error creating MediaAsset: {e}")
        return JsonResponse({"detail": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def media_folders(request):
    if request.method == "GET":
        folders = [{"id": str(folder.id), "name": folder.name, "created_at": folder.created_at.isoformat()} 
                   for folder in MediaFolder.objects.all()]
        return JsonResponse({"folders": folders})
    try:
        data = json.loads(request.body)
        folder = MediaFolder.objects.create(
            name=data["name"],
            created_by=request.user if request.user.is_authenticated else None
        )
        activity("Folder created", folder.name, request)
        return JsonResponse({"id": str(folder.id), "name": folder.name, "created_at": folder.created_at.isoformat()}, status=201)
    except (KeyError, ValueError) as exc:
        return JsonResponse({"detail": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
@authenticated_content_write
def media_folder_detail(request, folder_id):
    try:
        folder = MediaFolder.objects.get(pk=folder_id)
    except MediaFolder.DoesNotExist:
        return JsonResponse({"detail": "Folder not found."}, status=404)
    
    # Move assets from this folder to General Media (empty folder)
    MediaAsset.objects.filter(folder=folder.name).update(folder="")
    
    folder_name = folder.name
    folder.delete()
    activity("Folder deleted", folder_name, request)
    return JsonResponse({"detail": "Folder deleted."})


@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
@authenticated_content_write
def media_detail(request, asset_id):
    try:
        asset = MediaAsset.objects.get(pk=asset_id)
    except MediaAsset.DoesNotExist:
        return JsonResponse({"detail": "Media asset not found."}, status=404)
    
    if request.method == "DELETE":
        file_name = asset.file.name
        asset.file.delete()
        asset.delete()
        activity("Media deleted", file_name, request)
        return JsonResponse({"detail": "Media deleted."})
    
    try:
        data = json.loads(request.body)
        editable = ("alt_text", "caption", "folder")
        for name in editable:
            if name in data:
                setattr(asset, name, data[name])
        asset.save()
        activity("Media updated", asset.file.name, request)
        return JsonResponse({"id": asset.id, "url": request.build_absolute_uri(asset.file.url)})
    except (ValueError, TypeError) as exc:
        return JsonResponse({"detail": str(exc)}, status=400)


@require_GET
def search(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return JsonResponse({"results": []})
    results = []
    for page in WebsitePage.objects.filter(Q(title__icontains=query) | Q(meta_description__icontains=query))[:8]:
        results.append({"type": "Page", "title": page.title, "status": page.status, "href": "/admin/content/pages"})
    for model, label, title, status in ((Service, "Service", "name", "is_active"), (BlogPost, "Blog", "title", "status"), (Project, "Project", "name", "status")):
        for item in model.objects.filter(**{f"{title}__icontains": query})[:8]:
            value = getattr(item, status)
            results.append({"type": label, "title": getattr(item, title), "status": str(value), "href": f"/admin/content/{label.lower()}s"})
    return JsonResponse({"results": results[:20]})
