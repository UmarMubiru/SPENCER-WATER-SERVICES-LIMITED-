"""
Notification utilities for sending emails and WhatsApp messages
"""
import os
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_email_notification(
    subject,
    message,
    recipient_email,
    html_message=None,
    from_email=None
):
    """
    Send email notification
    """
    if not from_email:
        from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@spencerwaterservices.com'

    try:
        if html_message:
            send_mail(
                subject,
                strip_tags(html_message),
                from_email,
                [recipient_email],
                html_message=html_message,
                fail_silently=False
            )
        else:
            send_mail(
                subject,
                message,
                from_email,
                [recipient_email],
                fail_silently=False
            )
        return True
    except Exception as e:
        print(f"Error sending email to {recipient_email}: {e}")
        return False


def send_lead_confirmation_email(lead):
    """
    Send confirmation email when a lead is created
    """
    subject = f'Lead Confirmation: {lead.lead_number}'
    
    html_message = f"""
    <html>
    <body>
        <h2>Thank You for Your Inquiry</h2>
        <p>Dear {lead.customer_name},</p>
        <p>We have received your inquiry and your lead number is: <strong>{lead.lead_number}</strong></p>
        <p><strong>Service Requested:</strong> {lead.service.replace('_', ' ').title()}</p>
        <p><strong>Location:</strong> {lead.district}, {lead.subcounty}</p>
        <p>Our team will review your requirements and contact you within 24 hours.</p>
        <p>You can track your request status at: <a href="http://yourdomain.com/track-lead?lead={lead.lead_number}">Track Your Request</a></p>
        <p>Best regards,<br>Spencer Water Services Team</p>
    </body>
    </html>
    """
    
    return send_email_notification(
        subject=subject,
        message=strip_tags(html_message),
        recipient_email=lead.email,
        html_message=html_message
    )


def send_quotation_ready_email(quotation):
    """
    Send email notification when quotation is ready
    """
    lead = quotation.lead
    subject = f'Quotation Ready: {quotation.quotation_number}'
    
    html_message = f"""
    <html>
    <body>
        <h2>Your Quotation is Ready</h2>
        <p>Dear {lead.customer_name},</p>
        <p>We are pleased to inform you that your quotation is ready for review.</p>
        <p><strong>Quotation Number:</strong> {quotation.quotation_number}</p>
        <p><strong>Lead Number:</strong> {lead.lead_number}</p>
        <p><strong>Total Amount:</strong> UGX {quotation.grand_total:,.2f}</p>
        <p><strong>Valid Until:</strong> {quotation.valid_until.strftime('%B %d, %Y') if quotation.valid_until else 'TBD'}</p>
        <p>Please review your quotation at: <a href="http://yourdomain.com/track-quotation?quotation={quotation.quotation_number}">View Quotation</a></p>
        <p>Best regards,<br>Spencer Water Services Team</p>
    </body>
    </html>
    """
    
    return send_email_notification(
        subject=subject,
        message=strip_tags(html_message),
        recipient_email=lead.email,
        html_message=html_message
    )


def send_quotation_accepted_email(quotation):
    """
    Send email notification when quotation is accepted
    """
    lead = quotation.lead
    subject = f'Quotation Accepted: {quotation.quotation_number}'
    
    html_message = f"""
    <html>
    <body>
        <h2>Quotation Accepted</h2>
        <p>Dear {lead.customer_name},</p>
        <p>Thank you for accepting our quotation {quotation.quotation_number}.</p>
        <p><strong>Project Reference:</strong> {quotation.project.project_reference if hasattr(quotation, 'project') and quotation.project else 'Pending'}</p>
        <p>Our team will contact you shortly to discuss the next steps and project timeline.</p>
        <p>Best regards,<br>Spencer Water Services Team</p>
    </body>
    </html>
    """
    
    return send_email_notification(
        subject=subject,
        message=strip_tags(html_message),
        recipient_email=lead.email,
        html_message=html_message
    )


def send_project_approved_email(project):
    """
    Send email notification when project is approved
    """
    subject = f'Project Approved: {project.project_reference}'
    
    html_message = f"""
    <html>
    <body>
        <h2>Project Approved</h2>
        <p>Dear {project.name.split('-')[0].strip() if '-' in project.name else 'Customer'},</p>
        <p>We are pleased to inform you that your project has been approved and work will begin soon.</p>
        <p><strong>Project Reference:</strong> {project.project_reference}</p>
        <p><strong>Service Line:</strong> {project.service_line.replace('_', ' ').title()}</p>
        <p>Our project team will contact you with the detailed schedule and kickoff meeting.</p>
        <p>Best regards,<br>Spencer Water Services Team</p>
    </body>
    </html>
    """
    
    # Get customer email from lead if available
    customer_email = None
    if hasattr(project, 'quotation') and project.quotation:
        customer_email = project.quotation.lead.email
    
    if customer_email:
        return send_email_notification(
            subject=subject,
            message=strip_tags(html_message),
            recipient_email=customer_email,
            html_message=html_message
        )
    return False


def send_whatsapp_notification(phone_number, message):
    """
    Send WhatsApp notification using an API (e.g., Twilio, MessageBird, etc.)
    This is a placeholder - you'll need to integrate with your preferred WhatsApp API
    """
    # Placeholder for WhatsApp integration
    # Example using Twilio (requires twilio package and configuration):
    # from twilio.rest import Client
    # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    # message = client.messages.create(
    #     body=message,
    #     from_=f'whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}',
    #     to=f'whatsapp:{phone_number}'
    # )
    print(f"WhatsApp notification to {phone_number}: {message}")
    return True


def send_lead_confirmation_whatsapp(lead):
    """
    Send WhatsApp confirmation when a lead is created
    """
    message = f"""Thank you for your inquiry with Spencer Water Services!
    
Your Lead Number: {lead.lead_number}
Service: {lead.service.replace('_', ' ').title()}
Location: {lead.district}, {lead.subcounty}

Track your request: http://yourdomain.com/track-lead?lead={lead.lead_number}

We'll contact you within 24 hours."""
    
    # Format phone number for WhatsApp (remove spaces, dashes, etc.)
    whatsapp_number = lead.phone.replace(' ', '').replace('-', '').replace('+', '')
    if not whatsapp_number.startswith('256'):
        whatsapp_number = '256' + whatsapp_number.lstrip('0')
    
    return send_whatsapp_notification(whatsapp_number, message)


def send_quotation_ready_whatsapp(quotation):
    """
    Send WhatsApp notification when quotation is ready
    """
    lead = quotation.lead
    message = f"""Your quotation is ready for review!
    
Quotation Number: {quotation.quotation_number}
Total Amount: UGX {quotation.grand_total:,.2f}
Valid Until: {quotation.valid_until.strftime('%B %d, %Y') if quotation.valid_until else 'TBD'}

View quotation: http://yourdomain.com/track-quotation?quotation={quotation.quotation_number}

Spencer Water Services"""
    
    whatsapp_number = lead.phone.replace(' ', '').replace('-', '').replace('+', '')
    if not whatsapp_number.startswith('256'):
        whatsapp_number = '256' + whatsapp_number.lstrip('0')
    
    return send_whatsapp_notification(whatsapp_number, message)


def send_quotation_accepted_whatsapp(quotation):
    """
    Send WhatsApp notification when quotation is accepted
    """
    lead = quotation.lead
    message = f"""Thank you for accepting our quotation!
    
Quotation Number: {quotation.quotation_number}
Project Reference: {quotation.project.project_reference if hasattr(quotation, 'project') and quotation.project else 'Pending'}

Our team will contact you shortly with next steps.

Spencer Water Services"""
    
    whatsapp_number = lead.phone.replace(' ', '').replace('-', '').replace('+', '')
    if not whatsapp_number.startswith('256'):
        whatsapp_number = '256' + whatsapp_number.lstrip('0')
    
    return send_whatsapp_notification(whatsapp_number, message)
