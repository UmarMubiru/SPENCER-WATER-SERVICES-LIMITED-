# Clerk of Works Role System

## Overview
The Clerk of Works role has been restructured from a job title to a project-specific role that can be assigned during project creation. This allows for more flexible project management where any technical team member can be designated as the Clerk of Works for a specific project, regardless of their job title.

## Key Changes

### 1. Database Model Changes

#### ProjectRoleAllocation Model
- **Removed**: `is_team_lead` boolean field
- **Added**: `project_role` foreign key to `ProjectRole` model
- **Purpose**: Enables flexible project-specific role assignment

#### ProjectRole Model
- **Existing**: Already existed with Clerk of Works role
- **Usage**: Now used for project-specific role assignments
- **Roles Available**: Clerk of Works, Site Manager

### 2. Backend Changes

#### Serializers (`projects/serializers.py`)
- Updated `ProjectRoleAllocationSerializer`:
  - Removed `is_team_lead` field
  - Added `project_role_name` field
  - Now includes project role information in responses

#### Views (`projects/views.py`)
- Updated `assign_employee` action:
  - Removed `is_team_lead` boolean handling
  - Added `project_role` handling
  - Automatically replaces existing Clerk of Works when assigning new one
  - Maintains one Clerk of Works per project rule

### 3. Frontend Changes

#### Project Creation Page (`projects/create/page.tsx`)
- **New Features**:
  - Fetches available technical employees
  - Allows selection of multiple team members
  - Includes Clerk of Works selection dropdown
  - Automatically assigns selected employees to project
  - Designates one selected member as Clerk of Works

#### Role Assignment Page (`projects/management/[id]/role-assignment/page.tsx`)
- **Complete Rewrite**:
  - Replaced `is_team_lead` checkbox with `project_role` dropdown
  - Added ProjectRole fetch functionality
  - Updated table to show project roles instead of boolean
  - Cleaner, more flexible role assignment interface

#### Role Allocations Page (`projects/role-assignments/page.tsx`)
- **Updated**:
  - Changed table structure to show project roles
  - Displays project role badges instead of boolean values
  - Added Project Role column to table

#### Project Details Page (`projects/details/[id]/page.tsx`)
- **Updated**:
  - Replaced `is_team_lead` state with `project_role` state
  - Added ProjectRole fetch functionality
  - Updated assignment modal to use project role dropdown
  - Updated display to show project role badges

## How It Works

### Project Creation Flow

1. **Project Manager** creates a new project
2. **Technical Employees** section shows available technical department employees
3. **Team Selection**: Manager selects multiple technical team members
4. **Clerk of Works Selection**: From selected team members, Manager chooses one as Clerk of Works
5. **Assignment**: System automatically:
   - Assigns all selected employees to the project
   - Designates the chosen member as Clerk of Works
   - Sets appropriate project roles for each member

### Project Role Assignment Flow

1. **Available Employees**: Shows all available employees
2. **Job Title Selection**: Assign employee's job title for the project
3. **Project Role Selection**: Assign project-specific role (Clerk of Works, Site Manager, etc.)
4. **One Clerk of Works Rule**: System automatically ensures only one Clerk of Works per project

### Data Model

#### ProjectRoleAllocation Example
```python
{
  "id": 1,
  "employee": 1,  # Employee ID
  "project": 1,   # Project ID
  "job_title": 5, # Job Title ID (e.g., Water Engineer)
  "project_role": 1, # Project Role ID (e.g., Clerk of Works)
  "assigned_date": "2026-09-06",
  "is_active": true
}
```

This means:
- Employee with Water Engineer job title
- Assigned to Project 1
- Designated as Clerk of Works for this project
- Can have different job title in other projects

## API Endpoints

### Get Project Roles
```
GET /api/projects/roles/
```
Returns all available project roles (Clerk of Works, Site Manager, etc.)

### Assign Employee to Project
```
POST /api/projects/{project_id}/assign_employee/
```
Request body:
```json
{
  "employee": 1,
  "job_title": 5,
  "project_role": 1
}
```

### Get Project Role Allocations
```
GET /api/projects/role_allocations/?project={project_id}
```
Returns all role allocations for a project with project role information

## Usage Examples

### Creating a Project with Clerk of Works

```typescript
// Project creation automatically handles employee assignment
const response = await fetch('http://127.0.0.1:8000/api/projects/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_reference: 'PRJ-2026-001',
    name: 'New Borehole Project',
    // ... other project fields
  }),
});

// Then assign employees
await assignEmployeesToProject(projectData.id);
```

### Assigning Clerk of Works via API

```python
import requests

# Get Clerk of Works role
roles_response = requests.get('http://127.0.0.1:8000/api/projects/roles/')
clerk_role = [r for r in roles_response.json() if r['name'] == 'Clerk of Works'][0]

# Assign employee as Clerk of Works
response = requests.post(
    f'http://127.0.0.1:8000/api/projects/{project_id}/assign_employee/',
    json={
        'employee': employee_id,
        'job_title': job_title_id,
        'project_role': clerk_role['id']
    }
)
```

## Benefits of New System

### 1. Flexibility
- Any technical team member can be Clerk of Works
- Not limited to specific job titles
- Role is project-specific, not employee-specific

### 2. Clarity
- Clear separation between job title and project role
- Job title = Professional qualification (Water Engineer, Electrician, etc.)
- Project role = Project-specific responsibility (Clerk of Works, Site Manager, etc.)

### 3. Better Management
- Easy to change Clerk of Works for a project
- Employee can have different roles in different projects
- One Clerk of Works per project automatically enforced

### 4. Scalability
- Easy to add new project roles (Site Manager, Safety Officer, etc.)
- Project roles managed centrally in ProjectRole table
- No need to modify database schema for new roles

## Migration Notes

### Database Migration
- Applied migration: `0025_remove_projectroleallocation_is_team_lead_and_more.py`
- Existing `is_team_lead` data would need to be migrated to `project_role` if needed

### Frontend Compatibility
- All frontend pages updated to use new `project_role` field
- Old boolean `is_team_lead` references removed
- Backward compatibility maintained via API responses

## Testing Checklist

### Project Creation
- [ ] Create project with employee selection
- [ ] Select multiple technical employees
- [ ] Designate one as Clerk of Works
- [ ] Verify all employees assigned correctly
- [ ] Verify Clerk of Works designation saved

### Role Assignment
- [ ] Assign employee without project role
- [ ] Assign employee as Clerk of Works
- [ ] Assign second employee as Clerk of Works (should replace first)
- [ ] Verify only one Clerk of Works per project

### Display
- [ ] Project details shows project roles correctly
- [ ] Role assignments table shows project roles
- [ ] Clerk of Works badge displays correctly
- [ ] Role dropdown shows all available project roles

## Future Enhancements

Possible improvements:
1. Add more project roles (Safety Officer, Quality Control, etc.)
2. Add project role permissions system
3. Add role history tracking
4. Add bulk role assignment
5. Add role templates for common project types
6. Add role-based notifications
