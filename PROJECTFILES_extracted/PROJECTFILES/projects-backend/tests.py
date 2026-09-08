from django.test import TestCase
from decimal import Decimal
from projects.models import Project
from projects.models_extras import ProjectActivity, ActivityUpdateHistory, ProjectResourceAllocation


class ProjectApiTests(TestCase):
    def test_hired_tool_addition_and_summary_return_all_card_fields(self):
        project = Project.objects.create(
            project_reference="PRJ-HIRED-TOOL",
            name="Hired Tool API Project",
            service_line="borehole_drilling",
        )

        add_response = self.client.post(
            f"/api/projects/{project.id}/add_resource/",
            {
                "resource_type": "hired_tool",
                "hired_tool_name": "Concrete Mixer",
                "allocated_quantity": 2,
                "hired_from": "Acme Plant Hire",
                "hired_tool_cost": "150000.00",
            },
            content_type="application/json",
        )

        self.assertEqual(add_response.status_code, 201)
        allocation = ProjectResourceAllocation.objects.get(project=project, resource_type="hired_tool")
        self.assertEqual(allocation.tool_name, "Concrete Mixer")
        self.assertEqual(allocation.allocated_quantity, 2)
        self.assertEqual(allocation.hired_from, "Acme Plant Hire")
        self.assertEqual(allocation.hired_tool_cost, Decimal("150000.00"))

        summary_response = self.client.get(f"/api/projects/{project.id}/resources_summary/")
        self.assertEqual(summary_response.status_code, 200)
        hired_tool = summary_response.json()["hired_tools"][0]
        self.assertEqual(hired_tool["id"], str(allocation.id))
        self.assertEqual(hired_tool["tool_name"], "Concrete Mixer")
        self.assertEqual(hired_tool["quantity"], 2)
        self.assertEqual(hired_tool["hired_from"], "Acme Plant Hire")
        self.assertEqual(hired_tool["source"], "Acme Plant Hire")
        self.assertEqual(hired_tool["cost"], 150000.0)

    def test_resource_allocation_can_be_archived_and_deleted(self):
        project = Project.objects.create(
            project_reference="PRJ-RESOURCE-ACTIONS",
            name="Resource Actions Project",
            service_line="borehole_drilling",
        )
        allocation = ProjectResourceAllocation.objects.create(
            project=project,
            resource_type="company_tool",
            tool_name="Pump",
            allocated_quantity=1,
        )

        archive_response = self.client.patch(
            f"/api/projects/{project.id}/resources/{allocation.id}/",
            {"is_archived": True},
            content_type="application/json",
        )
        self.assertEqual(archive_response.status_code, 200)
        allocation.refresh_from_db()
        self.assertTrue(allocation.is_archived)
        self.assertIsNotNone(allocation.archived_at)
        self.assertEqual(self.client.get(f"/api/projects/{project.id}/resources_summary/").json()["company_tools"], [])

        delete_response = self.client.delete(f"/api/projects/{project.id}/resources/{allocation.id}/")
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(ProjectResourceAllocation.objects.filter(id=allocation.id).exists())

    def test_hired_tool_allocation_rejects_missing_card_fields(self):
        project = Project.objects.create(
            project_reference="PRJ-HIRED-VALIDATION",
            name="Hired Tool Validation Project",
            service_line="borehole_drilling",
        )

        response = self.client.post(
            f"/api/projects/{project.id}/add_resource/",
            {
                "resource_type": "hired_tool",
                "hired_from": "Supplier only",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(ProjectResourceAllocation.objects.filter(project=project).exists())

    def test_projects_endpoint_lists_created_projects(self):
        Project.objects.create(
            project_reference="PRJ-1001",
            name="Demo Borehole Project",
            service_line="borehole_drilling",
            scope_description="A sample project for API coverage.",
        )

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload)
        self.assertEqual(payload[0]["project_reference"], "PRJ-1001")

    def test_projects_endpoint_returns_average_activity_progress(self):
        project = Project.objects.create(
            project_reference="PRJ-AVG",
            name="Average API Project",
            service_line="borehole_drilling",
            completion_percentage=99,
        )
        ProjectActivity.objects.create(
            project=project, activity_name="First", order=0, progress=20,
            start_date="2026-01-01", end_date="2026-01-02",
        )
        ProjectActivity.objects.create(
            project=project, activity_name="Second", order=1, progress=80,
            start_date="2026-01-03", end_date="2026-01-04",
        )

        response = self.client.get("/api/projects/")
        payload = response.json()
        average_project = next(item for item in payload if item["id"] == str(project.id))

        self.assertEqual(average_project["computed_progress"], 50)

    def test_bulk_update_creates_activity_history_entries(self):
        project = Project.objects.create(
            project_reference="PRJ-1002",
            name="Demo Schedule Project",
            service_line="borehole_drilling",
        )

        response = self.client.post(
            "/api/projects/activities/bulk_update/",
            {
                "project": str(project.id),
                "activities": [
                    {
                        "activity_name": "Initial activity",
                        "order": 0,
                        "start_date": "2026-01-01",
                        "end_date": "2026-01-10",
                        "progress": 10,
                        "notes": "Started",
                        "status": "in_progress",
                        "resources": [],
                        "images": [],
                    }
                ],
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(ProjectActivity.objects.filter(project=project).exists())
        self.assertTrue(ActivityUpdateHistory.objects.filter(activity__project=project).exists())

    def test_bulk_update_sets_project_progress_average_from_all_activities(self):
        project = Project.objects.create(
            project_reference="PRJ-1003",
            name="Average Progress Project",
            service_line="borehole_drilling",
        )

        response = self.client.post(
            "/api/projects/activities/bulk_update/",
            {
                "project": str(project.id),
                "activities": [
                    {
                        "activity_name": "First activity",
                        "order": 0,
                        "start_date": "2026-01-01",
                        "end_date": "2026-01-10",
                        "progress": 100,
                        "notes": "Done",
                        "status": "completed",
                        "resources": [],
                        "images": [],
                    },
                    {
                        "activity_name": "Second activity",
                        "order": 1,
                        "start_date": "2026-01-11",
                        "end_date": "2026-01-20",
                        "progress": 0,
                        "notes": "Not started",
                        "status": "not_started",
                        "resources": [],
                        "images": [],
                    },
                ],
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        project.refresh_from_db()
        self.assertEqual(project.completion_percentage, 50)

    def test_bulk_update_ignores_read_only_activity_history(self):
        project = Project.objects.create(
            project_reference="PRJ-1004",
            name="Editable Schedule Project",
            service_line="borehole_drilling",
        )
        activity = ProjectActivity.objects.create(
            project=project,
            activity_name="Inspection",
            order=0,
            start_date="2026-01-01",
            end_date="2026-01-02",
            progress=10,
            status="in_progress",
        )

        response = self.client.post(
            "/api/projects/activities/bulk_update/",
            {
                "project": str(project.id),
                "activities": [{
                    "id": str(activity.id),
                    "activity_name": "Inspection",
                    "order": 0,
                    "start_date": "2026-01-01",
                    "end_date": "2026-01-02",
                    "progress": 55,
                    "notes": "Progress updated",
                    "status": "in_progress",
                    "resources": [],
                    "images": [],
                    "update_history": [],
                }],
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        activity.refresh_from_db()
        self.assertEqual(activity.progress, 55)
        self.assertTrue(ActivityUpdateHistory.objects.filter(activity=activity, action="progress_changed").exists())
