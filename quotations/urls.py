from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, LeadActivityViewSet, TaskViewSet, NotificationViewSet, LeadViewSet, LeadAttachmentViewSet,
    SiteVisitViewSet, PublicLeadViewSet,
    QuotationTemplateViewSet, QuotationTemplateItemViewSet,
    QuotationViewSet, QuotationItemViewSet
)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'lead-activities', LeadActivityViewSet, basename='lead-activity')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'lead-attachments', LeadAttachmentViewSet, basename='lead-attachment')
router.register(r'site-visits', SiteVisitViewSet, basename='site-visit')
router.register(r'public/leads', PublicLeadViewSet, basename='public-lead')
router.register(r'quotation-templates', QuotationTemplateViewSet, basename='quotation-template')
router.register(r'quotation-template-items', QuotationTemplateItemViewSet, basename='quotation-template-item')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'quotation-items', QuotationItemViewSet, basename='quotation-item')

urlpatterns = [
    path('', include(router.urls)),
]
