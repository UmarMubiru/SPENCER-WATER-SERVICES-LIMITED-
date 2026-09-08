from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CorePage, PageField, PageImage, CoreValue, TeamMember
from .serializers import PageFieldSerializer, PageImageSerializer, CoreValueSerializer, TeamMemberSerializer
from .default_content import ensure_default_page_fields, ensure_default_page_images
from core.content_security import authenticated_content_write
from blog.models import BlogPost
from projects.models import Project
from projects.models_extras import ActivityImage
from services.models import Service
from testimonials.models import Testimonial
import json


def log_system_activity(module, action, description, performed_by, reference_id=None, reference_type=None, old_value=None, new_value=None, department=None):
    """Helper function to log to centralized SystemActivity"""
    from reports.models import SystemActivity

    performed_by_name = performed_by.get_full_name() if performed_by else 'System'

    SystemActivity.objects.create(
        module=module,
        action=action,
        description=description,
        performed_by=performed_by,
        performed_by_name=performed_by_name,
        department=department or (getattr(performed_by, 'department', '') if performed_by else ''),
        reference_id=reference_id or '',
        reference_type=reference_type or '',
        old_value=old_value or {},
        new_value=new_value or {},
    )


@require_GET
def public_site_content(request):
    """Return only public, active CMS content for the marketing website."""
    ensure_default_page_fields()
    ensure_default_page_images()
    pages = {}

    # Get all unique page values from PageField
    all_pages = PageField.objects.values_list('page', flat=True).distinct()

    for page in all_pages:
        pages[page] = {
            'fields': {
                field.key: field.value
                for field in PageField.objects.filter(page=page).order_by('display_order')
            },
            'images': [
                {
                    'key': image.key,
                    'label': image.label,
                    'image_url': (request.build_absolute_uri(image.image.url) if image.image else image.image_url) if image else None,
                    'alt_text': image.alt_text if image else '',
                }
                for image in PageImage.objects.filter(page=page).order_by('key')
            ],
        }

    print(f"Public site content for page 'home': {pages.get('home', {})}")

    # Handle services model that may not have all expected fields
    services_data = []
    try:
        from services.models import ServiceSection, ServiceFAQ
        for service in Service.objects.filter(is_active=True):
            # Get page fields for this service
            page_name = f'service-{service.slug}'
            service_fields = PageField.objects.filter(page=page_name)
            service_images = PageImage.objects.filter(page=page_name)

            # Get service sections
            service_sections = ServiceSection.objects.filter(service=service, is_enabled=True).order_by('display_order')

            # Get service FAQs
            service_faqs = ServiceFAQ.objects.filter(service=service, is_enabled=True).order_by('display_order')
            # Older service pages may have a generic PageImage hero, but the
            # current editor saves hero images directly on the Service record.
            hero_slot = service_images.filter(key='hero_image_1').first()
            service_hero_image = (
                request.build_absolute_uri(service.hero_image.url)
                if service.hero_image
                else service.hero_image_url
            ) or (
                (request.build_absolute_uri(hero_slot.image.url) if hero_slot.image else hero_slot.image_url)
                if hero_slot else None
            )
            hero_images = [
                service_hero_image,
                request.build_absolute_uri(service.hero_image_2.url) if service.hero_image_2 else service.hero_image_url_2,
                request.build_absolute_uri(service.hero_image_3.url) if service.hero_image_3 else service.hero_image_url_3,
            ]

            def page_image_url(key):
                slot = service_images.filter(key=key).first()
                if not slot:
                    return None
                return request.build_absolute_uri(slot.image.url) if slot.image else slot.image_url

            service_dict = {
                'name': service.name,
                'slug': service.slug,
                'description': service.description,
                'short_description': getattr(service, 'short_description', service.description),
                'icon': service.icon,
                'display_order': service.display_order,
                'hero_eyebrow': service_fields.filter(key='hero_eyebrow').first().value if service_fields.filter(key='hero_eyebrow').exists() else getattr(service, 'hero_eyebrow', ''),
                'hero_title': service_fields.filter(key='hero_headline').first().value if service_fields.filter(key='hero_headline').exists() else getattr(service, 'hero_title', service.name),
                'hero_description': service_fields.filter(key='hero_description').first().value if service_fields.filter(key='hero_description').exists() else getattr(service, 'hero_description', service.description),
                'hero_image': hero_images[0],
                'hero_images': hero_images,
                'hero_alt_text': getattr(service, 'hero_alt_text', '') or (hero_slot.alt_text if hero_slot else ''),
                'meta_title': service_fields.filter(key='meta_title').first().value if service_fields.filter(key='meta_title').exists() else getattr(service, 'meta_title', service.name),
                'meta_description': service_fields.filter(key='meta_description').first().value if service_fields.filter(key='meta_description').exists() else getattr(service, 'meta_description', service.description),
                'sections': [
                    {
                        'label': section.label,
                        'heading': section.heading,
                        'content': section.content,
                        # As with the hero, a section can use a direct upload or
                        # an image URL selected from the Media Library.
                        'image': request.build_absolute_uri(section.image.url) if section.image else section.image_url,
                        'process_images': list(filter(None, [
                            request.build_absolute_uri(section.image.url) if section.image else section.image_url,
                            request.build_absolute_uri(section.image_2.url) if section.image_2 else section.image_url_2,
                            request.build_absolute_uri(section.image_3.url) if section.image_3 else section.image_url_3,
                        ])),
                        'alt_text': section.alt_text,
                        'display_order': section.display_order,
                    }
                    for section in service_sections
                ],
                'faqs': [
                    {
                        'id': faq.id,
                        'question': faq.question,
                        'answer': faq.answer,
                        'display_order': faq.display_order,
                    }
                    for faq in service_faqs
                ],
            }
            services_data.append(service_dict)
    except Exception as e:
        print(f"Error fetching services: {e}")
        services_data = []

    return JsonResponse({
        'pages': pages,
        'about': {
            'core_values': list(CoreValue.objects.filter(is_active=True).values(
                'title', 'description', 'icon', 'display_order'
            )),
            'team_members': [
                {
                    'name': member.name,
                    'role_title': member.role_title,
                    'bio': member.bio,
                    'photo_url': request.build_absolute_uri(member.photo.url) if member.photo else None,
                    'display_order': member.display_order,
                }
                for member in TeamMember.objects.filter(is_active=True).order_by('display_order')
            ],
        },
        'services': services_data,
        'public_projects': [
            {
                'id': str(project.id),
                'title': project.name,
                'description': project.scope_description,
                'location': project.site_location,
                'category': project.get_service_line_display(),
                'cover_image': request.build_absolute_uri(cover.image.url) if (cover := ActivityImage.objects.filter(activity__project=project).first()) else None,
                'latitude': project.latitude,
                'longitude': project.longitude,
            }
            for project in Project.objects.filter(is_portfolio_candidate=True, is_archived=False).order_by('-created_at')
        ],
        'testimonials': list(Testimonial.objects.filter(
            status=Testimonial.Status.APPROVED,
            is_featured=True,
        ).values('customer_name', 'company_name', 'rating', 'content', 'project_reference')),
        'blog_posts': list(BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED).values(
            'title', 'slug', 'excerpt', 'featured_image', 'published_at'
        )),
    })


@csrf_exempt
@require_http_methods(["GET", "POST"])
@authenticated_content_write
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
@authenticated_content_write
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


# ── REST API ViewSets for Generic Page-Driven Content Management ─────────

class PageFieldViewSet(viewsets.ModelViewSet):
    serializer_class = PageFieldSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['key', 'label']
    ordering_fields = ['display_order', 'updated_at']
    ordering = ['page', 'display_order']

    def get_queryset(self):
        # ensure_default_page_fields()
        queryset = PageField.objects.all()
        page = self.request.query_params.get('page')
        if page:
            queryset = queryset.filter(page=page)
        return queryset

    def get_permissions(self):
        return [AllowAny()] if self.request.method in ('GET', 'HEAD', 'OPTIONS') else [IsAuthenticated()]

    def perform_create(self, serializer):
        field = serializer.save(updated_by=self.request.user)

        # Log to SystemActivity
        log_system_activity(
            module='content',
            action='create',
            description=f'Page field created: {field.key} on {field.get_page_display()}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(field.id),
            reference_type='PageField',
            new_value={'key': field.key, 'page': field.page, 'label': field.label},
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = {'value': old_instance.value}
        super().perform_update(serializer)
        new_instance = self.get_object()
        new_data = {'value': new_instance.value}

        # Log to SystemActivity
        log_system_activity(
            module='content',
            action='update',
            description=f'Page field updated: {new_instance.key} on {new_instance.page}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(new_instance.id),
            reference_type='PageField',
            old_value=old_data,
            new_value=new_data,
        )


class PageImageViewSet(viewsets.ModelViewSet):
    serializer_class = PageImageSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['key', 'label']
    ordering_fields = ['updated_at']
    ordering = ['page']

    def get_queryset(self):
        # ensure_default_page_images()
        queryset = PageImage.objects.all()
        page = self.request.query_params.get('page')
        if page:
            queryset = queryset.filter(page=page)
        return queryset

    def get_permissions(self):
        return [AllowAny()] if self.request.method in ('GET', 'HEAD', 'OPTIONS') else [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class CoreValueViewSet(viewsets.ModelViewSet):
    queryset = CoreValue.objects.all()
    serializer_class = CoreValueSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

    def get_permissions(self):
        return [AllowAny()] if self.request.method in ('GET', 'HEAD', 'OPTIONS') else [IsAuthenticated()]


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'role_title']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

    def get_permissions(self):
        return [AllowAny()] if self.request.method in ('GET', 'HEAD', 'OPTIONS') else [IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to include employee details if linked"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Add employee details if linked
        if instance.employee:
            data['employee_details'] = {
                'id': instance.employee.id,
                'full_name': instance.employee.full_name,
                'phone': instance.employee.phone,
                'email': instance.employee.email,
                'department': instance.employee.department.name if instance.employee.department else None,
                'job_title': instance.employee.job_title.title if instance.employee.job_title else None,
                'employee_photo': instance.employee.photo.url if instance.employee.photo else None,
            }
        else:
            data['employee_details'] = None

        return Response(data)
