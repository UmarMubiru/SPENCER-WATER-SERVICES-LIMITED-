try:
    from celery import shared_task
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    # Create a dummy decorator for when Celery is not available
    def shared_task(func):
        return func

from django.utils import timezone
from .models import Report
from .generators import REPORT_GENERATORS


@shared_task
def generate_report_task(report_id):
    """
    Async task to generate reports. This prevents the admin interface from hanging
    during report generation, especially for large date ranges or complex reports.
    """
    report = Report.objects.get(id=report_id)
    report.status = Report.Status.PROCESSING
    report.save()
    
    try:
        # Call the appropriate report generator based on category and type
        generator_func = REPORT_GENERATORS.get(report.category, {}).get(report.report_type)
        
        if not generator_func:
            raise ValueError(f"No generator found for {report.category}.{report.report_type}")
        
        # Generate the report data
        data = generator_func(
            date_range_start=report.date_range_start,
            date_range_end=report.date_range_end
        )
        
        # Render to file (PDF or Excel)
        from .renderers import render_report
        file_path = render_report(data, report.report_type, report.file_format)
        
        # Save the file
        report.file.save(file_path.name, file_path)
        report.status = Report.Status.READY
        report.completed_at = timezone.now()
        report.error_message = ""
        
    except Exception as e:
        report.status = Report.Status.FAILED
        report.error_message = str(e)
        report.completed_at = timezone.now()
    
    report.save()
    return report.status
