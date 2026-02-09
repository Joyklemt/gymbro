/**
 * Storage utility for managing workout data in localStorage
 * Uses the key "gymProgress" as specified in requirements
 */

const STORAGE_KEY = 'gymProgress';

/**
 * Load all workouts from localStorage
 * Returns empty array if no data exists
 */
export function loadWorkouts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    // Ensure we return workouts array (handle both old and new formats)
    return parsed.workouts || parsed || [];
  } catch (error) {
    console.error('Error loading workouts:', error);
    return [];
  }
}

/**
 * Save workouts array to localStorage
 * Wraps workouts in an object with "workouts" key
 */
export function saveWorkouts(workouts) {
  try {
    const data = {
      workouts: workouts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving workouts:', error);
    throw error;
  }
}

/**
 * Add a new workout to storage
 * Generates UUID and adds to existing workouts
 */
export function addWorkout(workout) {
  const workouts = loadWorkouts();
  const newWorkout = {
    ...workout,
    id: workout.id || crypto.randomUUID() // Use crypto.randomUUID() instead of uuid library
  };
  workouts.push(newWorkout);
  saveWorkouts(workouts);
  return newWorkout;
}

/**
 * Delete a workout by ID
 */
export function deleteWorkout(workoutId) {
  const workouts = loadWorkouts();
  const filtered = workouts.filter(w => w.id !== workoutId);
  saveWorkouts(filtered);
}
