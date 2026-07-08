from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardViewSet, EmployeeViewSet, DepartmentViewSet,
    JobTitleViewSet, EmploymentTypeViewSet, ContractViewSet,
    EmployeeDocumentViewSet, EmployeeAssignmentViewSet,
    EmployeeHistoryViewSet, ReportsViewSet
)

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'job-titles', JobTitleViewSet, basename='jobtitle')
router.register(r'employment-types', EmploymentTypeViewSet, basename='employmenttype')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'documents', EmployeeDocumentViewSet, basename='document')
router.register(r'assignments', EmployeeAssignmentViewSet, basename='assignment')
router.register(r'history', EmployeeHistoryViewSet, basename='history')
router.register(r'reports', ReportsViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
