'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import Link from 'next/link';
import UserDetailsPopup from './UserDetailsPopup';
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

interface CalendarProps {
  onNavigateToPharmacy?: () => void;
}

export default function Calendar({ onNavigateToPharmacy }: CalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTimeAdjustModal, setShowTimeAdjustModal] = useState(false);
  const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
  const [aiCheckinTime, setAiCheckinTime] = useState('09:00');
  const [doctorFollowupTime, setDoctorFollowupTime] = useState('14:00');

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
    {
      id: '6',
      title: 'Insulin Shot',
      start: new Date(2025, 7, 4, 18, 0),
      end: new Date(2025, 7, 4, 18, 5),
      type: 'medication',
      medicationDose: '20 units Humalog',
      instructions: 'Inject 15 minutes before dinner',
      expiryDate: new Date(2025, 9, 30),
    },
    {
      id: '7',
      title: 'Dental Cleaning',
      start: new Date(2025, 7, 15, 11, 0),
      end: new Date(2025, 7, 15, 12, 0),
      type: 'appointment',
      location: 'Bright Smile Dental',
      description: 'Routine dental cleaning and checkup',
    },
    {
      id: '8',
      title: 'Omega-3 Supplement',
      start: new Date(2025, 7, 6, 20, 0),
      end: new Date(2025, 7, 6, 20, 5),
      type: 'medication',
      medicationDose: '1000mg',
      instructions: 'Take with dinner',
      expiryDate: new Date(2026, 1, 10),
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
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (event.type === 'appointment') {
      backgroundColor = '#10b981'; // Green for appointments
      borderColor = '#059669';
    } else if (event.type === 'medication') {
      backgroundColor = '#f59e0b'; // Amber for medications
      borderColor = '#d97706';
    } else if (event.type === 'ai-checkin') {
      backgroundColor = '#8b5cf6'; // Purple for AI check-ins
      borderColor = '#7c3aed';
    } else if (event.type === 'doctor-followup') {
      backgroundColor = '#06b6d4'; // Cyan for doctor follow-ups
      borderColor = '#0891b2';
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
      <div className="font-semibold truncate">{event.title}</div>
      {event.location && <div className="text-white/80 truncate">📍 {event.location}</div>}
      {event.medicationDose && <div className="text-white/80 truncate">💊 {event.medicationDose}</div>}
    </div>
  );

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleTimeAdjustment = (eventType: 'ai-checkin' | 'doctor-followup', newTime: string) => {
    if (eventType === 'ai-checkin') {
      setAiCheckinTime(newTime);
    } else if (eventType === 'doctor-followup') {
      setDoctorFollowupTime(newTime);
    }
    setShowTimeAdjustModal(false);
  };

  const openTimeAdjustModal = () => {
    setShowTimeAdjustModal(true);
    setShowEventModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-full mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Medical Calendar</h1>
              <p className="text-gray-600 mt-2 text-lg">Your personalized healthcare schedule</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {onNavigateToPharmacy && (
                <button
                  onClick={onNavigateToPharmacy}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                >
                  🏥 Find Pharmacy
                </button>
              )}
              <button 
                onClick={() => setShowUserDetailsPopup(true)}
                className="inline-flex items-center justify-center px-6 py-3 border border-green-300 rounded-xl shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:shadow-md"
              >
                👤 Add Patient Details
              </button>
              <button className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md">
                + Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="max-w-full mx-auto px-6 lg:px-12 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-green-800 font-medium">Appointments</span>
              </div>
              <div className="flex items-center bg-amber-50 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-amber-800 font-medium">Medications</span>
              </div>
              <div className="flex items-center bg-purple-50 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-purple-800 font-medium">AI Check-ins</span>
              </div>
              <div className="flex items-center bg-cyan-50 px-3 py-2 rounded-lg">
                <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-cyan-800 font-medium">Doctor Follow-ups</span>
              </div>
            </div>
            <button
              onClick={() => setShowTimeAdjustModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
            >
              ⚙️ Adjust Times
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-full mx-auto px-6 lg:px-12 pb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="p-8">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
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
              className="custom-calendar"
            />
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="max-w-full mx-auto px-6 lg:px-12 pb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Next 5 Events</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {events.filter(event => event.start >= new Date()).length} total upcoming
            </span>
          </div>
          <div className="grid gap-4">
            {events
              .filter(event => event.start >= new Date())
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:from-gray-50 hover:to-gray-100 transition-all duration-200 cursor-pointer border border-gray-200/50 hover:border-gray-300/50 hover:shadow-md" onClick={() => handleSelectEvent(event)}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm ${
                    event.type === 'appointment' ? 'bg-green-500' 
                      : event.type === 'medication' ? 'bg-amber-500'
                      : event.type === 'ai-checkin' ? 'bg-purple-500'
                      : 'bg-cyan-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{event.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {moment(event.start).format('MMMM Do, YYYY [at] h:mm A')}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      {event.location && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="mr-1">📍</span>
                          {event.location}
                        </div>
                      )}
                      {event.medicationDose && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="mr-1">💊</span>
                          {event.medicationDose}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-xs font-semibold rounded-lg shadow-sm ${
                    event.type === 'appointment' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : event.type === 'medication'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : event.type === 'ai-checkin'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                  }`}>
                    {event.type === 'appointment' ? 'Appointment' 
                      : event.type === 'medication' ? 'Medication'
                      : event.type === 'ai-checkin' ? 'AI Check-in'
                      : 'Doctor Follow-up'}
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeModal}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedEvent.type === 'appointment' ? 'bg-green-500' 
                      : selectedEvent.type === 'medication' ? 'bg-amber-500'
                      : selectedEvent.type === 'ai-checkin' ? 'bg-purple-500'
                      : 'bg-cyan-500'
                  }`}></div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedEvent.type === 'appointment' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedEvent.type === 'medication'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedEvent.type === 'ai-checkin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {selectedEvent.type === 'appointment' ? 'Appointment' 
                      : selectedEvent.type === 'medication' ? 'Medication'
                      : selectedEvent.type === 'ai-checkin' ? 'AI Check-in'
                      : 'Doctor Follow-up'}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Date & Time</p>
                  <p className="text-sm text-gray-600">
                    {moment(selectedEvent.start).format('MMMM Do, YYYY [at] h:mm A')}
                  </p>
                </div>

                {selectedEvent.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">📍 {selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.medicationDose && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dosage</p>
                    <p className="text-sm text-gray-600">💊 {selectedEvent.medicationDose}</p>
                  </div>
                )}

                {selectedEvent.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Instructions</p>
                    <p className="text-sm text-gray-600">{selectedEvent.instructions}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.expiryDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                    <p className="text-sm text-gray-600">
                      {moment(selectedEvent.expiryDate).format('MMMM Do, YYYY')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
                {selectedEvent.canAdjustTime && (
                  <button 
                    onClick={openTimeAdjustModal}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Adjust Time
                  </button>
                )}
                {selectedEvent.type === 'ai-checkin' && (
                  <Link href={`/meetingwithAI?eventId=${selectedEvent.id}`} passHref>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Join Meeting
                    </button>
                  </Link>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Adjustment Modal */}
      {showTimeAdjustModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowTimeAdjustModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adjust Check-in Times</h3>
                <button
                  onClick={() => setShowTimeAdjustModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🤖 AI Recovery Check-in Time
                  </label>
                  <input
                    type="time"
                    value={aiCheckinTime}
                    onChange={(e) => setAiCheckinTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Daily AI-powered wellness check-ins</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👨‍⚕️ Doctor Follow-up Time
                  </label>
                  <input
                    type="time"
                    value={doctorFollowupTime}
                    onChange={(e) => setDoctorFollowupTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Biweekly doctor consultations</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTimeAdjustModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowTimeAdjustModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for calendar styling */}
      <style jsx global>{`
        .custom-calendar .rbc-calendar {
          font-family: inherit;
          font-size: 14px;
        }
        
        .custom-calendar .rbc-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 8px;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .custom-calendar .rbc-today {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }
        
        .custom-calendar .rbc-off-range-bg {
          background-color: #f8fafc;
        }
        
        .custom-calendar .rbc-toolbar {
          margin-bottom: 24px;
          padding: 0 4px;
        }
        
        .custom-calendar .rbc-toolbar button {
          border: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          color: #475569;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .custom-calendar .rbc-toolbar button:hover {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: #2563eb;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
        }
        
        .custom-calendar .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }
        
        .custom-calendar .rbc-month-view,
        .custom-calendar .rbc-time-view {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .custom-calendar .rbc-date-cell {
          padding: 8px;
        }
        
        .custom-calendar .rbc-date-cell > a {
          color: #475569;
          font-weight: 500;
        }
        
        .custom-calendar .rbc-event {
          border-radius: 8px;
          border: none;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .custom-calendar .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f1f5f9;
        }
        
        @media (max-width: 768px) {
          .custom-calendar .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .custom-calendar .rbc-toolbar-label {
            text-align: center;
            order: -1;
            margin-bottom: 12px;
            font-size: 16px;
          }
          
          .custom-calendar .rbc-btn-group {
            display: flex;
            justify-content: center;
            gap: 8px;
          }
          
          .custom-calendar .rbc-toolbar button {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      `}</style>

      {/* User Details Popup */}
      <UserDetailsPopup 
        isOpen={showUserDetailsPopup}
        onClose={() => setShowUserDetailsPopup(false)}
        onSuccess={() => {
          console.log('Patient details saved successfully!');
        }}
      />
    </div>
  );
}
