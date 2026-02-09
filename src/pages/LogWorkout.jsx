import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWorkout, loadWorkouts } from '../utils/storage';
import { getLastWorkoutForExercise, getLastWorkoutByName } from '../utils/calculations';

/**
 * Log Workout page - Form to log a new workout
 * This is the core functionality as specified in the plan
 */
export default function LogWorkout() {
  const navigate = useNavigate();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(today);
  const [workoutName, setWorkoutName] = useState(''); // Name for the workout (e.g., "Bröst och Triceps")
  const [exercises, setExercises] = useState([
    { name: '', sets: [{ setNumber: '', weight: '', reps: '' }] }
  ]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [allWorkouts, setAllWorkouts] = useState([]); // Store all workouts to check for previous exercises

  // Load workouts when component mounts
  useEffect(() => {
    const workouts = loadWorkouts();
    setAllWorkouts(workouts);
  }, []);

  // Add a new exercise
  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ setNumber: '', weight: '', reps: '' }] }]);
  };

  // Remove an exercise
  const removeExercise = (index) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  // Update exercise name
  const updateExerciseName = (index, name) => {
    const updated = [...exercises];
    updated[index].name = name;
    setExercises(updated);
  };

  // Add a set to an exercise
  // Set number is optional - user can specify which set number it is (e.g., Set 1, Set 2)
  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ setNumber: '', weight: '', reps: '' });
    setExercises(updated);
  };

  // Remove a set from an exercise
  const removeSet = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    if (updated[exerciseIndex].sets.length > 1) {
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      setExercises(updated);
    }
  };

  // Update set values
  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  // Copy values from last workout for an exercise
  const copyLastWorkoutValues = (exerciseIndex) => {
    const exerciseName = exercises[exerciseIndex].name.trim();
    if (!exerciseName) return;

    const lastWorkout = getLastWorkoutForExercise(allWorkouts, exerciseName);
    if (!lastWorkout || !lastWorkout.sets || lastWorkout.sets.length === 0) return;

    // Create new sets array from last workout
    const newSets = lastWorkout.sets.map(set => ({
      setNumber: set.setNumber ? String(set.setNumber) : '',
      weight: String(set.weight),
      reps: String(set.reps)
    }));

    // Update the exercise with copied sets
    const updated = [...exercises];
    updated[exerciseIndex].sets = newSets;
    setExercises(updated);
  };

  // Copy entire workout from last workout with same name
  const copyLastWorkoutByName = () => {
    const lastWorkout = getLastWorkoutByName(allWorkouts, workoutName.trim());
    if (!lastWorkout || !lastWorkout.exercises || lastWorkout.exercises.length === 0) return;

    // Convert all exercises from last workout to form format
    const newExercises = lastWorkout.exercises.map(exercise => ({
      name: exercise.name || '',
      sets: exercise.sets.map(set => ({
        setNumber: set.setNumber ? String(set.setNumber) : '',
        weight: String(set.weight),
        reps: String(set.reps)
      }))
    }));

    // Update exercises state
    setExercises(newExercises);
    
    // Optionally copy notes if they exist
    if (lastWorkout.notes) {
      setNotes(lastWorkout.notes);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!date) {
      newErrors.date = 'Datum krävs';
    }

    // Check if at least one exercise has a name and at least one set with values
    let hasValidExercise = false;
    exercises.forEach((exercise, exIndex) => {
      if (exercise.name.trim()) {
        const hasValidSet = exercise.sets.some(set => 
          set.weight && set.reps && 
          parseFloat(set.weight) > 0 && 
          parseInt(set.reps) > 0
        );
        if (hasValidSet) {
          hasValidExercise = true;
        }
      }
    });

    if (!hasValidExercise) {
      newErrors.exercises = 'Du måste ha minst en övning med minst ett set (vikt och reps)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Format exercises data - only include exercises with names and valid sets
    // Include set number if provided by user
    const formattedExercises = exercises
      .filter(ex => ex.name.trim())
      .map(ex => ({
        name: ex.name.trim(),
        sets: ex.sets
          .filter(set => set.weight && set.reps && parseFloat(set.weight) > 0 && parseInt(set.reps) > 0)
          .map(set => ({
            setNumber: set.setNumber ? parseInt(set.setNumber) : undefined, // Include set number if provided
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps)
          }))
      }))
      .filter(ex => ex.sets.length > 0);

    // Create workout object
    // Include workout name if provided (e.g., "Bröst och Triceps")
    const workout = {
      date,
      name: workoutName.trim() || undefined, // Only include name if it's not empty
      exercises: formattedExercises,
      notes: notes.trim()
    };

    // Save to localStorage
    addWorkout(workout);

    // Redirect to history page
    navigate('/history');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Logga Nytt Pass</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Datum
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        {/* Workout Name Input */}
        <div>
          <label htmlFor="workoutName" className="block text-sm font-medium text-gray-700 mb-2">
            Passnamn (valfritt)
          </label>
          <input
            type="text"
            id="workoutName"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="t.ex. Bröst och Triceps, Ben, Push, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ge ditt pass ett namn för att enkelt identifiera det senare
          </p>

          {/* Last Workout Preview by Name */}
          {workoutName.trim() && (() => {
            const lastWorkout = getLastWorkoutByName(allWorkouts, workoutName.trim());
            if (!lastWorkout) return null;

            return (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Senaste "{lastWorkout.name}" pass: {formatDate(lastWorkout.date)}
                    </p>
                    <div className="space-y-2 mt-2">
                      {lastWorkout.exercises?.map((exercise, exIdx) => (
                        <div key={exIdx} className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-sm font-medium text-gray-800 mb-1">{exercise.name}</p>
                          <div className="space-y-0.5">
                            {exercise.sets?.map((set, setIdx) => (
                              <p key={setIdx} className="text-xs text-gray-600">
                                Set {set.setNumber || setIdx + 1}: {set.weight} kg × {set.reps} reps
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {lastWorkout.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">Anteckningar: {lastWorkout.notes}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={copyLastWorkoutByName}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                  >
                    Använd detta pass
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Exercises */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Övningar
            </label>
            <button
              type="button"
              onClick={addExercise}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Lägg till Övning
            </button>
          </div>

          {errors.exercises && (
            <p className="mb-4 text-sm text-red-600">{errors.exercises}</p>
          )}

          <div className="space-y-6">
            {exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="bg-white p-4 rounded-lg border border-gray-200">
                {/* Exercise Header */}
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Övningsnamn (t.ex. Bänkpress)"
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exerciseIndex)}
                      className="text-red-600 hover:text-red-700 px-3 py-2"
                      aria-label="Ta bort övning"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Last Workout Preview */}
                {exercise.name.trim() && (() => {
                  const lastWorkout = getLastWorkoutForExercise(allWorkouts, exercise.name.trim());
                  if (!lastWorkout) return null;

                  return (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Senaste träning: {formatDate(lastWorkout.date)}
                          </p>
                          <div className="space-y-1">
                            {lastWorkout.sets.map((set, setIdx) => (
                              <p key={setIdx} className="text-sm text-gray-700">
                                Set {set.setNumber || setIdx + 1}: {set.weight} kg × {set.reps} reps
                              </p>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyLastWorkoutValues(exerciseIndex)}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                        >
                          Använd dessa värden
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Sets */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Set</span>
                    <button
                      type="button"
                      onClick={() => addSet(exerciseIndex)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Lägg till Set
                    </button>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Vikt (kg)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="80"
                            value={set.weight}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Set</label>
                          <input
                            type="number"
                            min="1"
                            placeholder={setIndex + 1}
                            value={set.setNumber}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'setNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Reps</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="8"
                            value={set.reps}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="text-red-600 hover:text-red-700 px-2 py-2"
                          aria-label="Ta bort set"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Anteckningar (valfritt)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Hur kändes passet? Notera något speciellt..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Spara Pass
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}
