from io import BytesIO
from types import SimpleNamespace
from unittest.mock import patch
import zipfile
from PIL import Image

from quotations.services.quotation_docx import generate_quotation_docx

pdf_bytes = (
    b'%PDF-1.4\n'
    b'1 0 obj\n<<>>\nendobj\n'
    b'trailer\n<<>>\n%%EOF\n'
    b'x' * 256
)

img_bytes = BytesIO()
Image.new('RGB', (30, 30), color=(255, 0, 0)).save(img_bytes, format='PNG')
PNG = img_bytes.getvalue()

class FakePage:
    def get_pixmap(self, matrix=None, alpha=None):
        class Pix:
            def tobytes(self, fmt=None):
                return PNG
        return Pix()

class FakeDocument:
    def __init__(self, pages):
        self.pages = pages
    def __iter__(self):
        return iter(self.pages)
    def close(self):
        return None
    def __len__(self):
        return len(self.pages)

with patch('quotations.services.quotation_docx.generate_quotation_pdf', return_value=BytesIO(pdf_bytes)), \
     patch('quotations.services.quotation_docx.fitz.open', return_value=FakeDocument([FakePage(), FakePage(), FakePage()])):
    docx_buffer = generate_quotation_docx(SimpleNamespace(include_vat=True), include_vat=True)
    data = docx_buffer.getvalue()

with zipfile.ZipFile(BytesIO(data)) as archive:
    xml = archive.read('word/document.xml').decode('utf-8', 'ignore')
    page_break_count = xml.count('w:type="page"')
    trailing_break = 'w:lastRenderedPageBreak' in xml.rsplit('w:type="page"', 1)[-1]
    print(f'page_break_count={page_break_count}')
    print(f'trailing_break={trailing_break}')
    assert page_break_count == 2, f'Expected 2 page breaks, found {page_break_count}'
    assert trailing_break is False, 'Trailing page break still present'
