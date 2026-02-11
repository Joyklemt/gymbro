import { Link } from 'react-router-dom';
import { loadWorkouts } from '../utils/storage';
import { getTotalWorkouts, getTrainingFrequency } from '../utils/calculations';
import { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';

/**
 * Home page - Dashboard with quick stats
 */
export default function Home() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    frequency: { perWeek: 0, perMonth: 0 },
    lastWorkoutDate: null
  });
  const [workouts, setWorkouts] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const loadedWorkouts = loadWorkouts();
    setWorkouts(loadedWorkouts);
    
    const total = getTotalWorkouts(loadedWorkouts);
    const frequency = getTrainingFrequency(loadedWorkouts);
    
    // Get last workout date
    let lastDate = null;
    if (loadedWorkouts.length > 0) {
      const sorted = [...loadedWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date));
      lastDate = sorted[0].date;
    }

    setStats({
      totalWorkouts: total,
      frequency,
      lastWorkoutDate: lastDate
    });
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Inga pass ännu';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Count workouts in current month for calendar button summary
  const getCurrentMonthWorkoutCount = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return workouts.filter(workout => {
      if (!workout.date) return false;
      const workoutDate = new Date(workout.date);
      return workoutDate.getFullYear() === currentYear && 
             workoutDate.getMonth() === currentMonth;
    }).length;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Välkommen till Spotter
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Din personliga gymprogress-tracker
        </p>
        <Link
          to="/log"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          Logga Nytt Pass
        </Link>
      </div>

      {/* Calendar View - Collapsible */}
      <div>
        {!isCalendarOpen ? (
          // Calendar button - collapsed state
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="w-full bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left border-2 border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Kalendervy
                </h3>
                <p className="text-gray-600">
                  {getCurrentMonthWorkoutCount() > 0 
                    ? `${getCurrentMonthWorkoutCount()} pass denna månad`
                    : 'Inga pass denna månad'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <span className="text-sm font-medium">Visa kalender</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ) : (
          // Calendar - expanded state
          <div className="relative">
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
              aria-label="Stäng kalender"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Calendar workouts={workouts} />
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Workouts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Totalt Antal Pass</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalWorkouts}</p>
        </div>

        {/* Last Workout */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Senaste Pass</h3>
          <p className="text-lg font-semibold text-gray-900">{formatDate(stats.lastWorkoutDate)}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/history"
          className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Visa Historik</h3>
          <p className="text-gray-600">Se alla dina träningspass</p>
        </Link>

        <Link
          to="/exercises"
          className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Övningsprogression</h3>
          <p className="text-gray-600">Följ din utveckling per övning</p>
        </Link>
      </div>
    </div>
  );
}
