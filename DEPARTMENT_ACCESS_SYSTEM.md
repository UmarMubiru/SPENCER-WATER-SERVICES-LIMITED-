# Department-Based Module Access System

## Overview
A comprehensive role-based access control system has been implemented to manage module access based on departments and job titles. Each department now has personalized dashboards and restricted access to modules and reports. Additionally, job title-level overrides allow for fine-grained control within departments.

## Department Module Permissions

### Administration
- **Access**: Full access to all modules
- **Modules**: Dashboard, Leads, CRM, Quotations, Projects, Tenders, Inventory, Employees, Users, Reports, Settings
- **Permission Level**: `full` for all modules

### Human Resource
- **Access**: Department-specific modules
- **Modules**: 
  - Dashboard: `view`
  - Leads: `view`
  - CRM: `view`
  - Quotations: `view`
  - Employees: `full`
  - Reports: `view`
- **Excluded**: Projects, Tenders, Inventory, Users, Settings

### Project Management
- **Access**: Project-specific modules
- **Modules**:
  - Dashboard: `view`
  - Projects: `full`
  - Tenders: `view`
  - Reports: `view`
- **Excluded**: Leads, CRM, Quotations, Inventory, Employees, Users, Settings

### Technical
- **Access**: Technical and inventory modules (with job title restrictions)
- **Department Default**:
  - Dashboard: `view`
  - Inventory: `none` (restricted to job title)
  - Reports: `view`
- **Job Title Override - Inventory Manager**:
  - Inventory: `full` (only users with this job title can access)
- **Excluded**: Leads, CRM, Quotations, Projects, Tenders, Employees, Users, Settings

## Job Title-Level Overrides

The system supports job title-specific permission overrides within departments. This allows for fine-grained access control.

### Example: Technical Department Inventory Access
- **Department Default**: Technical users cannot access inventory (`none`)
- **Job Title Override**: Users with "Inventory Manager" job title get full access (`full`)
- **Implementation**: Job title overrides take precedence over department defaults

## Database Changes

### 1. UserProfile Model Enhancement
- Added `department` field linking to `employees.Department`
- Added `job_title` field for permission overrides
- Migrations applied:
  - `users/migrations/0007_userprofile_department.py`
  - `users/migrations/0009_userprofile_job_title.py`

### 2. ModulePermission System
- Department-based permissions stored in `ModulePermission` table
- Added `job_title` field for overrides
- Structure: `role` (department name), `module`, `permission` (view/edit/full/none), `job_title` (optional)
- Unique constraint: `(role, module, job_title)`
- Automatically populated with department-specific permissions
- Job title overrides stored as separate records with `job_title` set

## Backend Changes

### 1. Serializers (`users/serializers.py`)
- Added `department_name` field to `UserProfileSerializer`
- Added `job_title` field to `UserProfileSerializer`
- Added `module_permissions` method to return department and job title-based permissions
- Permission logic:
  1. Get job title-specific permissions (if job_title exists)
  2. Get department-level permissions
  3. Merge with job title overrides taking precedence

### 2. Views (`users/views.py`)
- Added `_get_module_permissions()` helper function
- Updated `login_view` to include department, job title, and module permissions in response
- Updated `my_profile` to include module permissions with job title overrides
- Login response now includes:
  ```json
  {
    "user": {
      "department": "department_name",
      "department_id": id,
      "job_title": "Inventory Manager",
      "module_permissions": {
        "dashboard": "view",
        "inventory": "full",  // Override due to job title
        "reports": "view",
        ...
      }
    }
  }
  ```

## Frontend Changes

### 1. Authentication Context (`contexts/AuthContext.tsx`)
- Already supports `module_permissions` and `job_title` in user object
- No changes needed - system was already prepared

### 2. Sidebar (`components/Sidebar.tsx`)
- Updated `hasPermission` function to check department-based permissions first
- Falls back to role-based permissions for backward compatibility
- Filters navigation items based on `module_permissions`

### 3. Main Dashboard (`admin/dashboard/page.tsx`)
- Already implements department-based filtering
- Shows only cards and quick actions for accessible modules
- Uses `canAccess()` function based on `module_permissions`

### 4. Reports Dashboard (`admin/reports/dashboard/page.tsx`)
- Completely rewritten to support module-specific filtering
- Module navigation buttons filtered by department permissions
- KPI cards shown only for accessible modules
- Charts filtered by accessible modules:
  - Employee Distribution: requires `employees` access
  - Projects by Status: requires `projects` access
  - Quotation Funnel: requires `crm` access
  - Low Stock Items: requires `inventory` access

## Permission Levels

- **view**: Can view data, no editing capabilities
- **edit**: Can view and edit data
- **full**: Full access including delete operations
- **none**: No access to module

## How It Works

### User Login Flow
1. User logs in via `/api/users/auth/token/`
2. Backend fetches user's department and job title
3. Backend fetches module permissions:
   - First checks for job title-specific overrides
   - Then gets department-level permissions
   - Merges with job title overrides taking precedence
4. Response includes `module_permissions` object
5. Frontend stores permissions in auth context
6. All components use permissions to filter content

### Dashboard Personalization
1. Dashboard checks `user.module_permissions`
2. Filters stats cards based on accessible modules
3. Filters quick actions based on accessible modules
4. Shows only relevant data for the user's department and job title

### Report Filtering
1. Reports dashboard checks `user.module_permissions`
2. Shows module navigation only for accessible modules
3. Displays KPI cards only for accessible modules
4. Renders charts only for accessible modules
5. All report data is module-specific

## Usage Instructions

### Assigning Departments and Job Titles to Users
Users must be assigned a department and optionally a job title in their UserProfile:

```python
from users.models import UserProfile
from employees.models import Department

# Get the department
dept = Department.objects.get(name='technical')

# Assign to user with job title
profile = UserProfile.objects.get(user=user)
profile.department = dept
profile.job_title = 'Inventory Manager'  # Optional, for overrides
profile.save()
```

### Customizing Department Permissions
Modify department permissions by updating `ModulePermission` records:

```python
from users.models import ModulePermission

# Update a department-level permission
perm = ModulePermission.objects.get(role='technical', module='projects', job_title__isnull=True)
perm.permission = 'view'  # or 'edit', 'full', 'none'
perm.save()
```

### Adding Job Title Overrides
Add job title-specific permission overrides:

```python
from users.models import ModulePermission

# Add job title override
ModulePermission.objects.create(
    role='technical',
    module='inventory',
    permission='full',
    job_title='Inventory Manager'
)
```

### Adding New Departments
1. Create the department in `employees.Department`
2. Add module permissions in `ModulePermission` table (with `job_title=None`)
3. Add job title overrides if needed (with specific `job_title` values)
4. Assign users to the department
5. Users will automatically get the department's module access

## Testing

To test the system:

### 1. Technical Department - Non-Inventory Manager
- User with `technical` department, no job title or different job title
- Should see: Dashboard, Reports
- Should NOT see: Inventory
- Dashboard should NOT show inventory-related cards
- Reports should NOT show inventory data

### 2. Technical Department - Inventory Manager
- User with `technical` department, `job_title='Inventory Manager'`
- Should see: Dashboard, Inventory, Reports
- Dashboard should show inventory-related cards
- Reports should show inventory data

### 3. Administration Access
- User with `administration` department
- Should see all modules regardless of job title
- All dashboard cards should be visible
- All report sections should be accessible

### 4. Human Resource Access
- User with `human_resource` department
- Should see: Dashboard, Leads, CRM, Quotations, Employees, Reports
- Should NOT see: Projects, Tenders, Inventory, Users, Settings
- Dashboard should show employee-related cards
- Reports should show employee distribution but not project charts

### 5. Project Management Access
- User with `project_management` department
- Should see: Dashboard, Projects, Tenders, Reports
- Should NOT see: Leads, CRM, Quotations, Inventory, Employees, Users, Settings
- Dashboard should show project-related cards
- Reports should show project charts but not employee/inventory data

## Migration Notes

- Database migrations must be applied:
  - `0007_userprofile_department.py`
  - `0008_alter_modulepermission_unique_together_and_more.py`
  - `0009_userprofile_job_title.py`
- Existing users without a department will have no module restrictions (fallback to role-based)
- It's recommended to assign all users to appropriate departments
- Department names must match exactly: `administration`, `human_resource`, `project_management`, `technical`
- Job title names must match exactly the values stored in `ModulePermission.job_title`

## Future Enhancements

Possible improvements:
1. Add UI for managing department permissions
2. Add UI for managing job title overrides
3. Add more granular permissions within modules
4. Add permission templates for easy setup
5. Add audit logging for permission changes
6. Add department-specific landing pages
7. Add support for multiple job titles per user