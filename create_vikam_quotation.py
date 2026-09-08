import requests
import json

url = 'http://127.0.0.1:8000/api/quotations/quotations/'
items_url = 'http://127.0.0.1:8000/api/quotations/quotation-items/'

data = {
    "customer_name_snapshot": "Vikam Ltd",
    "company_snapshot": "Vikam Ltd",
    "email_snapshot": "info@vikam.com",
    "phone_snapshot": "+256700000000",
    "address_snapshot": "Kampala, Uganda",
    "header": "QUOTATION",
    "terms": "This quotation is valid for 30 days from the date of issue. All prices are in UGX.",
    "payment_terms": "50% advance payment, balance upon completion.",
    "footer": "Thank you for your business!",
    "valid_until": "2026-10-01",
    "lead": None,
    "template": None,
}

items = [
    {"description": "Taps", "unit": "each", "quantity": 4, "rate": 25000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "connectors", "unit": "each", "quantity": 4, "rate": 10000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "Tank connector", "unit": "each", "quantity": 1, "rate": 10000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "Gate valve", "unit": "each", "quantity": 1, "rate": 30000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "Male adaptor", "unit": "each", "quantity": 2, "rate": 10000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "Reducing tee 32*20", "unit": "each", "quantity": 1, "rate": 15000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "Reducing connector", "unit": "each", "quantity": 1, "rate": 12000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "elbows", "unit": "each", "quantity": 1, "rate": 10000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "thread tape", "unit": "each", "quantity": 3, "rate": 3000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "fm elbow", "unit": "each", "quantity": 4, "rate": 10000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False},
    {"description": "professional labour and transport", "unit": "set", "quantity": 1, "rate": 205000, "vat_percentage": 18, "discount_percentage": 0, "is_optional": False}
]

# Create quotation first
response = requests.post(url, json=data)
print(f"Status: {response.status_code}")

if response.status_code == 201:
    quotation_data = response.json()
    quotation_id = quotation_data['id']
    print(f"\nQuotation created successfully!")
    print(f"Quotation ID: {quotation_id}")
    print(f"Quotation Number: {quotation_data['quotation_number']}")
    
    # Create each item
    for item in items:
        item['quotation'] = quotation_id
        item_response = requests.post(items_url, json=item)
        if item_response.status_code == 201:
            print(f"Item created: {item['description']}")
        else:
            print(f"Failed to create item: {item['description']}")
            print(f"Error: {item_response.text}")
    
    # Calculate totals
    calculate_url = f"{url}{quotation_id}/calculate_totals/"
    calc_response = requests.post(calculate_url)
    if calc_response.status_code == 200:
        print("\nTotals calculated successfully!")
        
        # Fetch updated quotation
        get_response = requests.get(f"{url}{quotation_id}/")
        if get_response.status_code == 200:
            updated_data = get_response.json()
            print(f"\nFinal Quotation Details:")
            print(f"Quotation Number: {updated_data['quotation_number']}")
            print(f"Subtotal: UGX {updated_data['subtotal']}")
            print(f"VAT Total: UGX {updated_data['vat_total']}")
            print(f"Discount Total: UGX {updated_data['discount_total']}")
            print(f"Grand Total: UGX {updated_data['grand_total']}")
else:
    print(f"Failed to create quotation: {response.text}")
