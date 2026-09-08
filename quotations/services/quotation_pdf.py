from io import BytesIO
from decimal import Decimal, InvalidOperation
from datetime import date, timedelta
import html
import os

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    Flowable,
    Image,
)
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas as pdf_canvas
from django.conf import settings


# ============================================================
# SPENCER WATER SERVICES — PRODUCTION QUOTATION DESIGN
# ============================================================

NAVY = HexColor("#073B73")
DARK_NAVY = HexColor("#052A52")
BLUE = HexColor("#1686D9")
SKY = HexColor("#DFF1FC")
PALE_BLUE = HexColor("#F4FAFE")
BORDER = HexColor("#D8E5EF")
TEXT = HexColor("#26384B")
MUTED = HexColor("#718295")
WHITE = colors.white
GREEN = HexColor("#168A4A")

PAGE_W, PAGE_H = A4

LEFT = 12 * mm
RIGHT = 12 * mm
TOP = 12 * mm
BOTTOM = 28 * mm
CONTENT_W = PAGE_W - LEFT - RIGHT


# ============================================================
# LOGO
# ============================================================

def get_logo_path():
    """Find the company logo in various possible locations."""
    print(f"BASE_DIR: {settings.BASE_DIR}")
    print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
    candidates = [
        os.path.join(settings.BASE_DIR, "frontend", "public", "sws-logo-current.png"),
        os.path.join(settings.MEDIA_ROOT, "website_images", "sws-logo-current.png"),
        os.path.join(settings.MEDIA_ROOT, "website_images", "sws-logo-currentb.png"),
        os.path.join(settings.BASE_DIR, "static", "images", "sws-logo-current.png"),
        os.path.join(settings.BASE_DIR, "static", "images", "sws-logo-currentb.png"),
        os.path.join(settings.BASE_DIR, "staticfiles", "images", "sws-logo-current.png"),
        os.path.join(settings.BASE_DIR, "staticfiles", "images", "sws-logo-currentb.png"),
    ]
    
    for path in candidates:
        print(f"Checking path: {path}, exists: {os.path.exists(path)}")
        if os.path.exists(path):
            print(f"Found logo at: {path}")
            return path
    print("Logo not found in any location")
    return None


# ============================================================
# FONTS
# ============================================================

def _load_font():
    candidates = [
        os.path.join("static", "fonts", "Inter-Regular.ttf"),
        os.path.join("staticfiles", "fonts", "Inter-Regular.ttf"),
        os.path.join("static", "Inter-Regular.ttf"),
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont("SWS-Regular", path))
                return "SWS-Regular"
            except Exception:
                pass
    return "Helvetica"


def _load_bold_font():
    candidates = [
        os.path.join("static", "fonts", "Inter-Bold.ttf"),
        os.path.join("staticfiles", "fonts", "Inter-Bold.ttf"),
        os.path.join("static", "Inter-Bold.ttf"),
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont("SWS-Bold", path))
                return "SWS-Bold"
            except Exception:
                pass
    return "Helvetica-Bold"


FONT = _load_font()
FONT_BOLD = _load_bold_font()


# ============================================================
# DATA HELPERS
# ============================================================

MISSING = object()


def raw_value(obj, *names):
    """Return the first non-empty attribute from an object."""
    if obj is None:
        return None

    for name in names:
        try:
            value = getattr(obj, name, MISSING)
        except Exception:
            value = MISSING

        if value is MISSING or value is None:
            continue

        # Allow RelatedManager objects (they are callable but we need them)
        # Check if it's a Django RelatedManager by checking for 'all' method
        if callable(value) and not hasattr(value, 'all'):
            continue

        if isinstance(value, str):
            if value.strip():
                return value.strip()
        else:
            return value

    return None


def first_value(*values):
    """Return the first non-empty value."""
    for value in values:
        if value is None:
            continue
        if isinstance(value, str):
            value = value.strip()
            if value:
                return value
        else:
            return value
    return "—"


def text(value, default="—"):
    value = first_value(value)
    if value == "—":
        return default
    return html.escape(str(value))


def decimal(value, default=Decimal("0")):
    if value is None or value == "":
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


def money(value):
    value = decimal(value)
    return f"UGX {value:,.0f}"


def fmt_date(value, fallback=None):
    if value is None:
        return fallback or date.today().strftime("%d %b %Y")
    try:
        return value.strftime("%d %b %Y")
    except Exception:
        return str(value)


def get_lead(quotation):
    try:
        return getattr(quotation, "lead", None)
    except Exception:
        return None


# ============================================================
# CUSTOMER DATA
# ============================================================

def customer_data(quotation):
    lead = get_lead(quotation)

    name = first_value(
        raw_value(quotation, "customer_name_snapshot"),
        raw_value(lead, "customer_name"),
    )

    company = first_value(
        raw_value(quotation, "company_snapshot"),
        raw_value(lead, "company"),
    )

    phone = first_value(
        raw_value(quotation, "phone_snapshot"),
        raw_value(lead, "phone"),
    )

    email = first_value(
        raw_value(quotation, "email_snapshot"),
        raw_value(lead, "email"),
    )

    # The address snapshot should win if populated.
    address = raw_value(
        quotation,
        "address_snapshot",
    )

    if not address and lead:
        # Build address from lead location fields (matching views.py logic)
        if lead.village:
            parts = [lead.village]
            if lead.subcounty:
                parts.append(lead.subcounty)
            if lead.district:
                parts.append(lead.district)
            address = ", ".join(parts)
        elif lead.address:
            address = lead.address
        else:
            # Fallback to individual fields
            parts = []
            for field in ["district", "subcounty", "village"]:
                value = raw_value(lead, field)
                if value:
                    parts.append(str(value).strip())
            address = ", ".join(parts) if parts else None

    return {
        "name": name,
        "company": company,
        "phone": phone,
        "email": email,
        "address": first_value(address),
    }


# ============================================================
# QUOTATION META
# ============================================================

def quotation_meta(quotation):
    number = first_value(
        raw_value(
            quotation,
            "quotation_number",
            "reference",
            "quote_number",
            "number",
        ),
        "PREVIEW-000000",
    )

    created = raw_value(
        quotation,
        "date",
        "quotation_date",
        "created_at",
        "created",
    )

    valid_until = raw_value(
        quotation,
        "valid_until",
        "validity_date",
        "expiry_date",
        "expires_at",
    )

    if not valid_until:
        base = created.date() if hasattr(created, "date") else (
            created if isinstance(created, date) else date.today()
        )
        valid_until = base + timedelta(days=30)

    return {
        "number": str(number),
        "date": fmt_date(created),
        "valid_until": fmt_date(valid_until),
    }


# ============================================================
# QUOTATION ITEMS
# ============================================================

def queryset_items(manager):
    """Safely turn a related manager/queryset into a list."""
    if manager is None:
        return []

    try:
        qs = manager.all()
    except Exception:
        return []

    try:
        return list(qs.order_by("sort_order"))
    except Exception:
        try:
            return list(qs.order_by("id"))
        except Exception:
            try:
                return list(qs)
            except Exception:
                return []


def get_quotation_rows(quotation):
    """
    Supports the current quotation_services -> items structure,
    while also accepting direct quotation item relations.
    """
    rows = []

    services_manager = raw_value(
        quotation,
        "quotation_services",
        "services",
        "quote_services",
    )

    services = queryset_items(services_manager)

    if services:
        for service in services:
            item_manager = raw_value(
                service,
                "items",
                "quotation_items",
                "line_items",
            )
            nested_items = queryset_items(item_manager)

            if nested_items:
                for item in nested_items:
                    rows.append((service, item))
            else:
                # Some implementations store the price directly on the service.
                rows.append((service, service))

    if rows:
        return rows

    direct_manager = raw_value(
        quotation,
        "items",
        "quotation_items",
        "line_items",
    )

    return [(None, item) for item in queryset_items(direct_manager)]


def clean_service_name(value):
    if value is None:
        return None

    value = str(value).strip()
    if not value:
        return None

    # Only filter out the literal word "other" when it's a placeholder
    # Don't filter out legitimate service names like "Quotation Items"
    if value.lower() == "other":
        return None

    return value


def row_data(service, item):
    # Prefer an explicit description from the item
    item_description = raw_value(
        item,
        "description",
        "name",
        "title",
    )

    # Fall back to service name if item description is "other" or empty
    service_description = raw_value(
        service,
        "service_name_snapshot",
        "service_name",
        "name",
        "title",
    )

    description = (
        first_value(item_description)
        if item_description and item_description.lower() != "other"
        else first_value(service_description, "Service")
    )

    quantity = decimal(
        raw_value(item, "quantity", "qty"),
        Decimal("1"),
    )

    # Get unit and map to display name
    unit_raw = raw_value(item, "unit", "")
    unit_mapping = {
        'each': 'Pieces',
        'meter': 'Meters',
        'square_meter': 'Sq Meters',
        'cubic_meter': 'Cubic Meters',
        'hour': 'Hours',
        'day': 'Days',
        'kg': 'Kg',
        'ton': 'Tons',
        'liter': 'Liters',
        'set': 'Sets',
        'none': '',
    }
    unit_display = unit_mapping.get(unit_raw, unit_raw)

    rate = decimal(
        raw_value(
            item,
            "rate",
            "unit_price",
            "unit_cost",
            "price",
            "cost",
        ),
        Decimal("0"),
    )

    # Use computed line_total if available, otherwise calculate
    explicit_amount = decimal(
        raw_value(
            item,
            "line_total",
            "final_total",
            "amount",
            "total",
        ),
        None,
    )

    if explicit_amount is not None and explicit_amount != 0:
        amount = explicit_amount
    else:
        amount = quantity * rate

    return {
        "description": description,
        "quantity": quantity,
        "unit": unit_display,
        "rate": rate,
        "amount": amount,
    }


# ============================================================
# TOTALS
# ============================================================

def quotation_totals(quotation, rows, include_vat=None):
    """Calculate subtotal, VAT, and total for a quotation."""
    calculated_subtotal = sum(decimal(row["amount"]) for row in rows)

    stored_subtotal = raw_value(
        quotation,
        "subtotal",
        "sub_total",
        "net_total",
    )

    subtotal = (
        decimal(stored_subtotal)
        if stored_subtotal is not None
        else calculated_subtotal
    )

    # If include_vat is explicitly False, set VAT to 0
    if include_vat is False:
        vat = Decimal("0")
        vat_fraction = Decimal("0")
    else:
        stored_vat = raw_value(
            quotation,
            "vat_amount",
            "vat",
            "tax_amount",
        )

        vat_rate = decimal(
            raw_value(
                quotation,
                "vat_rate",
                "tax_rate",
            ),
            Decimal("18"),
        )

        # Support both 18 and 0.18.
        if vat_rate > 1:
            vat_fraction = vat_rate / Decimal("100")
        else:
            vat_fraction = vat_rate

        vat = (
            decimal(stored_vat)
            if stored_vat is not None
            else subtotal * vat_fraction
        )

    stored_total = raw_value(
        quotation,
        "total",
        "grand_total",
        "total_amount",
        "amount",
    )

    total = (
        decimal(stored_total)
        if stored_total is not None
        else subtotal + vat
    )

    return subtotal, vat, total, vat_fraction


# ============================================================
# WATER MARK / SIMPLE ICONS
# ============================================================

def draw_drop(c, x, y, size=7 * mm, fill=BLUE):
    c.saveState()
    c.setFillColor(fill)

    p = c.beginPath()
    p.moveTo(x, y + size)
    p.curveTo(
        x - size * 0.72, y + size * 0.20,
        x - size * 0.72, y - size * 0.35,
        x, y - size * 0.48,
    )
    p.curveTo(
        x + size * 0.72, y - size * 0.35,
        x + size * 0.72, y + size * 0.20,
        x, y + size,
    )
    c.drawPath(p, fill=1, stroke=0)

    c.setFillColor(WHITE)
    c.circle(
        x - size * 0.18,
        y + size * 0.18,
        size * 0.09,
        fill=1,
        stroke=0,
    )
    c.restoreState()


# ============================================================
# PAGE BACKGROUND / FOOTER
# ============================================================

def page_chrome(c, doc):
    c.saveState()

    # --------------------------------------------------------
    # Watermark logo (centered, reduced opacity)
    # --------------------------------------------------------
    logo_path = get_logo_path()
    if logo_path and os.path.exists(logo_path):
        try:
            c.saveState()
            print(f"Drawing watermark at: {logo_path}")
            # Set transparency to 8% (0.08 opacity)
            c.setFillAlpha(0.08)
            c.drawImage(
                ImageReader(logo_path),
                (PAGE_W - 160 * mm) / 2,
                (PAGE_H - 160 * mm) / 2,
                width=160 * mm,
                height=160 * mm,
                mask='auto',
                preserveAspectRatio=True,
            )
            c.restoreState()
        except Exception as e:
            print(f"Error drawing watermark: {e}")
            pass  # Silently fail if logo can't be loaded

    # Very subtle top water curves.
    c.setStrokeColor(SKY)
    c.setLineWidth(1.2)

    c.bezier(
        0,
        PAGE_H - 6 * mm,
        42 * mm,
        PAGE_H - 1 * mm,
        72 * mm,
        PAGE_H - 10 * mm,
        108 * mm,
        PAGE_H - 5 * mm,
    )

    c.bezier(
        105 * mm,
        PAGE_H - 5 * mm,
        145 * mm,
        PAGE_H - 12 * mm,
        178 * mm,
        PAGE_H - 1 * mm,
        PAGE_W,
        PAGE_H - 7 * mm,
    )

    # Footer navy band.
    footer_h = 18 * mm
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, footer_h, fill=1, stroke=0)

    # Blue wave over the footer.
    c.setFillColor(BLUE)
    p = c.beginPath()
    p.moveTo(0, footer_h)
    p.curveTo(
        35 * mm, footer_h + 4 * mm,
        65 * mm, footer_h - 3 * mm,
        102 * mm, footer_h + 1 * mm,
    )
    p.curveTo(
        140 * mm, footer_h + 5 * mm,
        175 * mm, footer_h - 3 * mm,
        PAGE_W, footer_h + 3 * mm,
    )
    p.lineTo(PAGE_W, footer_h)
    p.lineTo(0, footer_h)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # Footer contact information.
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 8.8)
    c.drawString(LEFT, 12 * mm, "SPENCER WATER SERVICES")

    c.setFont(FONT, 6.8)
    c.drawString(LEFT, 8.2 * mm, "Plot 34 Namayumba Town Center, Namayumba Town Council, Wakiso District, Uganda")
    c.drawString(LEFT, 4.2 * mm, "+256 785 257314")
    c.drawString(LEFT, 0.8 * mm, "info@spencerwater.co.ug")

    # Footer right block is deliberately constrained so it cannot clip.
    right_x = PAGE_W - RIGHT - 76 * mm
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 9.5)
    c.drawString(right_x, 11.3 * mm, "Thank you for your business!")

    c.setFont(FONT, 6.7)
    c.setFillColor(HexColor("#DCEAF5"))
    c.drawString(
        right_x,
        6.9 * mm,
        "Professional water solutions you can trust.",
    )

    # Page number.
    c.setFillColor(HexColor("#CFE0EC"))
    c.setFont(FONT, 6.5)
    c.drawRightString(
        PAGE_W - RIGHT,
        0.8 * mm,
        f"Page {doc.page}",
    )

    c.restoreState()


# ============================================================
# STYLES
# ============================================================

def make_styles():
    base = getSampleStyleSheet()

    return {
        "body": ParagraphStyle(
            "SWSBody",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9,
            leading=12.5,
            textColor=TEXT,
            spaceAfter=0,
        ),
        "small": ParagraphStyle(
            "SWSSmall",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=7.1,
            leading=9.2,
            textColor=MUTED,
        ),
        "small_dark": ParagraphStyle(
            "SWSSmallDark",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=7.2,
            leading=9.5,
            textColor=TEXT,
        ),
        "bold": ParagraphStyle(
            "SWSBold",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=8.2,
            leading=11.5,
            textColor=TEXT,
        ),
        "right": ParagraphStyle(
            "SWSRight",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8,
            leading=10,
            alignment=TA_RIGHT,
            textColor=TEXT,
        ),
        "right_bold": ParagraphStyle(
            "SWSRightBold",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=8.2,
            leading=10,
            alignment=TA_RIGHT,
            textColor=TEXT,
        ),
        "section": ParagraphStyle(
            "SWSSection",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=9.5,
            leading=11,
            textColor=NAVY,
        ),
    }


# ============================================================
# DESIGN COMPONENTS
# ============================================================

def section_heading(title, styles, mark=""):
    # 186 mm total width: compact icon + title + blue rule.
    title_para = Paragraph(
        f"<b>{html.escape(title.upper())}</b>",
        styles["section"],
    )

    mark_box = Table(
        [[Paragraph(
            f"<b>{html.escape(mark)}</b>",
            ParagraphStyle(
                "mark",
                fontName=FONT_BOLD,
                fontSize=7.5,
                leading=8,
                textColor=WHITE,
                alignment=TA_CENTER,
            ),
        )]],
        colWidths=[8 * mm],
        rowHeights=[7.5 * mm],
    )
    mark_box.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), NAVY),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    rule = Table(
        [[""]],
        colWidths=[CONTENT_W - 8 * mm - 43 * mm],
        rowHeights=[0.7 * mm],
    )
    rule.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BLUE),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    row = Table(
        [[mark_box, title_para, rule]],
        colWidths=[
        8 * mm,
        43 * mm,
        CONTENT_W - 51 * mm,
    ],
    )

    row.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    return row


def bill_to_card(customer, styles):
    body = (
        f"<font size='10'><b>{text(customer['name'])}</b></font><br/>"
        f"<font color='#718295'>{text(customer['company'])}</font><br/>"
        f"<font color='#1686D9'><b>⌖</b></font>&nbsp; {text(customer['address'])}<br/>"
        f"<font color='#1686D9'><b>☎</b></font>&nbsp; {text(customer['phone'])}<br/>"
        f"<font color='#1686D9'><b>✉</b></font>&nbsp; {text(customer['email'])}"
    )

    table = Table(
        [
            [
                Paragraph(
                    "BILL TO",
                    ParagraphStyle(
                        "bill_title",
                        fontName=FONT_BOLD,
                        fontSize=8,
                        leading=9,
                        textColor=WHITE,
                    ),
                )
            ],
            [Paragraph(body, styles["body"])],
        ],
        colWidths=[88 * mm],
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), NAVY),
            ("BACKGROUND", (0, 1), (0, 1), WHITE),
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 4.5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4.5 * mm),
            ("TOPPADDING", (0, 0), (0, 0), 2.5 * mm),
            ("BOTTOMPADDING", (0, 0), (0, 0), 2.5 * mm),
            ("TOPPADDING", (0, 1), (0, 1), 3.5 * mm),
            ("BOTTOMPADDING", (0, 1), (0, 1), 3.5 * mm),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    return table


class WaterDrop(Flowable):
    """Small vector water-drop illustration used inside the quotation card."""

    def __init__(self, width=22 * mm, height=28 * mm):
        Flowable.__init__(self)
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        cx = self.width / 2
        cy = self.height / 2

        c.saveState()

        # Soft circular halo.
        c.setFillColor(SKY)
        c.circle(cx, cy, 10 * mm, fill=1, stroke=0)

        # Water drop.
        c.setFillColor(BLUE)
        p = c.beginPath()
        p.moveTo(cx, cy + 8.5 * mm)
        p.curveTo(
            cx - 5.5 * mm, cy + 2 * mm,
            cx - 6.5 * mm, cy - 2 * mm,
            cx - 4 * mm, cy - 5 * mm,
        )
        p.curveTo(
            cx - 2 * mm, cy - 8 * mm,
            cx + 2 * mm, cy - 8 * mm,
            cx + 4 * mm, cy - 5 * mm,
        )
        p.curveTo(
            cx + 6.5 * mm, cy - 2 * mm,
            cx + 5.5 * mm, cy + 2 * mm,
            cx, cy + 8.5 * mm,
        )
        c.drawPath(p, fill=1, stroke=0)

        # Highlight.
        c.setFillColor(WHITE)
        c.circle(cx - 2 * mm, cy + 2 * mm, 1.2 * mm, fill=1, stroke=0)

        c.restoreState()


def intro_card(styles):
    quote = Paragraph(
        "<font size='18' color='#1686D9'><b>“</b></font>",
        ParagraphStyle(
            "quote",
            fontName=FONT_BOLD,
            fontSize=17,
            leading=12,
            textColor=BLUE,
        ),
    )

    message = Paragraph(
        "Thank you for considering <b>Spencer Water Services</b>.<br/>"
        "We are pleased to provide you with the following quotation "
        "for your requirements.<br/><br/>"
        "<font color='#073B73'><b>We look forward to working with you!</b></font>",
        ParagraphStyle(
            "intro_body",
            parent=styles["body"],
            fontSize=7.8,
            leading=10.8,
        ),
    )

    content = Table(
        [
            [quote, WaterDrop()],
            [message, ""],
        ],
        colWidths=[68 * mm, 20 * mm],
    )

    content.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    table = Table(
        [[content]],
        colWidths=[98 * mm],
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
            ("BOX", (0, 0), (-1, -1), 0.75, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    return table


# ============================================================
# PDF GENERATOR
# ============================================================

def generate_quotation_pdf(quotation, include_vat=None):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=LEFT,
        rightMargin=RIGHT,
        topMargin=TOP,
        bottomMargin=BOTTOM,
        title=f"Quotation {first_value(raw_value(quotation, 'quotation_number', 'reference'), 'Quotation')}",
        author="Spencer Water Services",
        subject="Quotation",
    )

    styles = make_styles()
    story = []

    customer = customer_data(quotation)
    meta = quotation_meta(quotation)

    rows = [
        row_data(service, item)
        for service, item in get_quotation_rows(quotation)
    ]

    # If the database has no line items, keep a clean placeholder
    # rather than inventing a price.
    if not rows:
        rows = [{
            "description": "No quotation items recorded",
            "quantity": Decimal("0"),
            "rate": Decimal("0"),
            "amount": Decimal("0"),
        }]

    subtotal, vat, total, vat_fraction = quotation_totals(
        quotation,
        rows,
        include_vat=include_vat,
    )

    # --------------------------------------------------------
    # HEADER
    # --------------------------------------------------------

    # Logo in header
    logo_path = get_logo_path()
    logo_element = None
    if logo_path and os.path.exists(logo_path):
        try:
            print(f"Creating header logo from: {logo_path}")
            logo_element = Image(logo_path, width=40 * mm, height=40 * mm, hAlign='LEFT')
            print(f"Header logo created successfully")
        except Exception as e:
            print(f"Error creating header logo: {e}")
            logo_element = None

    # Company name next to logo
    company_name = Paragraph(
        "<font size='18'><b>SPENCER WATER SERVICES</b></font><br/>"
        "<font size='7' color='#718295'>Professional Water Solutions</font>",
        ParagraphStyle(
            "company",
            fontName=FONT_BOLD,
            fontSize=10,
            leading=14,
            textColor=NAVY,
        ),
    )

    # Metadata sits directly beneath the QUOTATION title
    meta_rows = [
        ["REFERENCE NO.", meta["number"]],
        ["DATE", meta["date"]],
        ["VALID UNTIL", meta["valid_until"]],
    ]

    meta_table_data = []
    for label, value in meta_rows:
        meta_table_data.append([
            Paragraph(
                f"<font color='#718295'><b>{label}</b></font>",
                styles["small"],
            ),
            Paragraph(
                html.escape(str(value)),
                styles["right"],
            ),
        ])

    meta_table = Table(
        meta_table_data,
        colWidths=[35 * mm, 41 * mm],
    )
    meta_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 1.0 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1.0 * mm),
            ("LINEBELOW", (0, 0), (-1, -2), 0.35, BORDER),
        ])
    )

    right_header = Table(
        [
            [
                Paragraph(
                    "<font size='24'><b>QUOTATION</b></font>",
                    ParagraphStyle(
                        "qtitle",
                        fontName=FONT_BOLD,
                        fontSize=24,
                        leading=26,
                        textColor=NAVY,
                        alignment=TA_RIGHT,
                    ),
                )
            ],
            [meta_table],
        ],
        colWidths=[76 * mm],
    )
    right_header.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    if logo_element:
        brand = Table(
            [[
                logo_element,
                company_name,
                right_header,
            ]],
            colWidths=[35 * mm, 75 * mm, 76 * mm],
        )
    else:
        brand = Table(
            [[
                company_name,
                right_header,
            ]],
            colWidths=[110 * mm, 76 * mm],
        )

    brand.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
        ])
    )

    story.append(brand)

    # Blue accent bar.
    accent = Table(
        [["", ""]],
        colWidths=[CONTENT_W - 30 * mm, 30 * mm],
        rowHeights=[1.3 * mm],
    )
    accent.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), SKY),
            ("BACKGROUND", (1, 0), (1, 0), BLUE),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )
    story.append(accent)
    story.append(Spacer(1, 2.5 * mm))

    # --------------------------------------------------------
    # CUSTOMER + INTRODUCTION
    # --------------------------------------------------------

    customer = customer_data(quotation)

    info_row = Table(
        [[
            bill_to_card(customer, styles),
            intro_card(styles),
        ]],
        colWidths=[88 * mm, 98 * mm],
    )

    info_row.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    story.append(info_row)
    story.append(Spacer(1, 3.5 * mm))

    # --------------------------------------------------------
    # QUOTATION ITEMS
    # --------------------------------------------------------

    story.append(section_heading("Quotation Items", styles, "▣"))
    story.append(Spacer(1, 1.8 * mm))

    item_data = [[
        Paragraph("<font color='white'><b>#</b></font>", ParagraphStyle(
            "th1", fontName=FONT_BOLD, fontSize=7.5, leading=10, textColor=WHITE,
            alignment=TA_CENTER
        )),
        Paragraph("<font color='white'><b>DESCRIPTION</b></font>", ParagraphStyle(
            "th2", fontName=FONT_BOLD, fontSize=7.5, leading=10, textColor=WHITE
        )),
        Paragraph("<font color='white'><b>QTY</b></font>", ParagraphStyle(
            "th3", fontName=FONT_BOLD, fontSize=7.5, leading=10, textColor=WHITE,
            alignment=TA_CENTER
        )),
        Paragraph("<font color='white'><b>UNIT PRICE</b></font>", ParagraphStyle(
            "th4", fontName=FONT_BOLD, fontSize=7.5, leading=10, textColor=WHITE,
            alignment=TA_RIGHT
        )),
        Paragraph("<font color='white'><b>AMOUNT</b></font>", ParagraphStyle(
            "th5", fontName=FONT_BOLD, fontSize=7.5, leading=10, textColor=WHITE,
            alignment=TA_RIGHT
        )),
    ]]

    for index, row in enumerate(rows, start=1):
        # Format quantity without decimal places and append unit
        quantity_display = f"{int(row['quantity'])} {row.get('unit', '')}"
        
        item_data.append([
            Paragraph(
                str(index),
                ParagraphStyle(
                    "num",
                    fontName=FONT,
                    fontSize=8,
                    textColor=TEXT,
                    alignment=TA_CENTER,
                ),
            ),
            Paragraph(
                text(row["description"]),
                styles["body"],
            ),
            Paragraph(
                quantity_display,
                ParagraphStyle(
                    "qty",
                    fontName=FONT,
                    fontSize=8,
                    textColor=TEXT,
                    alignment=TA_CENTER,
                ),
            ),
            Paragraph(
                money(row["rate"]),
                styles["right"],
            ),
            Paragraph(
                money(row["amount"]),
                styles["right_bold"],
            ),
        ])

    items_table = Table(
        item_data,
        colWidths=[
            10 * mm,
            84 * mm,
            22 * mm,
            34 * mm,
            36 * mm,
        ],
        hAlign="LEFT",
    )

    items_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
                WHITE,
                PALE_BLUE,
            ]),

            ("LEFTPADDING", (0, 0), (-1, -1), 2.5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2.5 * mm),
            ("TOPPADDING", (0, 0), (-1, 0), 2.5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 2.5 * mm),
            ("TOPPADDING", (0, 1), (-1, -1), 2.5 * mm),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 2.5 * mm),
        ])
    )

    story.append(items_table)
    story.append(Spacer(1, 2.5 * mm))

    # --------------------------------------------------------
    # TOTALS
    # --------------------------------------------------------

    # Build totals rows based on include_vat
    totals_rows = [
        [
            Paragraph("Subtotal", styles["small_dark"]),
            Paragraph(money(subtotal), styles["right"]),
        ],
    ]
    
    # Only add VAT row if include_vat is True
    if include_vat is not False:
        totals_rows.append([
            Paragraph(
                f"VAT ({vat_fraction * Decimal('100'):,.0f}%)",
                styles["small_dark"],
            ),
            Paragraph(money(vat), styles["right"]),
        ])
    
    totals_rows.append([
        Paragraph(
            "<b>TOTAL</b>",
            ParagraphStyle(
                "total_label",
                fontName=FONT_BOLD,
                fontSize=10,
                textColor=WHITE,
            ),
        ),
        Paragraph(
            f"<b>{money(total)}</b>",
            ParagraphStyle(
                "total_value",
                fontName=FONT_BOLD,
                fontSize=10,
                leading=12,
                alignment=TA_RIGHT,
                textColor=WHITE,
            ),
        ),
    ])
    
    totals_table = Table(
        totals_rows,
        colWidths=[45 * mm, 50 * mm],
    )

    # Adjust table styles based on number of rows
    row_count = len(totals_rows)
    table_style = [
        ("BOX", (0, 0), (-1, -1), 0.65, BORDER),
        ("LINEBELOW", (0, 0), (-1, 0), 0.35, BORDER),
        ("BACKGROUND", (0, row_count - 1), (-1, row_count - 1), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.6 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6 * mm),
    ]
    
    # Add line below subtotal if there's VAT
    if row_count > 2:
        table_style.append(("LINEBELOW", (0, 1), (-1, 1), 0.35, BORDER))
    
    totals_table.setStyle(TableStyle(table_style))

    totals_container = Table(
        [["", totals_table]],
        colWidths=[91 * mm, 95 * mm],
    )
    totals_container.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ])
    )

    story.append(totals_container)
    story.append(Spacer(1, 2 * mm))

    # --------------------------------------------------------
    # TERMS
    # --------------------------------------------------------

    story.append(section_heading("Terms & Conditions", styles, "✓"))
    story.append(Spacer(1, 1 * mm))

    terms = [
        "This quotation is valid for 30 days from the date of issue.",
        "Prices are subject to change without prior notice.",
        "50% advance payment is required to commence work.",
        "Balance payment is due upon completion.",
        "Installation timeline depends on site conditions.",
        "Warranty applies as per the service agreement.",
    ]

    def terms_column(values):
        content = ""
        for term in values:
            content += (
                f"<font color='#1686D9'><b>✓</b></font>&nbsp; "
                f"{html.escape(term)}<br/>"
            )

        return Paragraph(
            content,
            ParagraphStyle(
                "terms_body",
                fontName=FONT,
                fontSize=8,
                leading=12,
                textColor=TEXT,
            ),
        )

    terms_table = Table(
        [[
            terms_column(terms),
        ]],
        colWidths=[CONTENT_W],
    )

    terms_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
            ("BOX", (0, 0), (-1, -1), 0.65, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ])
    )

    story.append(terms_table)

    # --------------------------------------------------------
    # BUILD
    # --------------------------------------------------------

    doc.build(
        story,
        onFirstPage=page_chrome,
        onLaterPages=page_chrome,
    )

    buffer.seek(0)
    return buffer
