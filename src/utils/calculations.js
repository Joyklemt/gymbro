/**
 * Utility functions for calculating PRs, exercise history, and statistics
 */

/**
 * Get all unique exercise names from workouts
 */
export function getAllExercises(workouts) {
  const exerciseSet = new Set();
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      if (exercise.name && exercise.name.trim()) {
        exerciseSet.add(exercise.name.trim());
      }
    });
  });
  return Array.from(exerciseSet).sort();
}

/**
 * Get exercise history - all sets for a specific exercise
 * Returns array of { date, workoutId, exercise, sets }
 */
export function getExerciseHistory(workouts, exerciseName) {
  const history = [];
  
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      if (exercise.name?.trim() === exerciseName.trim() && exercise.sets?.length > 0) {
        history.push({
          date: workout.date,
          workoutId: workout.id,
          exercise: exercise,
          sets: exercise.sets
        });
      }
    });
  });
  
  // Sort by date (newest first)
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get the last workout for a specific exercise
 * Returns the most recent workout entry for the exercise, or null if not found
 * Uses case-insensitive matching for exercise names
 */
export function getLastWorkoutForExercise(workouts, exerciseName) {
  if (!exerciseName || !exerciseName.trim()) {
    return null;
  }
  
  const normalizedSearchName = exerciseName.trim().toLowerCase();
  const history = [];
  
  // Find all workouts with matching exercise (case-insensitive)
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      const normalizedExerciseName = exercise.name?.trim().toLowerCase();
      if (normalizedExerciseName === normalizedSearchName && exercise.sets?.length > 0) {
        history.push({
          date: workout.date,
          workoutId: workout.id,
          exercise: exercise,
          sets: exercise.sets
        });
      }
    });
  });
  
  // Sort by date (newest first)
  const sorted = history.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Return first element (most recent) or null if no history
  return sorted.length > 0 ? sorted[0] : null;
}

/**
 * Calculate PRs (Personal Records) for an exercise
 * Returns object with maxWeight, maxReps, maxVolume
 */
export function calculatePR(workouts, exerciseName) {
  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0; // weight * reps for a single set
  
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      if (exercise.name?.trim() === exerciseName.trim() && exercise.sets) {
        exercise.sets.forEach(set => {
          const weight = set.weight || 0;
          const reps = set.reps || 0;
          const volume = weight * reps;
          
          if (weight > maxWeight) maxWeight = weight;
          if (reps > maxReps) maxReps = reps;
          if (volume > maxVolume) maxVolume = volume;
        });
      }
    });
  });
  
  return {
    maxWeight: maxWeight || null,
    maxReps: maxReps || null,
    maxVolume: maxVolume || null
  };
}

/**
 * Calculate total workouts count
 */
export function getTotalWorkouts(workouts) {
  return workouts.length;
}

/**
 * Calculate training frequency (workouts per week/month)
 */
export function getTrainingFrequency(workouts) {
  if (workouts.length === 0) {
    return { perWeek: 0, perMonth: 0 };
  }
  
  // Sort workouts by date
  const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  
  // Calculate days difference
  const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const weeks = daysDiff / 7;
  const months = daysDiff / 30;
  
  return {
    perWeek: weeks > 0 ? (workouts.length / weeks).toFixed(1) : workouts.length,
    perMonth: months > 0 ? (workouts.length / months).toFixed(1) : workouts.length
  };
}

/**
 * Get most common exercises
 */
export function getMostCommonExercises(workouts, limit = 5) {
  const exerciseCount = {};
  
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      const name = exercise.name?.trim();
      if (name) {
        exerciseCount[name] = (exerciseCount[name] || 0) + 1;
      }
    });
  });
  
  return Object.entries(exerciseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

/**
 * Get the last workout with a specific name
 * Returns the most recent workout with matching name, or null if not found
 * Uses case-insensitive matching for workout names
 */
export function getLastWorkoutByName(workouts, workoutName) {
  if (!workoutName || !workoutName.trim()) {
    return null;
  }
  
  const normalizedSearchName = workoutName.trim().toLowerCase();
  const matchingWorkouts = [];
  
  // Find all workouts with matching name (case-insensitive)
  workouts.forEach(workout => {
    const normalizedWorkoutName = workout.name?.trim().toLowerCase();
    if (normalizedWorkoutName === normalizedSearchName && workout.exercises?.length > 0) {
      matchingWorkouts.push(workout);
    }
  });
  
  // Sort by date (newest first)
  const sorted = matchingWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Return first element (most recent) or null if no match
  return sorted.length > 0 ? sorted[0] : null;
}
