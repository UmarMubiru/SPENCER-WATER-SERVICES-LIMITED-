from io import BytesIO
from types import SimpleNamespace
from unittest.mock import patch
import zipfile

from django.test import TestCase

from quotations.services.quotation_docx import generate_quotation_docx


class QuotationDocxExportTests(TestCase):
    def _fake_pdf_document(self, page_count=3):
        class FakePage:
            def get_pixmap(self, matrix=None, alpha=False):
                class FakePixmap:
                    def tobytes(self, format):
                        return b'\x89PNG\r\n\x1a\n' + b'\x00' * 20
                return FakePixmap()

        class FakeDocument:
            def __init__(self, pages):
                self.pages = pages

            def __iter__(self):
                return iter(self.pages)

            def close(self):
                return None

            def __len__(self):
                return len(self.pages)

        return FakeDocument([FakePage() for _ in range(page_count)])

    def test_word_conversion_adds_page_breaks_only_between_pages(self):
        fake_document = self._fake_pdf_document(page_count=3)

        with patch('quotations.services.quotation_docx.generate_quotation_pdf', return_value=BytesIO(b'%PDF-1.4')):
            with patch('quotations.services.quotation_docx.fitz.open', return_value=fake_document):
                docx_bytes = generate_quotation_docx(SimpleNamespace(include_vat=True), include_vat=True)

        with zipfile.ZipFile(BytesIO(docx_bytes.getvalue())) as archive:
            xml = archive.read('word/document.xml').decode('utf-8', 'ignore')

        self.assertEqual(xml.count('w:type="page"'), 2)
        self.assertNotIn('w:lastRenderedPageBreak', xml.rsplit('w:type="page"', 1)[-1])
