'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { useSearchParams } from 'next/navigation';
import PageHeader from '../../../../../components/admin/ui/PageHeader';

interface Lead {
  id: string;
  customer_name: string;
  company?: string;
  phone: string;
  email: string;
  address?: string;
}

interface QuotationItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price?: number;
}

function PreviewQuotationPageContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id');
  const quotationId = searchParams.get('quotation_id');
  const itemsParam = searchParams.get('items');
  const includeVatParam = searchParams.get('include_vat');

  const [lead, setLead] = useState<Lead | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [includeVat, setIncludeVat] = useState(includeVatParam === 'false' ? false : true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('DEBUG: Preview page - leadId:', leadId);
      console.log('DEBUG: Preview page - quotationId:', quotationId);
      console.log('DEBUG: Preview page - itemsParam:', itemsParam);

      // A saved quotation is always previewed from its own document endpoints.
      // This keeps PDF and Word visually identical and never rebuilds items.
      if (quotationId && leadId !== 'manual') {
        try {
          const quotationRes = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/`);
          if (quotationRes.ok) {
            const quotationData = await quotationRes.json();
            setLead({
              id: quotationId,
              customer_name: quotationData.customer_name_snapshot || quotationData.lead_customer_name || 'N/A',
              company: quotationData.company_snapshot || quotationData.lead_company || '',
              phone: quotationData.phone_snapshot || '',
              email: quotationData.email_snapshot || '',
              address: quotationData.address_snapshot || '',
            });
            setItems((quotationData.items || []).map((item: any) => ({
              item_id: item.id,
              item_name: item.description,
              quantity: Number(item.quantity || 0),
              unit_price: Number(item.rate || 0),
            })));
            setIncludeVat(quotationData.include_vat !== undefined ? quotationData.include_vat : true);
          }
        } catch (error) {
          console.error('Error fetching saved quotation:', error);
        }
      // Handle legacy manual previews (no saved lead)
      } else if (leadId === 'manual' && quotationId) {
        try {
          const quotationRes = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/`);
          if (quotationRes.ok) {
            const quotationData = await quotationRes.json();
            // Create a lead-like object from quotation snapshot fields
            setLead({
              id: quotationId,
              customer_name: quotationData.customer_name_snapshot || 'N/A',
              company: quotationData.company_snapshot || '',
              phone: quotationData.phone_snapshot || '',
              email: quotationData.email_snapshot || '',
              address: quotationData.address_snapshot || '',
            });
            setIncludeVat(quotationData.include_vat !== undefined ? quotationData.include_vat : true);
            console.log('DEBUG: Preview page - quotation data:', quotationData);
          }
        } catch (error) {
          console.error('Error fetching quotation:', error);
        }
      } else if (leadId && leadId !== 'manual') {
        // Original lead-based flow
        try {
          const leadRes = await fetch(`http://127.0.0.1:8000/api/quotations/leads/${leadId}/`);
          if (leadRes.ok) {
            const leadData = await leadRes.json();
            setLead(leadData);
            console.log('DEBUG: Preview page - lead data:', leadData);
          }
        } catch (error) {
          console.error('Error fetching lead:', error);
        }
      }

      if (itemsParam) {
        try {
          const parsedItems = JSON.parse(itemsParam);
          console.log('DEBUG: Preview page - parsed items:', parsedItems);
          setItems(parsedItems);
        } catch (error) {
          console.error('Error parsing items:', error);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [leadId, quotationId, itemsParam]);

  useEffect(() => {
    // Generate PDF for preview when data is loaded
    if (!loading && (quotationId || leadId) && (quotationId || items.length > 0)) {
      generatePreviewPDF();
    }
  }, [loading, leadId, quotationId, items]);

  const generatePreviewPDF = async () => {
    try {
      if (quotationId && leadId !== 'manual') {
        const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/pdf/`);
        if (!response.ok) throw new Error('Unable to generate quotation PDF');
        setPdfUrl(window.URL.createObjectURL(await response.blob()));
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotations/generate-preview-pdf/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId === 'manual' ? null : leadId,
          quotation_id: quotationId,
          items: items,
          manual_data: leadId === 'manual' ? lead : null,
          include_vat: includeVat,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    } catch (error) {
      console.error('Error generating preview PDF:', error);
    }
  };

  const downloadPreviewDocument = async (format: 'pdf' | 'docx') => {
    if (quotationId && leadId !== 'manual') {
      const response = await fetch(
        `http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/${format === 'pdf' ? 'pdf' : 'generate-docx'}/`,
        { method: format === 'pdf' ? 'GET' : 'POST' }
      );
      if (!response.ok) throw new Error(`Failed to generate ${format.toUpperCase()} document`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lead?.customer_name || 'quotation'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }

    const response = await fetch('http://127.0.0.1:8000/api/quotations/quotations/generate-preview-pdf/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: leadId === 'manual' ? null : leadId,
        quotation_id: quotationId,
        items: items,
        manual_data: leadId === 'manual' ? lead : null,
        include_vat: includeVat,
        format,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to generate ${format.toUpperCase()} document`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'pdf'
      ? `quotation_${lead?.customer_name || 'preview'}.pdf`
      : `quotation_${lead?.customer_name || 'preview'}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadPDF = async () => {
    if (!pdfUrl) return;

    setDownloading(true);
    try {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `quotation_${lead?.customer_name || 'preview'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleConvertToWord = async () => {
    setDownloading(true);
    try {
      await downloadPreviewDocument('docx');
    } catch (error) {
      console.error('Error converting to Word:', error);
      alert('Error converting to Word document');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Quotation Document Preview"
        subtitle="The final PDF layout used for both PDF and Word downloads"
        activePath="/admin/quotations"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading quotation preview...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Quotation Document Preview"
      subtitle="The final PDF layout used for both PDF and Word downloads"
      activePath="/admin/quotations"
    >
      <div className="min-h-[calc(100vh-4rem)] mx-auto max-w-7xl space-y-6 p-6 md:p-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Document review</p>
            <h2 className="mt-1 text-xl font-bold text-blue-950">Quotation for {lead?.customer_name || 'customer'}</h2>
            <p className="mt-1 text-sm text-slate-600">This is the final designed document. The Word download is created from these same pages, so both formats retain the same template and layout.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadPDF} disabled={!pdfUrl || downloading} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{downloading ? 'Preparing…' : 'Download PDF'}</button>
            <button onClick={handleConvertToWord} disabled={loading || downloading} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{downloading ? 'Preparing…' : 'Download Word'}</button>
          </div>
        </section>
        <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-lg md:p-5">
          {pdfUrl ? (
            <div className="w-full h-[800px]">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Quotation Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-blue-400">Generating PDF preview...</div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-100 text-blue-900 rounded-xl hover:bg-blue-200 transition-colors font-medium border border-blue-200"
          >
            ← Back to Quotation
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function PreviewQuotationPage() {
  return (
    <Suspense fallback={
      <AdminLayout
        title="Quotation Document Preview"
        subtitle="The final PDF layout used for both PDF and Word downloads"
        activePath="/admin/quotations"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading quotation preview...</div>
        </div>
      </AdminLayout>
    }>
      <PreviewQuotationPageContent />
    </Suspense>
  );
}
