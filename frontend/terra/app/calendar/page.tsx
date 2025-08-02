'use client';

import Calendar from '../components/Calendar';

export default function CalendarPage() {
  const handleNavigateToPharmacy = () => {
    window.location.href = '/';
  };

  return <Calendar onNavigateToPharmacy={handleNavigateToPharmacy} />;
}
