"""
Shared rendering utilities for reports.
This provides consistent PDF and Excel generation across all report categories.
"""

import os
from datetime import datetime
from io import BytesIO
from django.conf import settings
from django.template.loader import render_to_string


def render_report(data, report_name, file_format):
    """
    Render report data to PDF or Excel format.
    
    Args:
        data: Dictionary containing report data (structure depends on report type)
        report_name: Name of the report (for filename)
        file_format: 'PDF' or 'XLSX'
    
    Returns:
        File-like object ready to be saved
    """
    if file_format == 'PDF':
        return render_to_pdf(data, report_name)
    elif file_format == 'XLSX':
        return render_to_excel(data, report_name)
    else:
        raise ValueError(f"Unsupported file format: {file_format}")


def render_to_pdf(data, report_name):
    """
    Render report to PDF using WeasyPrint or similar.
    This provides consistent styling across all report types.
    """
    try:
        from weasyprint import HTML, CSS
    except ImportError:
        raise ImportError("WeasyPrint is required for PDF generation. Install it with: pip install weasyprint")
    
    # Render HTML template with data
    html_content = render_to_string('reports/pdf_template.html', {
        'data': data,
        'report_name': report_name,
        'generated_at': datetime.now(),
    })
    
    # Apply consistent CSS styling
    css_content = render_to_string('reports/pdf_styles.html', {})
    
    # Generate PDF
    html = HTML(string=html_content)
    css = CSS(string=css_content)
    pdf_bytes = html.write_pdf(stylesheets=[css])
    
    # Create file-like object
    pdf_file = BytesIO(pdf_bytes)
    pdf_file.name = f"{report_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    pdf_file.seek(0)
    
    return pdf_file


def render_to_excel(data, report_name):
    """
    Render report to Excel using openpyxl or pandas.
    This provides consistent Excel formatting across all report types.
    """
    try:
        import pandas as pd
    except ImportError:
        raise ImportError("pandas is required for Excel generation. Install it with: pip install pandas openpyxl")
    
    # Convert data to DataFrame (structure depends on report type)
    # This is a generic implementation - specific report types may need custom handling
    if isinstance(data, dict):
        # Try to convert dict to DataFrame
        df = pd.DataFrame(data.get('rows', []))
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        raise ValueError("Unsupported data format for Excel generation")
    
    # Create Excel file
    excel_file = BytesIO()
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=report_name[:31], index=False)  # Sheet name max 31 chars
        
        # Get the workbook and worksheet for formatting
        workbook = writer.book
        worksheet = writer.sheets[report_name[:31]]
        
        # Apply basic formatting
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width
    
    excel_file.name = f"{report_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    excel_file.seek(0)
    
    return excel_file


def get_report_template_path(report_type):
    """
    Get the HTML template path for a specific report type.
    This allows custom templates per report type while maintaining consistency.
    """
    template_mapping = {
        'Executive Summary': 'reports/executive_summary.html',
        'Weekly Stock Report': 'reports/weekly_stock.html',
        'Lead Pipeline Report': 'reports/lead_pipeline.html',
        # Add more mappings as needed
    }
    
    return template_mapping.get(report_type, 'reports/default_report.html')
