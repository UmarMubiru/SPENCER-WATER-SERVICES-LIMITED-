"""
Test complete workflow from lead to project
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_workflow():
    print("=" * 80)
    print("COMPLETE WORKFLOW TEST: Lead → Site Visit → Quotation → Project")
    print("=" * 80)
    print()
    
    # Step 1: Create a lead
    print("Step 1: Creating a lead...")
    lead_data = {
        "customer_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+256700123456",
        "company": "Example Company Ltd",
        "service": "borehole_drilling",
        "description": "Need borehole drilling for 2-acre property",
        "source": "website",
        "budget_range": "10_50m",
        "timeline": "3_months",
        "district": "Kampala",
        "address": "Kampala, Uganda"
    }
    
    response = requests.post(f"{BASE_URL}/quotations/public/leads/", json=lead_data)
    if response.status_code in [200, 201]:
        lead = response.json()
        print(f"Response: {lead}")
        lead_id = lead.get('id')
        if lead_id:
            print(f"✓ Lead created successfully: {lead_id}")
        else:
            print(f"✗ Lead response missing id field")
            return False
    else:
        print(f"✗ Failed to create lead: {response.status_code} - {response.text}")
        return False
    
    print()
    
    # Step 2: Create a site visit
    print("Step 2: Creating a site visit...")
    site_visit_data = {
        "lead": lead_id,
        "scheduled_date": "2026-08-15",
        "scheduled_time": "10:00:00",
        "location": "Kampala, Uganda",
        "notes": "Initial site assessment for borehole drilling",
        "status": "scheduled"
    }
    
    response = requests.post(f"{BASE_URL}/quotations/site-visits/", json=site_visit_data)
    if response.status_code in [200, 201]:
        site_visit = response.json()
        print(f"✓ Site visit created successfully: {site_visit['id']}")
        site_visit_id = site_visit['id']
    else:
        print(f"✗ Failed to create site visit: {response.status_code} - {response.text}")
        return False
    
    print()
    
    # Step 3: Complete the site visit
    print("Step 3: Completing the site visit...")
    response = requests.post(f"{BASE_URL}/quotations/site-visits/{site_visit_id}/complete/")
    if response.status_code == 200:
        print(f"✓ Site visit completed successfully")
    else:
        print(f"✗ Failed to complete site visit: {response.status_code} - {response.text}")
        return False
    
    print()
    
    # Step 4: Create a quotation
    print("Step 4: Creating a quotation...")
    quotation_data = {
        "lead": lead_id,
        "site_visit": site_visit_id,
        "quotation_number": f"QT-{time.strftime('%Y%m%d%H%M%S')}",
        "valid_until": "2026-09-15",
        "status": "draft",
        "subtotal": 8000000,
        "vat_amount": 1440000,
        "discount_amount": 0,
        "total_amount": 9440000,
        "notes": "Quotation for borehole drilling services",
        "terms": "Payment required within 30 days"
    }
    
    response = requests.post(f"{BASE_URL}/quotations/quotations/", json=quotation_data)
    if response.status_code in [200, 201]:
        quotation = response.json()
        print(f"✓ Quotation created successfully: {quotation['id']} - {quotation['quotation_number']}")
        quotation_id = quotation['id']
    else:
        print(f"✗ Failed to create quotation: {response.status_code} - {response.text}")
        return False
    
    print()
    
    # Step 5: Add quotation items
    print("Step 5: Adding quotation items...")
    items_data = [
        {
            "quotation": quotation_id,
            "description": "Borehole drilling (200m depth)",
            "unit": "meter",
            "quantity": 200,
            "rate": 35000,
            "vat_percentage": 18,
            "discount_percentage": 0,
            "is_optional": False,
            "sort_order": 1
        },
        {
            "quotation": quotation_id,
            "description": "Pump installation (submersible pump)",
            "unit": "each",
            "quantity": 1,
            "rate": 1000000,
            "vat_percentage": 18,
            "discount_percentage": 0,
            "is_optional": False,
            "sort_order": 2
        }
    ]
    
    for item in items_data:
        response = requests.post(f"{BASE_URL}/quotations/quotation-items/", json=item)
        if response.status_code in [200, 201]:
            print(f"✓ Quotation item added: {item['description']}")
        else:
            print(f"✗ Failed to add quotation item: {response.status_code} - {response.text}")
    
    print()
    
    # Step 6: Send quotation
    print("Step 6: Sending quotation...")
    response = requests.post(f"{BASE_URL}/quotations/quotations/{quotation_id}/send/")
    if response.status_code == 200:
        print(f"✓ Quotation sent successfully")
    else:
        print(f"✗ Failed to send quotation: {response.status_code} - {response.text}")
        return False
    
    print()
    
    # Step 7: Accept quotation
    print("Step 7: Accepting quotation...")
    response = requests.post(f"{BASE_URL}/quotations/quotations/{quotation_id}/accept/")
    if response.status_code == 200:
        print(f"✓ Quotation accepted successfully")
    else:
        print(f"✗ Failed to accept quotation: {response.status_code} - {response.text}")
        return False
    
    print()
    
    # Step 8: Create project from quotation
    print("Step 8: Creating project from quotation...")
    response = requests.post(f"{BASE_URL}/quotations/quotations/{quotation_id}/create_project/")
    if response.status_code in [200, 201]:
        project = response.json()
        project_id = project.get('project_id')
        print(f"✓ Project created successfully: {project_id} - {project.get('project_reference')}")
    else:
        print(f"✗ Failed to create project: {response.status_code} - {response.text}")
        return False
    
    print()
    print("=" * 80)
    print("WORKFLOW TEST COMPLETED SUCCESSFULLY")
    print("=" * 80)
    print()
    print("Summary:")
    print(f"  Lead ID: {lead_id}")
    print(f"  Site Visit ID: {site_visit_id}")
    print(f"  Quotation ID: {quotation_id}")
    print(f"  Project ID: {project_id}")
    print()
    
    return True

if __name__ == "__main__":
    success = test_workflow()
    if not success:
        print("\nWorkflow test failed!")
        exit(1)
