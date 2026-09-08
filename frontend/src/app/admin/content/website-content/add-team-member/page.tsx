'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { AdminLayout } from '../../../components/AdminLayout';
import PageHeader from '../../../../../components/admin/ui/PageHeader';

interface Employee {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  department?: string;
  job_title?: string;
  employee_photo?: string;
}

interface TeamMember {
  employee?: number | null;
  name: string;
  role_title: string;
  bio: string;
  display_order: number;
  is_active: boolean;
}

export default function AddTeamMemberPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [member, setMember] = useState<TeamMember>({
    name: '',
    role_title: '',
    bio: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    if (!token) {
      console.error('No token for loading employees');
      return;
    }
    try {
      console.log('Loading employees...');
      const response = await fetch('http://127.0.0.1:8000/api/employees/employees/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Employees response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Employees data:', data);
        const employeesArray = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setEmployees(employeesArray);
        console.log('Set employees:', employeesArray.length);
      } else {
        const errorText = await response.text();
        console.error('Failed to load employees:', response.status, errorText);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', member.name);
      formData.append('role_title', member.role_title);
      formData.append('bio', member.bio);
      formData.append('display_order', String(member.display_order));
      formData.append('is_active', String(member.is_active));

      if (member.employee) {
        formData.append('employee', String(member.employee));
      }

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch('http://127.0.0.1:8000/api/content/core-pages/team-members/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        router.back();
      } else {
        setError('Failed to save team member');
      }
    } catch (err) {
      setError('Error saving team member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Add Team Member"
      subtitle="Create a new team member"
      activePath="/admin/content/website-content"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Add Team Member"
          description="Create a new team member"
        />

        {/* Add Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="border-b border-blue-100 p-6 bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-900">Team Member Details</h2>
            <p className="text-sm text-blue-400 mt-1">Enter the team member information below</p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Employee Link */}
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Link to Employee (Optional)</label>
              <select
                value={member.employee || ''}
                onChange={(e) => {
                  const employeeId = e.target.value ? parseInt(e.target.value) : null;
                  const selectedEmployee = employees.find(emp => emp.id === employeeId);
                  
                  if (selectedEmployee) {
                    setMember({
                      ...member,
                      employee: employeeId,
                      name: selectedEmployee.full_name,
                      role_title: selectedEmployee.job_title || member.role_title,
                    });
                    if (selectedEmployee.employee_photo) {
                      setPhotoPreview(`http://127.0.0.1:8000${selectedEmployee.employee_photo}`);
                    }
                  } else {
                    setMember({ ...member, employee: null });
                  }
                }}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Select Employee (Optional) --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
              <p className="text-xs text-blue-400 mt-1">Link to an existing employee to use their photo and basic info. Can be overridden below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Name {member.employee ? '(Override)' : ''}
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => setMember({ ...member, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter name"
                  required
                />
              </div>

              {/* Role Title */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Role Title</label>
                <input
                  type="text"
                  value={member.role_title}
                  onChange={(e) => setMember({ ...member, role_title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g. Managing Director"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Bio</label>
              <textarea
                value={member.bio}
                onChange={(e) => setMember({ ...member, bio: e.target.value })}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows={4}
                placeholder="Enter biography..."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Photo {member.employee ? '(Override employee photo)' : ''}
              </label>
              <div className="flex items-start gap-6">
                {photoPreview && (
                  <div className="shrink-0">
                    <img
                      src={photoPreview}
                      alt="Team member preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-blue-400 mt-1">Upload a photo for the team member.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Display Order</label>
                <input
                  type="number"
                  value={member.display_order}
                  onChange={(e) => setMember({ ...member, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-blue-400 mt-1">Lower numbers appear first in the list</p>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Status</label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.is_active}
                      onChange={(e) => setMember({ ...member, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-700">Active</span>
                  </label>
                  <p className="text-xs text-blue-400">Only active members are displayed on the website</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-blue-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Create Team Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
