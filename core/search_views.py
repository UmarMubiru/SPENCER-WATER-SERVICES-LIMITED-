from django.db.models import Q
from django.http import JsonResponse
from rest_framework.decorators import api_view
from services.models import Service, ServiceSection, ServiceFAQ
from content.models import MediaAsset
from core_pages.models import CorePage
from inventory.models import InventoryItem, Category


@api_view(['GET'])
def global_search(request):
    """
    Global search endpoint that searches across services, pages, media assets, and inventory.
    Query parameter: q (search query)
    """
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 2:
        return JsonResponse({
            'results': [],
            'query': query
        })
    
    results = []
    search_terms = query.lower().split()
    
    # Search Services
    services = Service.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(short_description__icontains=query) |
        Q(hero_title__icontains=query) |
        Q(hero_description__icontains=query),
        is_active=True
    ).distinct()[:10]
    
    for service in services:
        results.append({
            'type': 'service',
            'title': service.name,
            'description': service.short_description or service.description[:150],
            'url': f'/services/{service.slug}',
            'icon': service.icon,
        })
    
    # Search Service Sections
    sections = ServiceSection.objects.filter(
        Q(label__icontains=query) |
        Q(heading__icontains=query) |
        Q(content__icontains=query),
        is_enabled=True
    ).select_related('service')[:10]
    
    for section in sections:
        results.append({
            'type': 'service_section',
            'title': f"{section.service.name}: {section.label}",
            'description': section.heading or section.content[:150],
            'url': f'/services/{section.service.slug}',
        })
    
    # Search Service FAQs
    faqs = ServiceFAQ.objects.filter(
        Q(question__icontains=query) |
        Q(answer__icontains=query),
        is_enabled=True
    ).select_related('service')[:10]
    
    for faq in faqs:
        results.append({
            'type': 'faq',
            'title': faq.question,
            'description': faq.answer[:150],
            'url': f'/services/{faq.service.slug}',
        })
    
    # Search Core Pages
    pages = CorePage.objects.filter(
        Q(section_name__icontains=query) |
        Q(content__icontains=query),
        is_active=True
    )[:10]
    
    for page in pages:
        results.append({
            'type': 'page',
            'title': page.section_name,
            'description': f'{page.get_page_type_display()} - {page.content[:100] if page.content else ""}',
            'url': f'/{page.page_type.lower().replace("_", "-")}',
        })
    
    # Search Media Assets
    media = MediaAsset.objects.filter(
        Q(name__icontains=query) |
        Q(alt_text__icontains=query) |
        Q(folder__icontains=query)
    )[:10]
    
    for asset in media:
        results.append({
            'type': 'media',
            'title': asset.name,
            'description': asset.alt_text or f'Folder: {asset.folder or "Root"}',
            'url': asset.url,
            'is_direct_link': True,
        })
    
    # Search Inventory Items
    items = InventoryItem.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(sku__icontains=query)
    ).select_related('category')[:10]
    
    for item in items:
        results.append({
            'type': 'inventory',
            'title': item.name,
            'description': f"{item.category.name if item.category else 'Uncategorized'} - {item.description[:100] if item.description else ''}",
            'url': '/inventory',  # You may want to create a specific inventory detail page
        })
    
    # Search Inventory Categories
    categories = Category.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query)
    )[:10]
    
    for category in categories:
        results.append({
            'type': 'category',
            'title': category.name,
            'description': category.description[:150] if category.description else 'Inventory Category',
            'url': '/inventory',
        })
    
    return JsonResponse({
        'results': results,
        'query': query,
        'count': len(results)
    })
