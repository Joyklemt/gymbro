import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loadWorkouts } from '../utils/storage';
import { getAllExercises, getExerciseHistory, calculatePR } from '../utils/calculations';

/**
 * Exercises page - View exercise progression with charts
 */
export default function Exercises() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [history, setHistory] = useState([]);
  const [prs, setPRs] = useState(null);

  useEffect(() => {
    const data = loadWorkouts();
    setWorkouts(data);
    const exerciseList = getAllExercises(data);
    setExercises(exerciseList);
    
    // Auto-select first exercise if available
    if (exerciseList.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseList[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      const exerciseHistory = getExerciseHistory(workouts, selectedExercise);
      setHistory(exerciseHistory);
      
      const prData = calculatePR(workouts, selectedExercise);
      setPRs(prData);
    }
  }, [selectedExercise, workouts]);

  // Prepare chart data - show max weight per workout
  const chartData = history.map(item => {
    const maxWeight = Math.max(...item.sets.map(s => s.weight));
    const avgWeight = item.sets.reduce((sum, s) => sum + s.weight, 0) / item.sets.length;
    return {
      date: new Date(item.date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
      fullDate: item.date,
      maxWeight,
      avgWeight: Math.round(avgWeight * 10) / 10
    };
  }).reverse(); // Reverse to show oldest first

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Övningsprogression</h1>
        <p className="text-gray-600 mb-8">Inga övningar loggade ännu.</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Övningsprogression</h1>

      {/* Exercise Selector */}
      <div className="mb-6">
        <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-2">
          Välj Övning
        </label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {exercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      {selectedExercise && (
        <>
          {/* PR Display */}
          {prs && (prs.maxWeight || prs.maxReps || prs.maxVolume) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {prs.maxWeight && (
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Max Vikt</h3>
                  <p className="text-2xl font-bold text-gray-900">{prs.maxWeight} kg</p>
                </div>
              )}
              {prs.maxReps && (
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Max Reps</h3>
                  <p className="text-2xl font-bold text-gray-900">{prs.maxReps} reps</p>
                </div>
              )}
              {prs.maxVolume && (
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Max Volym</h3>
                  <p className="text-2xl font-bold text-gray-900">{prs.maxVolume} kg</p>
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Viktprogression</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Vikt (kg)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Max Vikt"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgWeight" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Medelvikt"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History List */}
          <div className="bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 p-6 pb-4 border-b border-gray-200">
              Historik
            </h2>
            <div className="divide-y divide-gray-200">
              {history.length === 0 ? (
                <p className="p-6 text-gray-600">Ingen historik för denna övning ännu.</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{formatDate(item.date)}</h3>
                    </div>
                    <div className="space-y-1">
                      {item.sets.map((set, setIndex) => (
                        <div key={setIndex} className="text-sm text-gray-700">
                          Set {set.setNumber || setIndex + 1}: {set.weight} kg × {set.reps} reps
                          {set.weight * set.reps > 0 && (
                            <span className="text-gray-500 ml-2">
                              ({set.weight * set.reps} kg totalt)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
