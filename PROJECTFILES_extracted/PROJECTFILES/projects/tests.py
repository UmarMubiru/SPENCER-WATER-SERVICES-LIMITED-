from django.test import TestCase
from projects.models import Project


class ProjectApiTests(TestCase):
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
