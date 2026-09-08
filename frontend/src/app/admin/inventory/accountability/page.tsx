'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface AccountabilityRecord {
  id: string;
  tool: string;
  tool_name: string;
  tool_sku: string;
  project_id: string;
  project_name: string;
  material_request: string;
  material_request_item: string;
  responsible_person: string;
  responsible_person_name: string;
  issued_date: string;
  expected_return_date: string;
  actual_return_date: string;
  condition_at_issue: string;
  condition_at_return: string;
  status: string;
  damage_description: string;
  loss_description: string;
  estimated_value: number;
  accountable_person: string;
  accountable_person_name: string;
  resolution: string;
  resolved_at: string;
  approved_by: string;
  approved_by_name: string;
  notes: string;
  created_at: string;
}

export default function ToolAccountabilityPage() {
  const [records, setRecords] = useState<AccountabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AccountabilityRecord | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusColors: Record<string, string> = {
    PENDING_RETURN: 'bg-yellow-100 text-yellow-800',
    RETURNED_GOOD: 'bg-green-100 text-green-800',
    RETURNED_DAMAGED: 'bg-orange-100 text-orange-800',
    NOT_RETURNED: 'bg-red-100 text-red-800',
    LOST: 'bg-red-100 text-red-800',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800',
    ACCOUNTABILITY_RESOLVED: 'bg-gray-100 text-gray-800',
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/tool-accountability/');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.results || data);
      }
    } catch (err) {
      console.error('Failed to fetch accountability records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedRecord) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/tool-accountability/${selectedRecord.id}/resolve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: resolutionText }),
      });

      if (response.ok) {
        setShowResolveModal(false);
        setResolutionText('');
        setSelectedRecord(null);
        fetchRecords();
      }
    } catch (err) {
      console.error('Failed to resolve accountability:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/inventory" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Tool Accountability"
            subtitle="Track damaged, lost, or overdue company tools"
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Accountability Records</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="p-4">Tool</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Responsible Person</th>
                      <th className="p-4">Issued Date</th>
                      <th className="p-4">Expected Return</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr className="border-t" key={record.id}>
                        <td className="p-4">
                          <div className="font-medium">{record.tool_name}</div>
                          <div className="text-gray-500 text-xs">{record.tool_sku}</div>
                        </td>
                        <td className="p-4">{record.project_name || '—'}</td>
                        <td className="p-4">{record.responsible_person_name || '—'}</td>
                        <td className="p-4">
                          {record.issued_date ? new Date(record.issued_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4">
                          {record.expected_return_date ? new Date(record.expected_return_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          {record.status === 'UNDER_REVIEW' && (
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowResolveModal(true);
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No accountability records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showResolveModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Resolve Accountability</h3>
            <div className="space-y-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Tool: {selectedRecord.tool_name}</p>
                <p className="text-sm text-gray-600">Project: {selectedRecord.project_name || 'N/A'}</p>
                <p className="text-sm text-gray-600">Status: {selectedRecord.status.replace('_', ' ')}</p>
                {selectedRecord.damage_description && (
                  <p className="text-sm text-gray-600">Damage: {selectedRecord.damage_description}</p>
                )}
                {selectedRecord.loss_description && (
                  <p className="text-sm text-gray-600">Loss: {selectedRecord.loss_description}</p>
                )}
                {selectedRecord.estimated_value && (
                  <p className="text-sm text-gray-600">Estimated Value: UGX {selectedRecord.estimated_value.toLocaleString()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={4}
                  placeholder="Enter resolution details..."
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolutionText('');
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={submitting || !resolutionText}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Resolving...' : 'Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
