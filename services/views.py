import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from core.content_security import authenticated_content_write
from .models import Service, ServiceSection
from content.models import MediaAsset


DEFAULT_SECTIONS = [
    "Service overview", "Key benefits", "How the service works", "Equipment and materials",
    "Project gallery", "Frequently asked questions", "Related projects", "Request a quotation",
]


def section_data(section):
    return {
        "id": section.id, "label": section.label, "heading": section.heading, "content": section.content,
        "image": section.image.url if section.image else None, "image_url": section.image_url,
        "image_source": section.image_source, "alt_text": section.alt_text, "display_order": section.display_order,
        "is_enabled": section.is_enabled,
        "image_2": section.image_2.url if section.image_2 else None, "image_url_2": section.image_url_2,
        "image_source_2": section.image_source_2, "alt_text_2": section.alt_text_2,
        "image_3": section.image_3.url if section.image_3 else None, "image_url_3": section.image_url_3,
        "image_source_3": section.image_source_3, "alt_text_3": section.alt_text_3,
    }


def service_data(service, include_sections=True):
    return {
        "id": service.id, "name": service.name, "slug": service.slug, "description": service.description,
        "short_description": service.short_description, "icon": service.icon, "hero_eyebrow": service.hero_eyebrow,
        "hero_title": service.hero_title or service.name, "hero_description": service.hero_description or service.description,
        "hero_image": service.hero_image.url if service.hero_image else None, "hero_image_url": service.hero_image_url,
        "hero_image_source": service.hero_image_source, "hero_alt_text": service.hero_alt_text,
        "hero_image_2": service.hero_image_2.url if service.hero_image_2 else None, "hero_image_url_2": service.hero_image_url_2,
        "hero_image_source_2": service.hero_image_source_2, "hero_alt_text_2": service.hero_alt_text_2,
        "hero_image_3": service.hero_image_3.url if service.hero_image_3 else None, "hero_image_url_3": service.hero_image_url_3,
        "hero_image_source_3": service.hero_image_source_3, "hero_alt_text_3": service.hero_alt_text_3,
        "gallery_images": [
            {"id": img.id, "url": img.url, "name": img.name, "alt_text": img.alt_text}
            for img in service.gallery_images.all()
        ],
        "meta_title": service.meta_title, "meta_description": service.meta_description, "is_active": service.is_active,
        "display_order": service.display_order, "created_at": service.created_at.isoformat(), "updated_at": service.updated_at.isoformat(),
        **({"sections": [section_data(section) for section in service.sections.filter(is_enabled=True).order_by('display_order')]} if include_sections else {}),
    }


def build_default_sections(service):
    for order, label in enumerate(DEFAULT_SECTIONS, start=1):
        ServiceSection.objects.get_or_create(service=service, label=label, defaults={"heading": label, "display_order": order})


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
def service_list(request):
    if request.method == "GET":
        return JsonResponse({"services": [service_data(service) for service in Service.objects.prefetch_related("sections").all()]})
    try:
        data = json.loads(request.body)
        service = Service.objects.create(
            name=data["name"], slug=data["slug"], description=data.get("description", ""),
            short_description=data.get("short_description", ""), icon=data.get("icon", ""),
            hero_eyebrow=data.get("hero_eyebrow", "Water engineering service"), hero_title=data.get("hero_title", data["name"]),
            hero_description=data.get("hero_description", data.get("description", "")), hero_image_url=data.get("hero_image_url", ""),
            hero_alt_text=data.get("hero_alt_text", ""), meta_title=data.get("meta_title", ""),
            meta_description=data.get("meta_description", ""), is_active=data.get("is_active", False), display_order=data.get("display_order", 0),
        )
        build_default_sections(service)
        return JsonResponse({"id": service.id, "message": "Service and its website page were created", "service": service_data(service)}, status=201)
    except (KeyError, ValueError, TypeError) as exc:
        return JsonResponse({"error": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
@authenticated_content_write
def service_detail(request, service_id):
    try:
        service = Service.objects.prefetch_related("sections").get(id=service_id)
    except Service.DoesNotExist:
        return JsonResponse({"error": "Service not found"}, status=404)
    if request.method == "GET":
        return JsonResponse(service_data(service))
    if request.method == "DELETE":
        service.delete()
        return JsonResponse({"message": "Service and its website page were deleted"})
    try:
        # Handle FormData (for file uploads)
        if request.content_type and 'multipart/form-data' in request.content_type:
            print(f"DEBUG: FormData received for service {service_id}")
            print(f"DEBUG: FILES: {request.FILES}")
            print(f"DEBUG: POST: {request.POST}")
            print(f"DEBUG: Content-Type: {request.content_type}")

            if 'hero_image' in request.FILES:
                service.hero_image = request.FILES['hero_image']
                print(f"DEBUG: Set hero_image to {request.FILES['hero_image']}")
            if 'hero_image_url' in request.POST:
                service.hero_image_url = request.POST['hero_image_url']
                print(f"DEBUG: Set hero_image_url to {request.POST['hero_image_url']}")
            if 'hero_alt_text' in request.POST:
                service.hero_alt_text = request.POST['hero_alt_text']
                print(f"DEBUG: Set hero_alt_text to {request.POST['hero_alt_text']}")
            if 'hero_image_2' in request.FILES:
                service.hero_image_2 = request.FILES['hero_image_2']
                print(f"DEBUG: Set hero_image_2 to {request.FILES['hero_image_2']}")
            if 'hero_image_url_2' in request.POST:
                service.hero_image_url_2 = request.POST['hero_image_url_2']
                print(f"DEBUG: Set hero_image_url_2 to {request.POST['hero_image_url_2']}")
            if 'hero_alt_text_2' in request.POST:
                service.hero_alt_text_2 = request.POST['hero_alt_text_2']
                print(f"DEBUG: Set hero_alt_text_2 to {request.POST['hero_alt_text_2']}")
            if 'hero_image_3' in request.FILES:
                service.hero_image_3 = request.FILES['hero_image_3']
                print(f"DEBUG: Set hero_image_3 to {request.FILES['hero_image_3']}")
            if 'hero_image_url_3' in request.POST:
                service.hero_image_url_3 = request.POST['hero_image_url_3']
                print(f"DEBUG: Set hero_image_url_3 to {request.POST['hero_image_url_3']}")
            if 'hero_alt_text_3' in request.POST:
                service.hero_alt_text_3 = request.POST['hero_alt_text_3']
                print(f"DEBUG: Set hero_alt_text_3 to {request.POST['hero_alt_text_3']}")
            service.save()
            print(f"DEBUG: Service saved successfully")
            return JsonResponse({"message": "Service page updated", "service": service_data(service)})

        # Handle JSON data
        print(f"DEBUG: JSON data received for service {service_id}")
        print(f"DEBUG: Content-Type: {request.content_type}")
        data = json.loads(request.body)
        fields = ("name", "slug", "description", "short_description", "icon", "hero_eyebrow", "hero_title", "hero_description", "hero_image_url", "hero_alt_text", "hero_image_url_2", "hero_alt_text_2", "hero_image_url_3", "hero_alt_text_3", "meta_title", "meta_description", "is_active", "display_order")
        for field in fields:
            if field in data:
                setattr(service, field, data[field])
        service.save()
        return JsonResponse({"message": "Service page updated", "service": service_data(service)})
    except (ValueError, TypeError) as exc:
        print(f"DEBUG: Error in service_detail: {exc}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
@authenticated_content_write
def service_section_list(request, service_id):
    try:
        service = Service.objects.get(id=service_id)
        data = json.loads(request.body)
        section = ServiceSection.objects.create(service=service, label=data["label"], heading=data.get("heading", data["label"]),
                                                content=data.get("content", ""), image_url=data.get("image_url", ""),
                                                alt_text=data.get("alt_text", ""), display_order=data.get("display_order", service.sections.count() + 1),
                                                is_enabled=data.get("is_enabled", True))
        return JsonResponse(section_data(section), status=201)
    except (Service.DoesNotExist, KeyError, ValueError, TypeError) as exc:
        return JsonResponse({"error": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["POST", "PATCH", "DELETE"])
@authenticated_content_write
def service_section_detail(request, service_id, section_id):
    try:
        section = ServiceSection.objects.get(id=section_id, service_id=service_id)
    except ServiceSection.DoesNotExist:
        return JsonResponse({"error": "Service section not found"}, status=404)
    if request.method == "DELETE":
        section.delete()
        return JsonResponse({"message": "Section deleted"})
    try:
        # Handle FormData (for file uploads)
        if request.content_type and 'multipart/form-data' in request.content_type:
            print(f"DEBUG: FormData received for section {section_id} in service {service_id}")
            print(f"DEBUG: FILES: {request.FILES}")
            print(f"DEBUG: POST: {request.POST}")
            print(f"DEBUG: Content-Type: {request.content_type}")

            if 'image' in request.FILES:
                section.image = request.FILES['image']
                print(f"DEBUG: Set image to {request.FILES['image']}")
            if 'image_url' in request.POST:
                section.image_url = request.POST['image_url']
                print(f"DEBUG: Set image_url to {request.POST['image_url']}")
            if 'alt_text' in request.POST:
                section.alt_text = request.POST['alt_text']
                print(f"DEBUG: Set alt_text to {request.POST['alt_text']}")
            if 'image_2' in request.FILES:
                section.image_2 = request.FILES['image_2']
                print(f"DEBUG: Set image_2 to {request.FILES['image_2']}")
            if 'image_url_2' in request.POST:
                section.image_url_2 = request.POST['image_url_2']
                print(f"DEBUG: Set image_url_2 to {request.POST['image_url_2']}")
            if 'alt_text_2' in request.POST:
                section.alt_text_2 = request.POST['alt_text_2']
                print(f"DEBUG: Set alt_text_2 to {request.POST['alt_text_2']}")
            if 'image_3' in request.FILES:
                section.image_3 = request.FILES['image_3']
                print(f"DEBUG: Set image_3 to {request.FILES['image_3']}")
            if 'image_url_3' in request.POST:
                section.image_url_3 = request.POST['image_url_3']
                print(f"DEBUG: Set image_url_3 to {request.POST['image_url_3']}")
            if 'alt_text_3' in request.POST:
                section.alt_text_3 = request.POST['alt_text_3']
                print(f"DEBUG: Set alt_text_3 to {request.POST['alt_text_3']}")
            section.save()
            print(f"DEBUG: Section saved successfully")
            return JsonResponse(section_data(section))

        # Handle JSON data
        print(f"DEBUG: JSON data received for section {section_id} in service {service_id}")
        print(f"DEBUG: Content-Type: {request.content_type}")
        data = json.loads(request.body)
        for field in ("label", "heading", "content", "image_url", "alt_text", "image_url_2", "alt_text_2", "image_url_3", "alt_text_3", "display_order", "is_enabled"):
            if field in data:
                setattr(section, field, data[field])
        section.save()
        return JsonResponse(section_data(section))
    except (ValueError, TypeError) as exc:
        print(f"DEBUG: Error in service_section_detail: {exc}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
@authenticated_content_write
def service_gallery_update(request, service_id):
    try:
        service = Service.objects.get(id=service_id)
        data = json.loads(request.body)
        gallery_image_ids = data.get("gallery_image_ids", [])

        # Clear existing gallery images and set new ones
        service.gallery_images.clear()
        for image_id in gallery_image_ids:
            try:
                media_asset = MediaAsset.objects.get(id=image_id)
                service.gallery_images.add(media_asset)
            except MediaAsset.DoesNotExist:
                continue

        return JsonResponse({"message": "Gallery images updated", "service": service_data(service)})
    except Service.DoesNotExist:
        return JsonResponse({"error": "Service not found"}, status=404)
    except (ValueError, TypeError) as exc:
        return JsonResponse({"error": str(exc)}, status=400)
