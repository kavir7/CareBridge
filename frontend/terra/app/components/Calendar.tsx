import { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'appointment' | 'medication' | 'ai-checkin' | 'doctor-followup';
  location?: string;
  medicationDose?: string;
  instructions?: string;
  expiryDate?: Date;
  description?: string;
  isRecurring?: boolean;
  canAdjustTime?: boolean;
}

interface UserDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UserDetailsPopup({ isOpen, onClose, onSuccess }: UserDetailsPopupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    allergies: '',
    medications: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Patient Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
            <textarea
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CalendarProps {
  onNavigateToPharmacy?: () => void;
  onNavigateToAIMeeting?: () => void;
}

export default function Calendar({ onNavigateToPharmacy, onNavigateToAIMeeting }: CalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTimeAdjustModal, setShowTimeAdjustModal] = useState(false);
  const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
  const [aiCheckinTime, setAiCheckinTime] = useState('09:00');
  const [doctorFollowupTime, setDoctorFollowupTime] = useState('14:00');
  const [doctorFrequency, setDoctorFrequency] = useState('biweekly');

  // Generate AI check-ins and doctor follow-ups
  const generateRecurringEvents = useCallback(() => {
    const recurringEvents: CalendarEvent[] = [];
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); // Next 3 months

    // Generate daily AI recovery check-ins
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const [hours, minutes] = aiCheckinTime.split(':').map(Number);
      const checkinStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes);
      const checkinEnd = new Date(checkinStart.getTime() + 15 * 60000); // 15 minutes

      recurringEvents.push({
        id: `ai-checkin-${d.toISOString().split('T')[0]}`,
        title: 'AI Recovery Check-in',
        start: checkinStart,
        end: checkinEnd,
        type: 'ai-checkin',
        description: 'Daily AI-powered recovery assessment and support',
        instructions: 'Complete your daily wellness questionnaire and receive personalized recommendations',
        isRecurring: true,
        canAdjustTime: true,
      });
    }

    // Generate biweekly doctor follow-ups
    let followupDate = new Date(today);
    // Start from next Monday
    followupDate.setDate(followupDate.getDate() + (1 + 7 - followupDate.getDay()) % 7);

    while (followupDate <= endDate) {
      const [hours, minutes] = doctorFollowupTime.split(':').map(Number);
      const followupStart = new Date(followupDate.getFullYear(), followupDate.getMonth(), followupDate.getDate(), hours, minutes);
      const followupEnd = new Date(followupStart.getTime() + 30 * 60000); // 30 minutes

      recurringEvents.push({
        id: `doctor-followup-${followupDate.toISOString().split('T')[0]}`,
        title: 'Doctor Follow-up',
        start: followupStart,
        end: followupEnd,
        type: 'doctor-followup',
        location: 'CareBridge Telehealth',
        description: 'Biweekly check-in with your healthcare provider',
        instructions: 'Review recovery progress, medication adjustments, and address any concerns',
        isRecurring: true,
        canAdjustTime: true,
      });

      // Next follow-up in 2 weeks
      followupDate.setDate(followupDate.getDate() + 14);
    }

    return recurringEvents;
  }, [aiCheckinTime, doctorFollowupTime]);

  // Sample events for demonstration
  const staticEvents: CalendarEvent[] = useMemo(() => [
    {
      id: '1',
      title: 'Annual Check-up',
      start: new Date(2025, 7, 5, 10, 0),
      end: new Date(2025, 7, 5, 11, 0),
      type: 'appointment',
      location: 'City Medical Center',
      description: 'Routine annual physical examination',
    },
    {
      id: '2',
      title: 'Blood Pressure Medication',
      start: new Date(2025, 7, 3, 8, 0),
      end: new Date(2025, 7, 3, 8, 15),
      type: 'medication',
      medicationDose: '10mg Lisinopril',
      instructions: 'Take with food, once daily in the morning',
      expiryDate: new Date(2025, 11, 15),
    },
    {
      id: '3',
      title: 'Blood Test - Lipid Panel',
      start: new Date(2025, 7, 8, 14, 30),
      end: new Date(2025, 7, 8, 15, 30),
      type: 'appointment',
      location: 'LabCorp - Downtown',
      description: 'Fasting required - no food 12 hours prior',
    },
    {
      id: '4',
      title: 'Vitamin D Supplement',
      start: new Date(2025, 7, 2, 9, 0),
      end: new Date(2025, 7, 2, 9, 5),
      type: 'medication',
      medicationDose: '1000 IU',
      instructions: 'Take daily with breakfast',
      expiryDate: new Date(2026, 2, 20),
    },
    {
      id: '5',
      title: 'Cardiology Consultation',
      start: new Date(2025, 7, 12, 15, 0),
      end: new Date(2025, 7, 12, 16, 0),
      type: 'appointment',
      location: 'Heart Specialists Clinic',
      description: 'Follow-up consultation for heart health',
    },
  ], []);

  // Combine static events with recurring events
  const events: CalendarEvent[] = useMemo(() => [
    ...staticEvents,
    ...generateRecurringEvents(),
  ], [staticEvents, generateRecurringEvents]);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  // Custom event style getter for color coding
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#6b7280';
    let borderColor = '#6b7280';

    if (event.type === 'appointment') {
      backgroundColor = '#4b5563';
      borderColor = '#374151';
    } else if (event.type === 'medication') {
      backgroundColor = '#6b7280';
      borderColor = '#4b5563';
    } else if (event.type === 'ai-checkin') {
      backgroundColor = '#9ca3af';
      borderColor = '#6b7280';
    } else if (event.type === 'doctor-followup') {
      backgroundColor = '#374151';
      borderColor = '#1f2937';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: '1px solid ' + borderColor,
        borderRadius: '4px',
        fontSize: '12px',
      },
    };
  }, []);

  // Custom event component for detailed display
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="text-xs p-1">
      <div className="font-medium truncate">{event.title}</div>
      {event.location && <div className="text-white/80 truncate">{event.location}</div>}
      {event.medicationDose && <div className="text-white/80 truncate">{event.medicationDose}</div>}
    </div>
  );

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const openTimeAdjustModal = () => {
    setShowTimeAdjustModal(true);
    setShowEventModal(false);
  };

  const handleJoinAIMeeting = () => {
    if (onNavigateToAIMeeting) {
      onNavigateToAIMeeting();
    } else {
      // Navigate directly to the AI meeting URL
      window.location.href = 'http://localhost:3000/meetingwithAI';
    }
    closeModal();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Medical Calendar</h1>
              <p className="text-gray-600 mt-1">Healthcare schedule management</p>
            </div>
            <div className="flex space-x-3">
              {onNavigateToPharmacy && (
                <button
                  onClick={onNavigateToPharmacy}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  Find Pharmacy
                </button>
              )}
              <button
                onClick={() => setShowUserDetailsPopup(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                Patient Details
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400">
                Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-600 rounded-sm mr-2"></div>
                <span className="text-gray-700 font-medium">Appointments</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-sm mr-2"></div>
                <span className="text-gray-700 font-medium">Medications</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-sm mr-2"></div>
                <span className="text-gray-700 font-medium">AI Check-ins</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-800 rounded-sm mr-2"></div>
                <span className="text-gray-700 font-medium">Doctor Follow-ups</span>
              </div>
            </div>
            <button
              onClick={() => setShowTimeAdjustModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              Adjust Times
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              view={view}
              date={date}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              onSelectEvent={handleSelectEvent}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
              }}
              popup
              showMultiDayTimes
              step={15}
              timeslots={4}
              className="anthropic-calendar"
            />
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            <span className="text-sm text-gray-600">
              {events.filter(event => event.start >= new Date()).length} total
            </span>
          </div>
          <div className="space-y-3">
            {events
              .filter(event => event.start >= new Date())
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .slice(0, 5)
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-sm ${event.type === 'appointment' ? 'bg-gray-600'
                      : event.type === 'medication' ? 'bg-gray-500'
                        : event.type === 'ai-checkin' ? 'bg-gray-400'
                          : 'bg-gray-800'
                      }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {moment(event.start).format('MMM D, YYYY [at] h:mm A')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {event.location && (
                      <span className="text-xs text-gray-500">{event.location}</span>
                    )}
                    {event.medicationDose && (
                      <span className="text-xs text-gray-500">{event.medicationDose}</span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded ${event.type === 'appointment'
                      ? 'bg-gray-100 text-gray-700'
                      : event.type === 'medication'
                        ? 'bg-gray-100 text-gray-700'
                        : event.type === 'ai-checkin'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                      {event.type === 'appointment' ? 'Appointment'
                        : event.type === 'medication' ? 'Medication'
                          : event.type === 'ai-checkin' ? 'AI Check-in'
                            : 'Doctor Follow-up'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-sm mr-3 ${selectedEvent.type === 'appointment' ? 'bg-gray-600'
                  : selectedEvent.type === 'medication' ? 'bg-gray-500'
                    : selectedEvent.type === 'ai-checkin' ? 'bg-gray-400'
                      : 'bg-gray-800'
                  }`}></div>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {selectedEvent.type === 'appointment' ? 'Appointment'
                    : selectedEvent.type === 'medication' ? 'Medication'
                      : selectedEvent.type === 'ai-checkin' ? 'AI Check-in'
                        : 'Doctor Follow-up'}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {moment(selectedEvent.start).format('MMMM Do, YYYY [at] h:mm A')}
                </p>
              </div>

              {selectedEvent.location && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
                  <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.medicationDose && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Dosage</p>
                  <p className="text-sm text-gray-600">{selectedEvent.medicationDose}</p>
                </div>
              )}

              {selectedEvent.instructions && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Instructions</p>
                  <p className="text-sm text-gray-600">{selectedEvent.instructions}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.expiryDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Expiry Date</p>
                  <p className="text-sm text-gray-600">
                    {moment(selectedEvent.expiryDate).format('MMMM Do, YYYY')}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                Close
              </button>
              {selectedEvent.canAdjustTime && (
                <button
                  onClick={openTimeAdjustModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  Adjust Time
                </button>
              )}
              {selectedEvent.type === 'ai-checkin' && (
                <button
                  onClick={handleJoinAIMeeting}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  Join Meeting
                </button>
              )}
              <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400">
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Adjustment Modal */}
      {showTimeAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeAdjustModal(false)}>
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Adjust Check-in Times</h3>
                <button
                  onClick={() => setShowTimeAdjustModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Recovery Check-in Time
                </label>
                <input
                  type="time"
                  value={aiCheckinTime}
                  onChange={(e) => setAiCheckinTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Daily AI-powered wellness check-ins</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Follow-up Time
                </label>
                <input
                  type="time"
                  value={doctorFollowupTime}
                  onChange={(e) => setDoctorFollowupTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Visit Frequency
                </label>
                <select
                  value={doctorFrequency}
                  onChange={(e) => setDoctorFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Every 3 months</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How often to schedule doctor consultations</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowTimeAdjustModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTimeAdjustModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Popup */}
      <UserDetailsPopup
        isOpen={showUserDetailsPopup}
        onClose={() => setShowUserDetailsPopup(false)}
        onSuccess={() => {
          console.log('Patient details saved successfully!');
        }}
      />

      {/* Custom CSS for calendar styling */}
      <style jsx global>{`
        .anthropic-calendar .rbc-calendar {
          font-family: inherit;
          font-size: 14px;
        }
        
        .anthropic-calendar .rbc-header {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 8px;
          font-weight: 500;
          color: #374151;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        
        .anthropic-calendar .rbc-today {
          background: #f3f4f6;
        }
        
        .anthropic-calendar .rbc-off-range-bg {
          background-color: #fafafa;
        }
        
        .anthropic-calendar .rbc-toolbar {
          margin-bottom: 24px;
          padding: 0;
        }
        
        .anthropic-calendar .rbc-toolbar button {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        
        .anthropic-calendar .rbc-toolbar button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        
        .anthropic-calendar .rbc-toolbar button.rbc-active {
          background: #111827;
          color: white;
          border-color: #111827;
        }
        
        .anthropic-calendar .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 500;
          color: #111827;
        }
        
        .anthropic-calendar .rbc-month-view,
        .anthropic-calendar .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .anthropic-calendar .rbc-date-cell {
          padding: 8px;
        }
        
        .anthropic-calendar .rbc-date-cell > a {
          color: #374151;
          font-weight: 500;
        }
        
        .anthropic-calendar .rbc-event {
          border-radius: 4px;
          border: none;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .anthropic-calendar .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }
        
        .anthropic-calendar .rbc-time-header {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .anthropic-calendar .rbc-time-content {
          border-top: none;
        }
        
        .anthropic-calendar .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }
        
        .anthropic-calendar .rbc-timeslot-group {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .anthropic-calendar .rbc-current-time-indicator {
          background-color: #111827;
          height: 2px;
        }
        
        @media (max-width: 768px) {
          .anthropic-calendar .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .anthropic-calendar .rbc-toolbar-label {
            text-align: center;
            order: -1;
            margin-bottom: 12px;
            font-size: 16px;
          }
          
          .anthropic-calendar .rbc-btn-group {
            display: flex;
            justify-content: center;
            gap: 8px;
          }
          
          .anthropic-calendar .rbc-toolbar button {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}