'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import CountryCodeSelector from '@/components/CountryCodeSelector';

export default function CreateEmployeePage() {
  const router = useRouter();
  const [employeeType, setEmployeeType] = useState<'full_time' | 'part_time' | ''>('');
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);
  const [jobTitles, setJobTitles] = useState<{id: number, title: string}[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    id_type: '',
    id_number: '',
    id_document: null as File | null,
    photo: null as File | null,
    department: '',
    job_title: '',
    management_category: '',
    gross_monthly_salary: '',
    pay_basis: '',
    daily_rate: '',
    hourly_rate: '',
    contract_start_date: '',
    contract_end_date: '',
    contract_document: null as File | null,
  });
  const [countryCode, setCountryCode] = useState('256');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchJobTitles();
  }, []);

      const fetchDepartments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/departments/');
      if (response.ok) {
        const data = await response.json();
        console.log('Departments API response:', data);
        const departmentsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        console.log('Departments parsed:', departmentsData);
        setDepartments(departmentsData);
      } else {
        console.error('Departments API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchJobTitles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/job-titles/');
      if (response.ok) {
        const data = await response.json();
        console.log('Job titles API response:', data);
        const jobTitlesData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        console.log('Job titles parsed:', jobTitlesData);
        setJobTitles(jobTitlesData);
      } else {
        console.error('Job titles API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching job titles:', error);
    }
  };

  useEffect(() => {
    if (employeeType === 'full_time') {
      setFormData(prev => ({ ...prev, department: '' }));
    }
  }, [employeeType]);

  const departmentOptions = departments;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeType) {
      setError('Please select an employee type');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      // Add common fields
      formDataToSend.append('employee_type', employeeType);
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('phone', `+${countryCode}${formData.phone}`);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('id_type', formData.id_type);
      formDataToSend.append('id_number', formData.id_number);
      
      // Find the department ID from the departments array
      const selectedDepartment = departments.find(dept => dept.name === formData.department);
      console.log('Selected department name:', formData.department);
      console.log('Selected department object:', selectedDepartment);
      console.log('Available departments:', departments);
      if (selectedDepartment) {
        // Try sending department name instead of ID
        formDataToSend.append('department', selectedDepartment.name);
        console.log('Sending department name:', selectedDepartment.name);
      } else {
        console.error('Department not found:', formData.department);
      }
      
      formDataToSend.append('management_category', formData.management_category);

      // Add ID document if present
      if (formData.id_document) {
        formDataToSend.append('id_document', formData.id_document);
      }

      // Add photo if present
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      // Add type-specific fields
      if (employeeType === 'full_time') {
        if (formData.job_title) {
          // Find the job title ID from the job titles array
          const selectedJobTitle = jobTitles.find(job => job.title === formData.job_title);
          if (selectedJobTitle) {
            formDataToSend.append('job_title', selectedJobTitle.id.toString());
            console.log('Sending job title ID:', selectedJobTitle.id.toString());
          } else {
            console.error('Job title not found:', formData.job_title);
          }
        }
        if (formData.gross_monthly_salary) formDataToSend.append('gross_monthly_salary', formData.gross_monthly_salary);
      } else {
        if (formData.pay_basis) formDataToSend.append('pay_basis', formData.pay_basis);
        if (formData.daily_rate) formDataToSend.append('daily_rate', formData.daily_rate);
        if (formData.hourly_rate) formDataToSend.append('hourly_rate', formData.hourly_rate);
        if (formData.contract_start_date) formDataToSend.append('contract_start_date', formData.contract_start_date);
        if (formData.contract_end_date) formDataToSend.append('contract_end_date', formData.contract_end_date);
      }

      // Add contract document if present
      if (formData.contract_document) {
        formDataToSend.append('contract_document', formData.contract_document);
      }

      const endpoint = 'http://127.0.0.1:8000/api/employees/employees/';

      console.log('Submitting employee data with endpoint:', endpoint);
      console.log('Form data to send:', Object.fromEntries(formDataToSend));

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        alert('Employee created successfully!');
        window.location.href = '/admin/employees';
      } else {
        const errorText = await response.text();
        console.error('Response text:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        console.error('Employee creation error:', errorData);
        setError(JSON.stringify(errorData) || errorData.detail || 'Failed to create employee');
      }
    } catch (error) {
      setError('Failed to create employee. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        contract_document: e.target.files[0],
      });
    }
  };

  const handleIdDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        id_document: e.target.files[0],
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
    }
  };

  const getStatusDisplay = () => {
    if (!employeeType) return '';
    if (employeeType === 'full_time') {
      return 'Active – not assigned';
    } else {
      return 'Not active';
    }
  };

  return (
    <AdminLayout title="Add New Employee" subtitle="Create a new employee record" activePath="/admin/employees">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Employee Type Toggle */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Type</h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEmployeeType('full_time')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    employeeType === 'full_time'
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900">Full-time</h4>
                    <p className="text-sm text-gray-600">Long-term with job title</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeType('part_time')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    employeeType === 'part_time'
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900">Part-time</h4>
                    <p className="text-sm text-gray-600">Flexible pay arrangements</p>
                  </div>
                </button>
              </div>
            </div>

            {employeeType && (
              <>
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <div className="flex">
                        <CountryCodeSelector
                          value={countryCode}
                          onChange={setCountryCode}
                        />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="flex-1 px-4 py-2.5 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="700 123 456"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Type *</label>
                      <select
                        name="id_type"
                        value={formData.id_type}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select ID Type</option>
                        <option value="national_id">National ID</option>
                        <option value="driving_permit">Driving Permit</option>
                        <option value="passport">Passport</option>
                        <option value="refugee_card">Refugee ID Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
                      <input
                        type="text"
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter ID number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Document *</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          name="id_document"
                          onChange={handleIdDocumentChange}
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          required
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <Upload className="text-gray-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, PNG, JPG, or JPEG files only</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee Photo</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          name="photo"
                          onChange={handlePhotoChange}
                          accept=".jpg,.jpeg,.png"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <Upload className="text-gray-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">JPG, JPEG, or PNG files only</p>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Department</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept.name} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Management Category */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Category</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Management Category *</label>
                    <select
                      name="management_category"
                      value={formData.management_category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="management">Management (Administrative)</option>
                      <option value="technical">Technical / Field</option>
                    </select>
                  </div>
                </div>

                {/* Type-specific fields */}
                {employeeType === 'full_time' ? (
                  <>
                    {/* Job Title */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                        <select
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Job Title</option>
                          {jobTitles.length > 0 ? (
                            jobTitles.map((job) => (
                              <option key={job.id} value={job.title}>{job.title}</option>
                            ))
                          ) : (
                            <option value="" disabled>Loading job titles...</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gross Monthly Salary</label>
                        <input
                          type="number"
                          name="gross_monthly_salary"
                          value={formData.gross_monthly_salary}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Pay Basis */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Information</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pay Basis *</label>
                        <select
                          name="pay_basis"
                          value={formData.pay_basis}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Pay Basis</option>
                          <option value="daily_fixed">Fixed rate per day worked</option>
                          <option value="hourly_daily">Hourly rate, calculated daily</option>
                          <option value="hourly_monthly">Hourly rate, totaled monthly</option>
                        </select>
                      </div>
                    </div>

                    {/* Rates */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate</label>
                          <input
                            type="number"
                            name="daily_rate"
                            value={formData.daily_rate}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                          <input
                            type="number"
                            name="hourly_rate"
                            value={formData.hourly_rate}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contract Dates */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start Date *</label>
                          <input
                            type="date"
                            name="contract_start_date"
                            value={formData.contract_start_date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contract End Date *</label>
                          <input
                            type="date"
                            name="contract_end_date"
                            value={formData.contract_end_date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Contract Document */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Document</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Contract Document</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        name="contract_document"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <Upload className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOC, or DOCX files only</p>
                  </div>
                </div>

                {/* Status (Read-only) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <input
                      type="text"
                      value={getStatusDisplay()}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                    <p className="text-sm text-gray-500 mt-1">Status is automatically managed by the system</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Link
                    href="/admin/employees"
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    {submitting ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
