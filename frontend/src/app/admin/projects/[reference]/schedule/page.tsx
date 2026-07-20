'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface ResourceAllocation {
  id: string;
  resource_type: 'company_tool' | 'money';
  tool_name?: string;
  category?: string;
  allocated_quantity?: number;
  money_amount?: number;
  money_purpose?: string;
  remaining_quantity?: number;
  remaining_amount?: number;
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
  is_archived?: boolean;
}

interface ActivityImage {
  id?: string;
  image: string;
  caption: string;
}

interface Project {
  id: string;
  project_reference: string;
  name: string;
}

export default function ActivitySchedulePage({ params }: { params: Promise<{ reference: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  console.log('ActivitySchedulePage rendered with reference:', resolvedParams.reference);
  
  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showResourcePopover, setShowResourcePopover] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number | null>(null);
  const [expandedActivityIndex, setExpandedActivityIndex] = useState<number | null>(null);
  const [expandedSavedIndex, setExpandedSavedIndex] = useState<number | null>(null);
  const [savedConfirmation, setSavedConfirmation] = useState<number | null>(null);
  const [newResource, setNewResource] = useState<ActivityResource>({
    resource_type: 'company_tool',
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    console.log('=== ActivitySchedulePage useEffect ===');
    console.log('Current URL reference:', resolvedParams.reference);
    console.log('Current project state:', project);
    console.log('Current saved activities count:', savedActivities.length);
    
    // Reset state when project changes
    setProject(null);
    setActivities([]);
    setSavedActivities([]);
    setLoading(true);
    
    fetchProject();
    fetchActivities();
    fetchResourceAllocations();
  }, [resolvedParams.reference]);

  const fetchProject = async () => {
    try {
      console.log('Fetching project with reference:', resolvedParams.reference);
      const apiUrl = `http://127.0.0.1:8000/api/projects/?project_reference=${resolvedParams.reference}`;
      console.log('API URL:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Project fetch response (raw):', data);
        console.log('Number of projects returned:', data.length);
        if (data.length > 0) {
          console.log('Setting project:', data[0]);
          setProject(data[0]);
        } else {
          console.error('No project found with reference:', resolvedParams.reference);
        }
      } else {
        console.error('Failed to fetch project:', response.status);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities for project reference:', resolvedParams.reference);
      // First get the project to get its ID
      const projectResponse = await fetch(`http://127.0.0.1:8000/api/projects/?project_reference=${resolvedParams.reference}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        console.log('Project data:', projectData);
        if (projectData.length > 0) {
          const projectId = projectData[0].id;
          console.log('Fetching activities for project ID:', projectId);
          const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/?project=${projectId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched activities:', data);
            setSavedActivities(data);
            setActivities(data);
          } else {
            console.error('Failed to fetch activities:', response.status);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceAllocations = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/?project_reference=${resolvedParams.reference}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0 && data[0].resource_allocations) {
          setResourceAllocations(data[0].resource_allocations);
        }
      }
    } catch (err) {
      console.error('Error fetching resource allocations:', err);
    }
  };

  const addActivity = () => {
    const newActivity: Activity = {
      activity_name: '',
      order: activities.length,
      start_date: '',
      end_date: '',
      progress: 0,
      notes: '',
      status: 'in_progress',
      resources: [],
      images: [],
      is_archived: false,
    };
    setActivities([...activities, newActivity]);
    setExpandedActivityIndex(activities.length);
  };

  const updateActivity = (index: number, field: keyof Activity, value: any) => {
    const updatedActivities = [...activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setActivities(updatedActivities);
  };

  const archiveActivity = (index: number) => {
    const updatedActivities = [...activities];
    updatedActivities[index].is_archived = true;
    
    // Renumber remaining activities
    const activeActivities = updatedActivities.filter(a => !a.is_archived);
    activeActivities.forEach((activity, i) => {
      activity.order = i;
    });
    
    setActivities(updatedActivities);
    if (expandedActivityIndex === index) {
      setExpandedActivityIndex(null);
    } else if (expandedActivityIndex !== null && expandedActivityIndex > index) {
      setExpandedActivityIndex(expandedActivityIndex - 1);
    }
  };

  const addResource = () => {
    if (selectedActivityIndex === null) return;
    
    if (newResource.resource_type === 'company_tool') {
      if (!newResource.inventory_item || !newResource.quantity) {
        alert('Inventory item and quantity are required');
        return;
      }
    } else if (newResource.resource_type === 'hired_tool') {
      if (!newResource.hired_tool_name || !newResource.quantity || !newResource.hired_tool_cost) {
        alert('Hired tool name, quantity, and cost are required');
        return;
      }
    } else if (newResource.resource_type === 'money') {
      if (!newResource.money_amount) {
        alert('Money amount is required');
        return;
      }
    }

    const updatedActivities = [...activities];
    updatedActivities[selectedActivityIndex].resources = [
      ...updatedActivities[selectedActivityIndex].resources,
      { ...newResource, id: `temp-${Date.now()}` },
    ];
    setActivities(updatedActivities);
    setShowResourcePopover(false);
    setNewResource({ resource_type: 'company_tool' });
    setSelectedActivityIndex(null);
  };

  const removeResource = (activityIndex: number, resourceIndex: number) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].resources = updatedActivities[activityIndex].resources.filter(
      (_, i) => i !== resourceIndex
    );
    setActivities(updatedActivities);
  };

  const handleImageUpload = (activityIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const updatedActivities = [...activities];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        updatedActivities[activityIndex].images.push({
          id: `temp-${Date.now()}-${i}`,
          image: imageData,
          caption: file.name,
        });
        setActivities([...updatedActivities]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (activityIndex: number, imageIndex: number) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].images = updatedActivities[activityIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setActivities(updatedActivities);
  };

  const validateActivities = () => {
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      if (!activity.start_date || !activity.end_date) {
        setError(`Activity ${i + 1}: Start date and end date are required`);
        return false;
      }
      if (new Date(activity.end_date) < new Date(activity.start_date)) {
        setError(`Activity ${i + 1}: End date must be after start date`);
        return false;
      }
      if (activity.progress < 0 || activity.progress > 100) {
        setError(`Activity ${i + 1}: Progress must be between 0 and 100`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!project) {
      setError('Project not found');
      return;
    }

    if (!validateActivities()) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/activities/bulk_update/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: project.id,
          activities: activities,
        }),
      });

      if (response.ok) {
        setSavedActivities([...savedActivities, ...activities]);
        setActivities([]);
        setExpandedActivityIndex(null);
        
        // Show confirmation checkmark
        savedActivities.forEach((_, i) => {
          setSavedConfirmation(i);
          setTimeout(() => setSavedConfirmation(null), 2000);
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save activities');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderResourceChip = (resource: ActivityResource, activityIndex: number, resourceIndex: number) => {
    let label = '';
    if (resource.resource_type === 'company_tool') {
      label = `🔧 ${resource.inventory_item} x${resource.quantity}`;
    } else if (resource.resource_type === 'hired_tool') {
      label = `🔧 ${resource.hired_tool_name} x${resource.quantity} — hired from ${resource.hired_from}, UGX ${resource.hired_tool_cost}`;
    } else if (resource.resource_type === 'money') {
      label = `💰 UGX ${resource.money_amount} — ${resource.money_purpose}`;
    }

    return (
      <span
        key={resource.id || resourceIndex}
        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
      >
        {label}
        <button
          type="button"
          onClick={() => removeResource(activityIndex, resourceIndex)}
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

  const renderSavedRow = (activity: Activity, index: number) => {
    if (activity.is_archived) return null;
    const isExpanded = expandedSavedIndex === index;
    return (
      <React.Fragment key={activity.id || index}>
        <tr
          onClick={() => setExpandedSavedIndex(isExpanded ? null : index)}
          className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <td className="py-3 px-4 text-gray-900">
            <span className="inline-block mr-2 text-green-600">✓</span>
            {activity.order + 1}. {activity.activity_name || 'Untitled Activity'}
          </td>
          <td className="py-3 px-4 text-gray-700">
            {activity.start_date ? new Date(activity.start_date).toLocaleDateString() : 'Not set'}
          </td>
          <td className="py-3 px-4 text-gray-700">
            {activity.end_date ? new Date(activity.end_date).toLocaleDateString() : 'Not set'}
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{activity.resources.length}</span>
              <span className="text-gray-400">📦</span>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${activity.progress}%` }}></div>
              </div>
              <span className="text-sm text-gray-700">{activity.progress}%</span>
            </div>
          </td>
          <td className="py-3 px-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
              {activity.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </td>
        </tr>
        {isExpanded && renderReadOnlyExpandedRow(activity, index)}
      </React.Fragment>
    );
  };

  const renderReadOnlyExpandedRow = (activity: Activity, index: number) => {
    return (
      <tr key={`${activity.id || index}-readonly-expanded`}>
        <td colSpan={6} className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Activity Name</label>
                <div className="text-gray-900">{activity.activity_name || 'Untitled Activity'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
                  {activity.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                <div className="text-gray-900">{activity.start_date ? new Date(activity.start_date).toLocaleDateString() : 'Not set'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                <div className="text-gray-900">{activity.end_date ? new Date(activity.end_date).toLocaleDateString() : 'Not set'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Progress</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${activity.progress}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-700">{activity.progress}%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                <div className="text-gray-900">{activity.notes || 'No notes'}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Resources</label>
              <div className="flex flex-wrap gap-2">
                {activity.resources.map((resource, resourceIndex) =>
                  renderResourceChip(resource, index, resourceIndex)
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Gallery</label>
              <div className="grid grid-cols-4 gap-2">
                {activity.images.map((image, imageIndex) => (
                  <div
                    key={image.id || imageIndex}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.image}
                      alt={image.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderCollapsedRow = (activity: Activity, index: number) => {
    if (activity.is_archived) return null;
    return (
      <tr
        key={activity.id || index}
        onClick={() => setExpandedActivityIndex(index)}
        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
          savedConfirmation === index ? 'bg-green-50' : ''
        }`}
      >
        <td className="py-3 px-4 text-gray-900">
          {savedConfirmation === index && (
            <span className="inline-block mr-2 text-green-600">✓</span>
          )}
          {activity.order + 1}. {activity.activity_name || 'Untitled Activity'}
        </td>
        <td className="py-3 px-4 text-gray-700">
          {activity.start_date ? new Date(activity.start_date).toLocaleDateString() : 'Not set'}
        </td>
        <td className="py-3 px-4 text-gray-700">
          {activity.end_date ? new Date(activity.end_date).toLocaleDateString() : 'Not set'}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">{activity.resources.length}</span>
            <span className="text-gray-400">📦</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${activity.progress}%` }}></div>
            </div>
            <span className="text-sm text-gray-700">{activity.progress}%</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
            {activity.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </td>
      </tr>
    );
  };

  const renderExpandedRow = (activity: Activity, index: number) => {
    return (
      <tr key={`${activity.id || index}-expanded`}>
        <td colSpan={6} className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">Activity {activity.order + 1}</h3>
              <button
                onClick={() => archiveActivity(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Archive
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name *</label>
                <input
                  type="text"
                  value={activity.activity_name}
                  onChange={(e) => updateActivity(index, 'activity_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Site excavation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={activity.status}
                  onChange={(e) => updateActivity(index, 'status', e.target.value)}
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
                  onChange={(e) => updateActivity(index, 'start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={activity.end_date}
                  min={activity.start_date}
                  onChange={(e) => updateActivity(index, 'end_date', e.target.value)}
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
                  onChange={(e) => updateActivity(index, 'progress', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={activity.notes}
                  onChange={(e) => updateActivity(index, 'notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Activity notes..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resources</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {activity.resources.map((resource, resourceIndex) =>
                  renderResourceChip(resource, index, resourceIndex)
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedActivityIndex(index);
                  setShowResourcePopover(true);
                }}
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
                        removeImage(index, imageIndex);
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
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleImageUpload(index, e)}
                className="hidden"
                id={`image-upload-${index}`}
              />
              <label
                htmlFor={`image-upload-${index}`}
                className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
              >
                + Add Images
              </label>
            </div>
          </div>
        </td>
      </tr>
    );
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
          title="Activity Schedule"
          subtitle={project?.name || `Project ${resolvedParams.reference}`}
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Activities</h2>
                <Link
                  href={`/admin/projects/${resolvedParams.reference}/schedule/add`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add a New Activity
                </Link>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4">
                  {error}
                </div>
              )}
            </div>

            <div className="p-6">
              {savedActivities.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No activities defined yet. Click "Add a New Activity" to get started.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Activity</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Start Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">End Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Resources</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Progress</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedActivities.filter(a => !a.is_archived).map((activity, index) => renderSavedRow(activity, index))}
                  </tbody>
                </table>
              )}
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hired Tool Name</label>
                          <input
                            type="text"
                            value={newResource.hired_tool_name || ''}
                            onChange={(e) => setNewResource({ ...newResource, hired_tool_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowResourcePopover(false);
                        setNewResource({ resource_type: 'company_tool' });
                        setSelectedActivityIndex(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addResource}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Resource
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedImageIndex !== null && expandedActivityIndex !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImageIndex(null)}>
                <div className="relative max-w-4xl max-h-screen p-4">
                  <img
                    src={activities[expandedActivityIndex].images[selectedImageIndex].image}
                    alt={activities[expandedActivityIndex].images[selectedImageIndex].caption}
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200"
                  >
                    ×
                  </button>
                  <p className="text-white text-center mt-2">{activities[expandedActivityIndex].images[selectedImageIndex].caption}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
