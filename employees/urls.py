from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardViewSet, EmployeeViewSet, DepartmentViewSet,
    JobTitleViewSet, EmploymentTypeViewSet, ContractDocumentViewSet,
    EmployeeDocumentViewSet, EmployeeHistoryViewSet, AttendanceViewSet,
    CredentialViewSet, SkillViewSet, EmployeeSkillViewSet, ProjectAssignmentViewSet
)

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'job-titles', JobTitleViewSet, basename='jobtitle')
router.register(r'employment-types', EmploymentTypeViewSet, basename='employmenttype')
router.register(r'contract-documents', ContractDocumentViewSet, basename='contract-document')
router.register(r'documents', EmployeeDocumentViewSet, basename='document')
router.register(r'history', EmployeeHistoryViewSet, basename='history')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'credentials', CredentialViewSet, basename='credential')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'employee-skills', EmployeeSkillViewSet, basename='employee-skill')
router.register(r'project-assignments', ProjectAssignmentViewSet, basename='project-assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('full_time/', DashboardViewSet.as_view({'get': 'full_time'}), name='employee-full-time'),
    path('part_time/', DashboardViewSet.as_view({'get': 'part_time'}), name='employee-part-time'),
]
