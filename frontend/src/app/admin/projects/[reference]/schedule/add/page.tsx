'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/Sidebar';
import { Topbar } from '../../../../components/Topbar';
import { useRouter } from 'next/navigation';

interface ActivityResource {
  id?: string;
  resource_type: 'company_tool' | 'hired_tool' | 'money';
  inventory_item?: string;
  quantity?: number;
  hired_tool_name?: string;
  hired_from?: string;
  hired_tool_cost?: number;
  money_amount?: number;
  money_purpose?: string;
}

interface ActivityImage {
  id?: string;
  image: string;
  caption: string;
}

interface Activity {
  id?: string;
  activity_name: string;
  order: number;
  start_date: string;
  end_date: string;
  progress: number;
  notes: string;
  status: 'in_progress' | 'completed' | 'on_hold';
  resources: ActivityResource[];
  images: ActivityImage[];
}

interface ResourceAllocation {
  id: string;
  resource_type: string;
  tool_name?: string;
  money_purpose?: string;
  allocated_quantity?: number;
  remaining_quantity?: number;
  money_amount?: number;
  remaining_amount?: number;
}

interface Project {
  id: string;
  project_reference: string;
  name: string;
}

export default function AddActivityPage({ params }: { params: Promise<{ reference: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [existingActivities, setExistingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  
  const [activity, setActivity] = useState<Activity>({
    activity_name: '',
    order: 0,
    start_date: '',
    end_date: '',
    progress: 0,
    notes: '',
    status: 'in_progress',
    resources: [],
    images: [],
  });

  const [showResourcePopover, setShowResourcePopover] = useState(false);
  const [newResource, setNewResource] = useState<ActivityResource>({
    resource_type: 'company_tool',
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProject(),
        fetchResourceAllocations(),
        fetchExistingActivities()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/?project_reference=${resolvedParams.reference}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setProject(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const fetchResourceAllocations = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${resolvedParams.reference}/resource_allocations/`);
      if (response.ok) {
        const data = await response.json();
        setResourceAllocations(data);
      }
    } catch (err) {
      console.error('Error fetching resource allocations:', err);
    }
  };

  const fetchExistingActivities = async () => {
    try {
      // First get the project to get its ID
      const projectResponse = await fetch(`http://127.0.0.1:8000/api/projects/?project_reference=${resolvedParams.reference}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        if (projectData.length > 0) {
          const projectId = projectData[0].id;
          console.log('Fetching existing activities for project ID:', projectId);
          const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/?project=${projectId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched existing activities:', data);
            setExistingActivities(data);
          } else {
            console.error('Failed to fetch existing activities:', response.status);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching existing activities:', err);
    }
  };

  const updateActivity = (field: keyof Activity, value: any) => {
    setActivity({ ...activity, [field]: value });
  };

  // Check if form is valid to show Update button
  useEffect(() => {
    const isValid = !!(
      activity.activity_name &&
      activity.start_date &&
      activity.end_date &&
      new Date(activity.end_date) >= new Date(activity.start_date) &&
      activity.progress >= 0 && 
      activity.progress <= 100
    );
    setShowUpdateButton(isValid);
  }, [activity]);

  const addResource = () => {
    if (newResource.resource_type === 'company_tool') {
      if (!newResource.inventory_item || !newResource.quantity) {
        alert('Inventory item and quantity are required');
        return;
      }
    } else if (newResource.resource_type === 'hired_tool') {
      if (!newResource.hired_tool_name || !newResource.quantity || !newResource.hired_from || !newResource.hired_tool_cost) {
        alert('Tool name, quantity, hired from, and cost are required');
        return;
      }
    } else if (newResource.resource_type === 'money') {
      if (!newResource.money_amount) {
        alert('Money amount is required');
        return;
      }
    }

    setActivity({
      ...activity,
      resources: [...activity.resources, { ...newResource, id: `temp-${Date.now()}` }],
    });
    setNewResource({ resource_type: 'company_tool' });
    setShowResourcePopover(false);
  };

  const removeResource = (index: number) => {
    setActivity({
      ...activity,
      resources: activity.resources.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const updatedImages = [...activity.images];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        updatedImages.push({
          id: `temp-${Date.now()}-${i}`,
          image: imageData,
          caption: file.name,
        });
        setActivity({ ...activity, images: updatedImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setActivity({
      ...activity,
      images: activity.images.filter((_, i) => i !== index),
    });
  };

  const validateActivity = () => {
    if (!activity.activity_name) {
      setError('Activity name is required');
      return false;
    }
    if (!activity.start_date || !activity.end_date) {
      setError('Start date and end date are required');
      return false;
    }
    if (new Date(activity.end_date) < new Date(activity.start_date)) {
      setError('End date must be after start date');
      return false;
    }
    if (activity.progress < 0 || activity.progress > 100) {
      setError('Progress must be between 0 and 100');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!project) {
      setError('Project not found');
      return;
    }

    if (!validateActivity()) return;

    setSaving(true);
    setError('');

    try {
      // Set the order for the new activity
      const newActivityWithOrder = {
        ...activity,
        order: existingActivities.length
      };

      // Remove temporary IDs from resources and images
      const cleanedActivity = {
        ...newActivityWithOrder,
        resources: newActivityWithOrder.resources.map(resource => {
          const { id, ...rest } = resource;
          // Remove any inventory-related fields that might be present
          const { inventory_item_name, remaining_quantity, remaining_amount, ...cleanedRest } = rest as any;
          return cleanedRest;
        }),
        images: newActivityWithOrder.images.map(image => {
          const { id, ...rest } = image as any;
          // Remove any unexpected fields
          const { uploaded_by_name, image_url, ...cleanedRest } = rest;
          return cleanedRest;
        })
      };

      // Also clean existing activities
      const cleanedExistingActivities = existingActivities.map(existingActivity => ({
        ...existingActivity,
        resources: existingActivity.resources.map(resource => {
          const { id, ...rest } = resource;
          // Remove any inventory-related fields that might be present
          const { inventory_item_name, remaining_quantity, remaining_amount, ...cleanedRest } = rest as any;
          return cleanedRest;
        }),
        images: existingActivity.images.map(image => {
          const { id, ...rest } = image as any;
          // Remove any unexpected fields
          const { uploaded_by_name, image_url, ...cleanedRest } = rest;
          return cleanedRest;
        })
      }));

      // Send existing activities + new activity
      const allActivities = [...cleanedExistingActivities, cleanedActivity];

      console.log('Sending to bulk_update:', {
        project: project.id,
        activities: allActivities
      });

      const response = await fetch('http://127.0.0.1:8000/api/projects/activities/bulk_update/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: project.id,
          activities: allActivities,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        try {
          const responseData = JSON.parse(responseText);
          console.log('Response data:', responseData);
          router.push(`/admin/projects/${resolvedParams.reference}/schedule`);
          router.refresh();
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          setError('Server returned invalid response');
        }
      } else {
        try {
          const errorData = JSON.parse(responseText);
          console.error('Error response:', errorData);
          setError(errorData.error || errorData.detail || 'Failed to save activity');
        } catch (e) {
          console.error('Failed to parse error as JSON:', e);
          console.error('Raw error response:', responseText);
          setError(`Server error: ${response.status} - ${responseText.substring(0, 200)}`);
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderResourceChip = (resource: ActivityResource, index: number) => {
    let label = '';
    if (resource.resource_type === 'company_tool') {
      label = `🔧 ${resource.inventory_item} x${resource.quantity}`;
    } else if (resource.resource_type === 'hired_tool') {
      label = `🔧 ${resource.hired_tool_name} x${resource.quantity} — hired from ${resource.hired_from}, UGX ${resource.hired_tool_cost}`;
    } else if (resource.resource_type === 'money') {
      label = `💰 UGX ${resource.money_amount} — ${resource.money_purpose}`;
    }

    return (
      <span key={resource.id || index} className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
        {label}
        <button
          type="button"
          onClick={() => removeResource(index)}
          className="ml-1 text-blue-500 hover:text-blue-700"
        >
          ×
        </button>
      </span>
    );
  };

  const statusColors = {
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/projects/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Add Activity"
          subtitle={project?.name || `Project ${resolvedParams.reference}`}
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Activity Details</h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name *</label>
                    <input
                      type="text"
                      value={activity.activity_name}
                      onChange={(e) => updateActivity('activity_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Site excavation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={activity.status}
                      onChange={(e) => updateActivity('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={activity.start_date}
                      onChange={(e) => updateActivity('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={activity.end_date}
                      min={activity.start_date}
                      onChange={(e) => updateActivity('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={activity.progress}
                      onChange={(e) => updateActivity('progress', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={activity.notes}
                      onChange={(e) => updateActivity('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Activity notes..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resources</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {activity.resources.map((resource, resourceIndex) =>
                      renderResourceChip(resource, resourceIndex)
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResourcePopover(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Resource
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gallery</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {activity.images.map((image, imageIndex) => (
                      <div
                        key={image.id || imageIndex}
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedImageIndex(imageIndex)}
                      >
                        <img
                          src={image.image}
                          alt={image.caption}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(imageIndex);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                  >
                    + Add Images
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/projects/${resolvedParams.reference}/schedule`)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showResourcePopover && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Resource</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                  <select
                    value={newResource.resource_type}
                    onChange={(e) => setNewResource({ ...newResource, resource_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="company_tool">Company Tool</option>
                    <option value="hired_tool">Hired Tool</option>
                    <option value="money">Money</option>
                  </select>
                </div>

                {newResource.resource_type === 'company_tool' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                      <select
                        value={newResource.inventory_item || ''}
                        onChange={(e) => setNewResource({ ...newResource, inventory_item: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select tool...</option>
                        {resourceAllocations.filter(a => a.resource_type === 'company_tool').map(allocation => (
                          <option
                            key={allocation.id}
                            value={allocation.tool_name}
                            disabled={allocation.remaining_quantity === 0}
                          >
                            {allocation.tool_name} — {allocation.remaining_quantity} of {allocation.allocated_quantity} remaining
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={newResource.quantity || ''}
                        onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {newResource.resource_type === 'hired_tool' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                      <input
                        type="text"
                        value={newResource.hired_tool_name || ''}
                        onChange={(e) => setNewResource({ ...newResource, hired_tool_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter tool name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={newResource.quantity || ''}
                        onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hired From</label>
                      <input
                        type="text"
                        value={newResource.hired_from || ''}
                        onChange={(e) => setNewResource({ ...newResource, hired_from: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter vendor name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newResource.hired_tool_cost || ''}
                        onChange={(e) => setNewResource({ ...newResource, hired_tool_cost: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {newResource.resource_type === 'money' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <input
                        type="text"
                        value={newResource.money_purpose || ''}
                        onChange={(e) => setNewResource({ ...newResource, money_purpose: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter purpose..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newResource.money_amount || ''}
                        onChange={(e) => setNewResource({ ...newResource, money_amount: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={addResource}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResourcePopover(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
