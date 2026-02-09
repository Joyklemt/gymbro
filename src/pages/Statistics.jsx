import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loadWorkouts } from '../utils/storage';
import { getTotalWorkouts, getTrainingFrequency, getMostCommonExercises } from '../utils/calculations';

/**
 * Statistics page - Overview of training statistics
 */
export default function Statistics() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    frequency: { perWeek: 0, perMonth: 0 },
    mostCommon: []
  });

  useEffect(() => {
    const workouts = loadWorkouts();
    const total = getTotalWorkouts(workouts);
    const frequency = getTrainingFrequency(workouts);
    const mostCommon = getMostCommonExercises(workouts, 10);

    setStats({
      totalWorkouts: total,
      frequency,
      mostCommon
    });
  }, []);

  // Prepare chart data for most common exercises
  const chartData = stats.mostCommon.map(ex => ({
    name: ex.name.length > 15 ? ex.name.substring(0, 15) + '...' : ex.name,
    fullName: ex.name,
    count: ex.count
  }));

  if (stats.totalWorkouts === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Statistik</h1>
        <p className="text-gray-600 mb-8">Inga data att visa ännu.</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Statistik</h1>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Totalt Antal Pass</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalWorkouts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pass per Vecka</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.frequency.perWeek}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pass per Månad</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.frequency.perMonth}</p>
        </div>
      </div>

      {/* Most Common Exercises Chart */}
      {stats.mostCommon.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mest Tränade Övningar</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis label={{ value: 'Antal Pass', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [value, 'Antal Pass']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Antal Pass" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Most Common Exercises List */}
      {stats.mostCommon.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Övningar</h2>
          <div className="space-y-2">
            {stats.mostCommon.map((exercise, index) => (
              <div key={exercise.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-8">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{exercise.name}</span>
                </div>
                <span className="text-gray-600 font-semibold">{exercise.count} pass</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
