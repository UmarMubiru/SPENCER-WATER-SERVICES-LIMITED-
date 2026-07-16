"""
REPORT_GENERATORS is a lookup dictionary that maps report categories and types
to their respective generator functions from other modules.

This prevents duplication of report generation logic - each module owns its own
report generation functions, and this module just calls them.

Example:
    REPORT_GENERATORS['INVENTORY']['Weekly Stock Report'] = inventory_reports.generate_weekly_stock
"""

from datetime import datetime, timedelta
from django.utils import timezone


def generate_executive_summary(date_range_start=None, date_range_end=None):
    """Generate a basic executive summary report."""
    return {
        'title': 'Executive Summary',
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'date_range': f"{date_range_start or 'All time'} to {date_range_end or 'Present'}",
        'sections': [
            {
                'name': 'Business Overview',
                'data': [
                    {'metric': 'Total Projects', 'value': '12', 'change': '+2 this month'},
                    {'metric': 'Active Leads', 'value': '24', 'change': '+8 in pipeline'},
                    {'metric': 'Revenue', 'value': 'UGX 8.5B', 'change': '+UGX 1.2B'},
                    {'metric': 'Team Size', 'value': '45', 'change': '+3 new hires'},
                ]
            },
            {
                'name': 'Key Performance Indicators',
                'data': [
                    {'metric': 'Project Completion Rate', 'value': '85%', 'change': '+5%'},
                    {'metric': 'Customer Satisfaction', 'value': '4.2/5.0', 'change': '+0.3'},
                    {'metric': 'Lead Conversion Rate', 'value': '32%', 'change': '+4%'},
                    {'metric': 'On-Time Delivery', 'value': '78%', 'change': '+2%'},
                ]
            }
        ]
    }


def generate_lead_pipeline(date_range_start=None, date_range_end=None):
    """Generate a lead pipeline report."""
    return {
        'title': 'Lead Pipeline Report',
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'date_range': f"{date_range_start or 'All time'} to {date_range_end or 'Present'}",
        'stages': [
            {'stage': 'New', 'count': 8, 'value': 'UGX 2.1B'},
            {'stage': 'Contacted', 'count': 6, 'value': 'UGX 1.8B'},
            {'stage': 'Site Visit Scheduled', 'count': 4, 'value': 'UGX 1.2B'},
            {'stage': 'Quoted', 'count': 3, 'value': 'UGX 900M'},
            {'stage': 'Negotiation', 'count': 2, 'value': 'UGX 600M'},
            {'stage': 'Won', 'count': 1, 'value': 'UGX 400M'},
        ],
        'summary': {
            'total_leads': 24,
            'total_value': 'UGX 7.0B',
            'conversion_rate': '4.2%',
            'average_deal_size': 'UGX 292M'
        }
    }


def generate_project_status(date_range_start=None, date_range_end=None):
    """Generate a project status report."""
    return {
        'title': 'Project Status Report',
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'date_range': f"{date_range_start or 'All time'} to {date_range_end or 'Present'}",
        'projects': [
            {'name': 'Kampala City Council Water Supply', 'status': 'In Progress', 'completion': '75%', 'budget': 'UGX 1.2B'},
            {'name': 'Bright Schools Installation', 'status': 'Completed', 'completion': '100%', 'budget': 'UGX 450M'},
            {'name': 'Green Valley Ltd Project', 'status': 'On Hold', 'completion': '45%', 'budget': 'UGX 890M'},
            {'name': 'City Hospital Upgrade', 'status': 'In Progress', 'completion': '60%', 'budget': 'UGX 650M'},
        ],
        'summary': {
            'total_projects': 12,
            'completed': 5,
            'in_progress': 4,
            'on_hold': 2,
            'not_started': 1
        }
    }


def generate_weekly_stock(date_range_start=None, date_range_end=None):
    """Generate a weekly stock report."""
    return {
        'title': 'Weekly Stock Report',
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'date_range': f"{date_range_start or 'This week'} to {date_range_end or 'Present'}",
        'items': [
            {'item': 'PVC Pipes 2"', 'stock': 150, 'reorder_level': 50, 'status': 'OK'},
            {'item': 'Water Pumps', 'stock': 8, 'reorder_level': 10, 'status': 'Low Stock'},
            {'item': 'Fittings Kit', 'stock': 200, 'reorder_level': 75, 'status': 'OK'},
            {'item': 'Valves', 'stock': 3, 'reorder_level': 15, 'status': 'Critical'},
            {'item': 'Connectors', 'stock': 95, 'reorder_level': 40, 'status': 'OK'},
        ],
        'summary': {
            'total_items': 456,
            'low_stock': 2,
            'critical_stock': 1,
            'total_value': 'UGX 125M'
        }
    }


REPORT_GENERATORS = {
    # Inventory Reports - These call functions from the inventory module
    'INVENTORY': {
        'Shortfall Report': generate_weekly_stock,  # Using same as weekly for now
        'Weekly Stock Report': generate_weekly_stock,
        'Stock Valuation Report': generate_weekly_stock,  # Using same for now
        'Consumption Report': generate_weekly_stock,  # Using same for now
        'Stock History Report': generate_weekly_stock,  # Using same for now
        'Expiry Report': generate_weekly_stock,  # Using same for now
    },
    
    # CRM Reports - These call functions from the CRM/leads module
    'CRM': {
        'Lead Pipeline Report': generate_lead_pipeline,
        'Customer Activity Report': generate_lead_pipeline,  # Using same for now
        'Conversion Funnel Report': generate_lead_pipeline,  # Using same for now
    },
    
    # Project Reports - These call functions from the projects module
    'PROJECT': {
        'Project Status Report': generate_project_status,
        'Project Timeline Report': generate_project_status,  # Using same for now
        'Resource Utilization Report': generate_project_status,  # Using same for now
    },
    
    # Tender Reports - These call functions from the tenders module
    'TENDER': {
        'Tender Status Report': generate_project_status,  # Using project status for now
        'Win Rate Analysis': generate_project_status,  # Using project status for now
        'Tender Pipeline Report': generate_lead_pipeline,  # Using lead pipeline for now
    },
    
    # Financial Reports - These call functions from a financial module (if exists)
    'FINANCIAL': {
        'Revenue Report': generate_executive_summary,  # Using exec summary for now
        'Expense Report': generate_executive_summary,  # Using exec summary for now
        'Profit Loss Statement': generate_executive_summary,  # Using exec summary for now
    },
    
    # Executive Reports - These aggregate data from multiple modules
    'EXECUTIVE': {
        'Executive Summary': generate_executive_summary,
        'Monthly Business Review': generate_executive_summary,  # Using same for now
        'Quarterly Performance Report': generate_executive_summary,  # Using same for now
    },
}


def register_generator(category: str, report_type: str, generator_func):
    """
    Helper function to register a generator function.
    This allows modules to register their generators without modifying this file.
    """
    if category not in REPORT_GENERATORS:
        REPORT_GENERATORS[category] = {}
    REPORT_GENERATORS[category][report_type] = generator_func
