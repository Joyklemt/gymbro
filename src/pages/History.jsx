import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadWorkouts, deleteWorkout } from '../utils/storage';

/**
 * History page - Display all workouts sorted by date
 */
export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadWorkoutsData();
  }, []);

  const loadWorkoutsData = () => {
    const data = loadWorkouts();
    // Sort by date (newest first)
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setWorkouts(sorted);
  };

  const handleDelete = (workoutId) => {
    if (window.confirm('Är du säker på att du vill ta bort detta pass?')) {
      deleteWorkout(workoutId);
      loadWorkoutsData();
      if (expandedId === workoutId) {
        setExpandedId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const toggleExpand = (workoutId) => {
    setExpandedId(expandedId === workoutId ? null : workoutId);
  };

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Historik</h1>
        <p className="text-gray-600 mb-8">Inga pass loggade ännu.</p>
        <Link
          to="/log"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Logga Ditt Första Pass
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Historik</h1>
      <p className="text-gray-600 mb-6">Totalt {workouts.length} pass loggade</p>

      <div className="space-y-4">
        {workouts.map(workout => (
          <div
            key={workout.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Workout Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(workout.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {workout.name || formatDate(workout.date)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {workout.name && <span className="text-gray-500">{formatDate(workout.date)} • </span>}
                    {workout.exercises?.length || 0} övningar
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {workout.notes && (
                    <span className="text-xs text-gray-500">📝</span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === workout.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === workout.id && (
              <div className="px-4 pb-4 border-t border-gray-200">
                {/* Exercises */}
                <div className="mt-4 space-y-4">
                  {workout.exercises?.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{exercise.name}</h4>
                      <div className="space-y-1">
                        {exercise.sets?.map((set, setIndex) => (
                          <div key={setIndex} className="text-sm text-gray-700">
                            Set {set.setNumber || setIndex + 1}: {set.weight} kg × {set.reps} reps
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {workout.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{workout.notes}</p>
                  </div>
                )}

                {/* Delete Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(workout.id);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Ta bort pass
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
