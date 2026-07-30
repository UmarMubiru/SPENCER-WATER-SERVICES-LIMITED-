"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings # type: ignore
from django.conf.urls.static import static # type: ignore
from django.contrib import admin # type: ignore
from django.urls import path, include # type: ignore
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/employees/', include('employees.urls')),
    path('api/users/', include('users.urls')),
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),
    path(
        "api/inventory/",
        include("inventory.urls"),
    ),
    path("inventory/", include("inventory.urls")),
    path('api/roles/', include('roles.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/inventory/', include('inventory.api_urls')),
    path('api/reports/', include('reports.urls')),
    path('api/content/blog/', include('blog.urls')),
    path('api/content/testimonials/', include('testimonials.urls')),
    path('api/content/portfolio/', include('portfolio.urls')),
    path('api/content/services/', include('services.urls')),
    path('api/content/core-pages/', include('core_pages.urls')),
    path('api/content/version-history/', include('version_history.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
