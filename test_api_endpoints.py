"""
Test script to verify all API endpoints are working
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(endpoint, description):
    """Test a single endpoint"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        status = "✓ PASS" if response.status_code in [200, 401, 403] else "✗ FAIL"
        print(f"{status} - {description} ({endpoint}) - Status: {response.status_code}")
        return response.status_code
    except Exception as e:
        print(f"✗ FAIL - {description} ({endpoint}) - Error: {str(e)}")
        return None

def main():
    print("=" * 80)
    print("SWS PLATFORM - API ENDPOINT VERIFICATION")
    print("=" * 80)
    print()
    
    # Test Quotation Module
    print("QUOTATION MODULE")
    print("-" * 80)
    test_endpoint("/quotations/customers/", "Customers List")
    test_endpoint("/quotations/leads/", "Leads List")
    test_endpoint("/quotations/lead-activities/", "Lead Activities List")
    test_endpoint("/quotations/tasks/", "Tasks List")
    test_endpoint("/quotations/notifications/", "Notifications List")
    test_endpoint("/quotations/site-visits/", "Site Visits List")
    test_endpoint("/quotations/public/leads/", "Public Leads")
    test_endpoint("/quotations/quotation-templates/", "Quotation Templates")
    test_endpoint("/quotations/quotation-template-items/", "Quotation Template Items")
    test_endpoint("/quotations/quotations/", "Quotations List")
    test_endpoint("/quotations/quotation-items/", "Quotation Items List")
    print()
    
    # Test Inventory Module
    print("INVENTORY MODULE")
    print("-" * 80)
    test_endpoint("/inventory/categories/", "Categories List")
    test_endpoint("/inventory/items/", "Inventory Items List")
    test_endpoint("/inventory/material-requests/", "Material Requests List")
    test_endpoint("/inventory/stock-movements/", "Stock Movements List")
    test_endpoint("/inventory/suppliers/", "Suppliers List")
    test_endpoint("/inventory/supplier-quotations/", "Supplier Quotations List")
    test_endpoint("/inventory/purchase-orders/", "Purchase Orders List")
    print()
    
    # Test Projects Module
    print("PROJECTS MODULE")
    print("-" * 80)
    test_endpoint("/projects/", "Projects List")
    print()
    
    # Test Employees Module
    print("EMPLOYEES MODULE")
    print("-" * 80)
    test_endpoint("/employees/employees/", "Employees List")
    test_endpoint("/employees/departments/", "Departments List")
    test_endpoint("/employees/job-titles/", "Job Titles List")
    test_endpoint("/employees/employment-types/", "Employment Types List")
    test_endpoint("/employees/skills/", "Skills List")
    print()
    
    # Test Finance Module
    print("FINANCE MODULE")
    print("-" * 80)
    test_endpoint("/finance/invoices/", "Invoices List")
    test_endpoint("/finance/invoice-items/", "Invoice Items List")
    test_endpoint("/finance/payments/", "Payments List")
    print()
    
    # Test Analytics Module
    print("ANALYTICS MODULE")
    print("-" * 80)
    test_endpoint("/analytics/dashboard-metrics/", "Dashboard Metrics List")
    test_endpoint("/analytics/sales-funnel/", "Sales Funnel Metrics List")
    test_endpoint("/analytics/sales-pipeline/", "Sales Pipeline Metrics List")
    test_endpoint("/analytics/revenue/", "Revenue Metrics List")
    test_endpoint("/analytics/projects/", "Project Metrics List")
    test_endpoint("/analytics/inventory/", "Inventory Metrics List")
    print()
    
    # Test Reports Module
    print("REPORTS MODULE")
    print("-" * 80)
    test_endpoint("/reports/activity/", "System Activities List")
    print()
    
    # Test Users Module
    print("USERS MODULE")
    print("-" * 80)
    test_endpoint("/users/users/", "Users List")
    test_endpoint("/roles/roles/", "Roles List")
    print()
    
    # Test Content Module
    print("CONTENT MODULE")
    print("-" * 80)
    test_endpoint("/content/blog/", "Blog Posts List")
    test_endpoint("/content/testimonials/", "Testimonials List")
    test_endpoint("/content/services/", "Services List")
    test_endpoint("/content/core-pages/", "Core Pages List")
    test_endpoint("/content/version-history/", "Version History List")
    print()
    
    # Test Notifications Module
    print("NOTIFICATIONS MODULE")
    print("-" * 80)
    test_endpoint("/notifications/notifications/", "Notifications List")
    print()
    
    print("=" * 80)
    print("API ENDPOINT VERIFICATION COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()
