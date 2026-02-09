import { useState, useMemo } from 'react';

/**
 * Calendar component that displays a monthly calendar view
 * Highlights days that have workouts logged
 */
export default function Calendar({ workouts = [] }) {
  // Current date for navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Create a Set of workout dates for quick lookup
  // Format dates as YYYY-MM-DD for comparison
  const workoutDates = useMemo(() => {
    const dates = new Set();
    workouts.forEach(workout => {
      if (workout.date) {
        // Normalize date to YYYY-MM-DD format
        const dateStr = workout.date.split('T')[0]; // Handle ISO strings
        dates.add(dateStr);
      }
    });
    return dates;
  }, [workouts]);

  // Get first day of month and number of days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  // Number of days in the month
  const daysInMonth = lastDay.getDate();

  // Swedish day names (starting with Monday)
  const dayNames = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];

  // Swedish month names
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];

  // Check if a date has a workout
  const hasWorkout = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutDates.has(dateStr);
  };

  // Check if a date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  // We need to show days from previous month to fill the first week
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  // Adjust for Monday as first day (Swedish calendar)
  const startOffset = (firstDayOfWeek + 6) % 7; // Convert Sunday=0 to Monday=0
  
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }

  // Add all days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Föregående månad"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Nästa månad"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            // Empty cell for days outside current month
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const hasWorkoutOnDay = hasWorkout(day);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day}
              className={`
                aspect-square flex items-center justify-center rounded-lg
                transition-colors relative
                ${hasWorkoutOnDay
                  ? 'bg-blue-100 border-2 border-blue-500 font-semibold text-blue-900'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }
                ${isTodayDate ? 'ring-2 ring-blue-300' : ''}
              `}
              title={hasWorkoutOnDay ? `Gympass den ${day}` : ''}
            >
              <span className={isTodayDate && !hasWorkoutOnDay ? 'font-semibold' : ''}>
                {day}
              </span>
              {/* Small indicator dot for workout days */}
              {hasWorkoutOnDay && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
          <span>Gympass</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 rounded ring-2 ring-blue-300"></div>
          <span>Idag</span>
        </div>
      </div>
    </div>
  );
}
