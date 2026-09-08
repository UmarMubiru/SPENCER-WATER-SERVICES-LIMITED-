'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '../../components/AdminLayout';
import PageHeader from '../../../../components/admin/ui/PageHeader';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'site_visit' | 'task' | 'follow_up' | 'meeting' | 'quotation_expiry';
  status: string;
  lead_number?: string;
  lead_id?: string;
  project_reference?: string;
  assigned_to?: string;
  quotation_number?: string;
}

export default function CRMCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'follow_up',
    title: '',
    date: '',
    lead_id: '',
    assigned_to: '',
    description: '',
  });

  const loadLeads = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/leads/');
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadLeads();
    loadUsers();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Load site visits
      const siteVisitsResponse = await fetch(`http://127.0.0.1:8000/api/quotations/site-visits/?year=${year}&month=${month}`);
      const tasksResponse = await fetch(`http://127.0.0.1:8000/api/quotations/tasks/?year=${year}&month=${month}`);
      const quotationsResponse = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/?year=${year}&month=${month}`);

      const calendarEvents: CalendarEvent[] = [];

      if (siteVisitsResponse.ok) {
        const data = await siteVisitsResponse.json();
        const siteVisits = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        siteVisits.forEach((sv: any) => {
          calendarEvents.push({
            id: sv.id,
            title: `Site Visit - ${sv.lead_customer_name || sv.project_name}`,
            date: sv.scheduled_date,
            type: 'site_visit',
            status: sv.status,
            lead_number: sv.lead_number,
            lead_id: sv.lead,
            assigned_to: sv.assigned_to_name,
          });
        });
      }

      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        const tasks = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        tasks.forEach((task: any) => {
          if (task.due_date) {
            calendarEvents.push({
              id: task.id,
              title: `${task.task_type === 'follow_up' ? 'Follow Up' : task.task_type === 'meeting' ? 'Meeting' : 'Task'} - ${task.title}`,
              date: task.due_date,
              type: task.task_type === 'follow_up' ? 'follow_up' : task.task_type === 'meeting' ? 'meeting' : 'task',
              status: task.status,
              lead_number: task.lead_number,
              lead_id: task.lead,
              project_reference: task.project_reference,
              assigned_to: task.assigned_to_name,
            });
          }
        });
      }

      // Load quotation expiry dates
      if (quotationsResponse.ok) {
        const data = await quotationsResponse.json();
        const quotations = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        quotations.forEach((quot: any) => {
          if (quot.valid_until && quot.status === 'sent') {
            const expiryDate = new Date(quot.valid_until);
            if (expiryDate.getFullYear() === year && expiryDate.getMonth() + 1 === month) {
              calendarEvents.push({
                id: `expiry-${quot.id}`,
                title: `Quotation Expiry - ${quot.quotation_number}`,
                date: quot.valid_until,
                type: 'quotation_expiry',
                status: 'pending',
                quotation_number: quot.quotation_number,
                lead_id: quot.lead,
              });
            }
          }
        });
      }

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date.startsWith(dateStr));
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'site_visit': 'bg-blue-100 text-blue-800 border-blue-300',
      'task': 'bg-blue-100 text-blue-800 border-blue-300',
      'follow_up': 'bg-sky-100 text-sky-800 border-sky-300',
      'meeting': 'bg-purple-100 text-purple-800 border-purple-300',
      'quotation_expiry': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[type] || 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-blue-100 text-blue-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Only include lead if it's a valid UUID
      const payload: any = {
        title: newEvent.title,
        task_type: newEvent.type,
        description: newEvent.description,
        status: 'pending',
      };
      
      // Only add due_date if provided
      if (newEvent.date) {
        payload.due_date = newEvent.date;
      }
      
      // Only add lead if it's a valid UUID (not empty string)
      if (newEvent.lead_id && newEvent.lead_id.trim() !== '') {
        payload.lead = newEvent.lead_id;
      }
      
      // Only add assigned_to if it's a valid UUID (not empty string)
      if (newEvent.assigned_to && newEvent.assigned_to.trim() !== '') {
        payload.assigned_to = newEvent.assigned_to;
      }
      
      console.log('Creating event with payload:', payload);
      
      const response = await fetch('http://127.0.0.1:8000/api/quotations/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        // Track event creation in analytics
        await fetch('http://127.0.0.1:8000/api/analytics/calendar/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: newEvent.type,
            action: 'created',
            period: 'monthly',
            period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
          }),
        }).catch(err => console.error('Analytics tracking failed:', err));
        
        loadEvents();
        setShowCreateModal(false);
        setNewEvent({ type: 'follow_up', title: '', date: '', lead_id: '', assigned_to: '', description: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create event:', response.statusText, errorData);
        alert(`Failed to create event: ${JSON.stringify(errorData) || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please check the console for details.');
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteEvent = async (eventId: string, eventType: string) => {
    try {
      if (eventType === 'site_visit') {
        const response = await fetch(`http://127.0.0.1:8000/api/quotations/site-visits/${eventId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed', completed_date: new Date().toISOString().split('T')[0] }),
        });
        if (response.ok) {
          // Track event completion in analytics
          await fetch('http://127.0.0.1:8000/api/analytics/calendar/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: eventType,
              action: 'completed',
              period: 'monthly',
              period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
              period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
            }),
          }).catch(err => console.error('Analytics tracking failed:', err));
          loadEvents();
        }
      } else if (eventType === 'task' || eventType === 'follow_up' || eventType === 'meeting') {
        const response = await fetch(`http://127.0.0.1:8000/api/quotations/tasks/${eventId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed', completed_date: new Date().toISOString() }),
        });
        if (response.ok) {
          // Track event completion in analytics
          await fetch('http://127.0.0.1:8000/api/analytics/calendar/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: eventType,
              action: 'completed',
              period: 'monthly',
              period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
              period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
            }),
          }).catch(err => console.error('Analytics tracking failed:', err));
          loadEvents();
        }
      }
    } catch (error) {
      console.error('Error completing event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventType: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      if (eventType === 'site_visit') {
        const response = await fetch(`http://127.0.0.1:8000/api/quotations/site-visits/${eventId}/`, {
          method: 'DELETE',
        });
        if (response.ok) loadEvents();
      } else if (eventType === 'task' || eventType === 'follow_up' || eventType === 'meeting') {
        const response = await fetch(`http://127.0.0.1:8000/api/quotations/tasks/${eventId}/`, {
          method: 'DELETE',
        });
        if (response.ok) loadEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <AdminLayout
      title="CRM Calendar"
      subtitle="View and manage your schedule"
      activePath="/admin/crm/calendar"
    >
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-700 transition"
          >
            New Event
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
            >
              ←
            </button>
            <h2 className="font-semibold text-blue-900 text-base">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-blue-600 py-1.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-24 bg-blue-50 rounded-lg" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                const dayEvents = getEventsForDate(dayDate);
                const isToday = dayDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={i}
                    className={`min-h-24 p-2 border border-blue-100 rounded-lg ${
                      isToday ? 'bg-blue-100 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className={`text-xs font-semibold mb-1.5 ${isToday ? 'text-blue-600' : 'text-blue-900'}`}>
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${getEventTypeColor(event.type)} truncate`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-blue-400">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 px-4 py-2.5">
            <h3 className="font-semibold text-blue-900 text-base">Upcoming Events</h3>
          </div>
          <div className="p-4">
            {events.length === 0 ? (
              <div className="text-center text-blue-400 py-6 text-sm">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="space-y-2">
                {events
                  .filter(e => new Date(e.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(event.type)} shrink-0`}>
                            {event.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)} shrink-0`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="font-medium text-blue-900 truncate text-sm">{event.title}</div>
                        <div className="text-blue-600 text-xs">
                          {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-3">
                        {event.type !== 'quotation_expiry' && event.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteEvent(event.id, event.type)}
                            className="px-2 py-1 text-xs text-green-600 hover:text-green-700 border border-green-300 rounded hover:bg-green-50"
                          >
                            Complete
                          </button>
                        )}
                        {event.type !== 'quotation_expiry' && (
                          <button
                            onClick={() => handleDeleteEvent(event.id, event.type)}
                            className="px-2 py-1 text-xs text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                        {event.lead_number && (
                          <Link
                            href={`/admin/crm/leads/${event.lead_id}`}
                            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
