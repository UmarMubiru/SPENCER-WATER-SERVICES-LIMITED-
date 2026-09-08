'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface SiteVisit {
  id: string;
  lead: string;
  lead_number: string;
  lead_customer_name: string;
  scheduled_date: string;
  completed_date: string | null;
  engineer: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_accuracy: string | null;
  ground_conditions: string | null;
  water_source: string | null;
  depth_estimate: string | null;
  recommendations: string | null;
  site_area_size: string | null;
  elevation: string | null;
  distance_to_road: string | null;
  accessibility_notes: string | null;
  photo_1: string | null;
  photo_2: string | null;
  photo_3: string | null;
  photo_4: string | null;
  photo_5: string | null;
  weather_conditions: string | null;
  soil_type: string | null;
  vegetation: string | null;
  nearby_structures: string | null;
  utilities_present: string | null;
  status: string;
}

export default function SiteVisitFormPage() {
  const params = useParams();
  const router = useRouter();
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    ground_conditions: '',
    water_source: '',
    depth_estimate: '',
    recommendations: '',
    site_area_size: '',
    elevation: '',
    distance_to_road: '',
    accessibility_notes: '',
    weather_conditions: '',
    soil_type: '',
    vegetation: '',
    nearby_structures: '',
    utilities_present: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (params.id) {
      loadSiteVisit(params.id as string);
    }
  }, [params.id]);

  const loadSiteVisit = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/site-visits/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setSiteVisit(data);
        setFormData({
          ground_conditions: data.ground_conditions || '',
          water_source: data.water_source || '',
          depth_estimate: data.depth_estimate || '',
          recommendations: data.recommendations || '',
          site_area_size: data.site_area_size || '',
          elevation: data.elevation || '',
          distance_to_road: data.distance_to_road || '',
          accessibility_notes: data.accessibility_notes || '',
          weather_conditions: data.weather_conditions || '',
          soil_type: data.soil_type || '',
          vegetation: data.vegetation || '',
          nearby_structures: data.nearby_structures || '',
          utilities_present: data.utilities_present || '',
        });
      }
    } catch (error) {
      console.error('Error loading site visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
          }));
          setSiteVisit(prev => prev ? {
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            gps_accuracy: `${position.coords.accuracy}m`,
          } : null);
          setGpsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get GPS location. Please enable location services.');
          setGpsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGpsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newPhotos = [...photos];
      newPhotos[index] = file;
      setPhotos(newPhotos);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      if (siteVisit?.latitude) formDataToSend.append('latitude', siteVisit.latitude.toString());
      if (siteVisit?.longitude) formDataToSend.append('longitude', siteVisit.longitude.toString());
      if (siteVisit?.gps_accuracy) formDataToSend.append('gps_accuracy', siteVisit.gps_accuracy);
      
      photos.forEach((photo, index) => {
        if (photo) {
          formDataToSend.append(`photo_${index + 1}`, photo);
        }
      });

      formDataToSend.append('completed_date', new Date().toISOString().split('T')[0]);
      formDataToSend.append('status', 'completed');

      const response = await fetch(`http://127.0.0.1:8000/api/quotations/site-visits/${params.id}/`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Site visit completed successfully!');
        router.push('/admin/crm/dashboard');
      } else {
        alert('Error saving site visit. Please try again.');
      }
    } catch (error) {
      console.error('Error saving site visit:', error);
      alert('Error saving site visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-lg font-bold text-gray-900">Site Visit Report</h1>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Complete'}
            </button>
          </div>
        </div>
      </header>

      {/* Lead Info */}
      {siteVisit && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="font-medium text-gray-900">{siteVisit.lead_customer_name}</div>
            <div className="text-sm text-gray-600">{siteVisit.lead_number}</div>
            <div className="text-sm text-gray-500">Scheduled: {new Date(siteVisit.scheduled_date).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 space-y-4">
        {/* GPS Location */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">GPS Location</h2>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gpsLoading}
            className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{gpsLoading ? 'Getting location...' : '📍 Get Current Location'}</span>
          </button>
          {siteVisit?.latitude && (
            <div className="mt-3 text-sm text-gray-600">
              <div>Latitude: {siteVisit.latitude}</div>
              <div>Longitude: {siteVisit.longitude}</div>
              {siteVisit.gps_accuracy && <div>Accuracy: {siteVisit.gps_accuracy}</div>}
            </div>
          )}
        </div>

        {/* Site Measurements */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Site Measurements</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Area Size</label>
              <input
                type="text"
                value={formData.site_area_size}
                onChange={(e) => setFormData({...formData, site_area_size: e.target.value})}
                placeholder="e.g., 50x30 meters"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Elevation</label>
              <input
                type="text"
                value={formData.elevation}
                onChange={(e) => setFormData({...formData, elevation: e.target.value})}
                placeholder="Elevation above sea level"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance to Road</label>
              <input
                type="text"
                value={formData.distance_to_road}
                onChange={(e) => setFormData({...formData, distance_to_road: e.target.value})}
                placeholder="Distance from main road"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Site Conditions */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Site Conditions</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ground Conditions</label>
              <textarea
                value={formData.ground_conditions}
                onChange={(e) => setFormData({...formData, ground_conditions: e.target.value})}
                rows={3}
                placeholder="Describe ground conditions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <input
                type="text"
                value={formData.soil_type}
                onChange={(e) => setFormData({...formData, soil_type: e.target.value})}
                placeholder="e.g., Clay, Sandy, Loam"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vegetation</label>
              <textarea
                value={formData.vegetation}
                onChange={(e) => setFormData({...formData, vegetation: e.target.value})}
                rows={2}
                placeholder="Describe vegetation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Water Source */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Water Source</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Water Source Description</label>
              <textarea
                value={formData.water_source}
                onChange={(e) => setFormData({...formData, water_source: e.target.value})}
                rows={3}
                placeholder="Describe water source..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depth Estimate</label>
              <input
                type="text"
                value={formData.depth_estimate}
                onChange={(e) => setFormData({...formData, depth_estimate: e.target.value})}
                placeholder="e.g., 50-70 meters"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Accessibility</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Notes</label>
              <textarea
                value={formData.accessibility_notes}
                onChange={(e) => setFormData({...formData, accessibility_notes: e.target.value})}
                rows={3}
                placeholder="Notes about site accessibility for equipment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Structures</label>
              <textarea
                value={formData.nearby_structures}
                onChange={(e) => setFormData({...formData, nearby_structures: e.target.value})}
                rows={2}
                placeholder="Nearby buildings, fences, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilities Present</label>
              <textarea
                value={formData.utilities_present}
                onChange={(e) => setFormData({...formData, utilities_present: e.target.value})}
                rows={2}
                placeholder="Water, electricity, sewer lines nearby"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Weather Conditions</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weather</label>
            <input
              type="text"
              value={formData.weather_conditions}
              onChange={(e) => setFormData({...formData, weather_conditions: e.target.value})}
              placeholder="e.g., Sunny, Cloudy, Rainy"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Site Photos</h2>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo {index}</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoChange(e, index - 1)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {photos[index - 1] && (
                  <div className="mt-2 text-xs text-gray-600">{photos[index - 1].name}</div>
                )}
                {siteVisit && (siteVisit as any)[`photo_${index}`] && !photos[index - 1] && (
                  <div className="mt-2 text-xs text-green-600">✓ Photo uploaded</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Recommendations</h2>
          <textarea
            value={formData.recommendations}
            onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
            rows={4}
            placeholder="Your recommendations for this site..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </form>
    </div>
  );
}
