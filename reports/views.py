from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import permission_required
from .models import Report
from .tasks import generate_report_task
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def report_list(request):
    """
    API endpoint to list all reports or create a new report.
    GET: Returns list of reports with optional filtering
    POST: Creates a new report and queues it for generation
    """
    if request.method == "GET":
        reports = Report.objects.all()
        
        # Apply filters
        category = request.GET.get('category')
        status = request.GET.get('status')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        if category:
            reports = reports.filter(category=category)
        if status:
            reports = reports.filter(status=status)
        if date_from:
            reports = reports.filter(requested_at__gte=date_from)
        if date_to:
            reports = reports.filter(requested_at__lte=date_to)
        
        reports_data = [{
            'id': report.id,
            'report_type': report.report_type,
            'category': report.category,
            'status': report.status,
            'file_format': report.file_format,
            'date_range_start': report.date_range_start,
            'date_range_end': report.date_range_end,
            'generated_by': report.generated_by.username if report.generated_by else None,
            'requested_at': report.requested_at.isoformat(),
            'completed_at': report.completed_at.isoformat() if report.completed_at else None,
            'error_message': report.error_message,
        } for report in reports]
        
        return JsonResponse({'reports': reports_data})
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Create report in QUEUED status
            report = Report.objects.create(
                category=data.get('category'),
                report_type=data.get('report_type'),
                file_format=data.get('file_format', 'PDF'),
                date_range_start=data.get('date_range_start'),
                date_range_end=data.get('date_range_end'),
                generated_by=request.user if request.user.is_authenticated else None,
            )
            
            # Queue the report generation task
            generate_report_task.delay(report.id)
            
            return JsonResponse({
                'id': report.id,
                'status': report.status,
                'message': 'Report queued for generation'
            }, status=201)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "DELETE"])
def report_detail(request, report_id):
    """
    API endpoint to get, update, or delete a specific report.
    """
    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        return JsonResponse({'error': 'Report not found'}, status=404)
    
    if request.method == "GET":
        report_data = {
            'id': report.id,
            'report_type': report.report_type,
            'category': report.category,
            'status': report.status,
            'file_format': report.file_format,
            'date_range_start': report.date_range_start,
            'date_range_end': report.date_range_end,
            'generated_by': report.generated_by.username if report.generated_by else None,
            'requested_at': report.requested_at.isoformat(),
            'completed_at': report.completed_at.isoformat() if report.completed_at else None,
            'error_message': report.error_message,
        }
        return JsonResponse(report_data)
    
    elif request.method == "DELETE":
        report.delete()
        return JsonResponse({'message': 'Report deleted successfully'})


@require_http_methods(["GET"])
def report_download(request, report_id):
    """
    API endpoint to download a generated report file.
    """
    try:
        report = Report.objects.get(id=report_id)
        
        if report.status != Report.Status.READY:
            return JsonResponse({'error': 'Report is not ready for download'}, status=400)
        
        if not report.file:
            return JsonResponse({'error': 'Report file not found'}, status=404)
        
        # Serve the file
        response = HttpResponse(report.file.read(), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{report.file.name}"'
        return response
        
    except Report.DoesNotExist:
        return JsonResponse({'error': 'Report not found'}, status=404)


@require_http_methods(["POST"])
def report_retry(request, report_id):
    """
    API endpoint to retry a failed report generation.
    """
    try:
        report = Report.objects.get(id=report_id)
        
        if report.status != Report.Status.FAILED:
            return JsonResponse({'error': 'Only failed reports can be retried'}, status=400)
        
        # Reset status and queue again
        report.status = Report.Status.QUEUED
        report.error_message = ""
        report.save()
        
        generate_report_task.delay(report.id)
        
        return JsonResponse({'message': 'Report queued for retry'})
        
    except Report.DoesNotExist:
        return JsonResponse({'error': 'Report not found'}, status=404)
