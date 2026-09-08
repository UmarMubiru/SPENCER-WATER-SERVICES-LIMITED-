from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from projects.models import CasualWorker, CasualWorkerAttendance, Project


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


class CasualWorkerPayTests(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
            project_reference="PRJ-PAY-1001",
            name="Daily pay project",
            service_line="borehole_drilling",
        )

    def test_daily_rate_is_used_for_end_of_day_pay(self):
        worker = CasualWorker.objects.create(
            project=self.project,
            full_name="Daily Worker",
            phone="0700000000",
            next_of_kin="Kin Name",
            payment_type="daily_rate",
            daily_rate=40000,
        )
        now = timezone.now()
        attendance = CasualWorkerAttendance.objects.create(
            casual_worker=worker,
            clock_in=now - timedelta(hours=8),
            clock_out=now,
        )

        self.assertEqual(attendance.daily_wage, 40000)

    def test_piece_rate_uses_completed_pieces_for_end_of_day_pay(self):
        worker = CasualWorker.objects.create(
            project=self.project,
            full_name="Piece Worker",
            phone="0700000001",
            next_of_kin="Kin Name",
            payment_type="piece_rate",
            piece_rate=5000,
        )
        now = timezone.now()
        attendance = CasualWorkerAttendance.objects.create(
            casual_worker=worker,
            clock_in=now - timedelta(hours=8),
            clock_out=now,
            pieces_completed=6,
        )

        self.assertEqual(attendance.daily_wage, 30000)
