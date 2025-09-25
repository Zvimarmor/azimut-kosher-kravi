import { User } from '@/Entities/User';

interface Exercise {
  name: string;
  primary_attribute: string;
  base_value: number;
  max_value: number;
  scaling_type: 'reps' | 'time' | 'distance' | 'weight';
  sets_base?: number;
  sets_max?: number;
  rest_seconds?: number;
}

interface WorkoutTemplate {
  target_attributes: string[];
  required_level: number;
  exercises: Exercise[];
}

interface UserLevels {
  [key: string]: number;
}

interface PersonalizedExercise {
  name: string;
  sets: number;
  reps: number | null;
  time: number | null;
  distance: number | null;
  weight: number | null;
  rest: string;
  instructions: string;
}

/**
 * Personalizes a workout template based on user fitness levels
 * @param {Object} workoutTemplate - The generic workout template
 * @param {Object} userLevels - User fitness levels (0-10 for each attribute)
 * @returns {Object} Personalized workout with specific sets, reps, times
 */
export function personalizeWorkout(workoutTemplate: WorkoutTemplate, userLevels: UserLevels) {
    // Calculate user's overall level for this workout
    const relevantLevels = workoutTemplate.target_attributes.map(attr => userLevels[attr] || 0);
    const avgUserLevel = relevantLevels.reduce((sum, level) => sum + level, 0) / relevantLevels.length;
    
    // Check if user meets minimum requirements
    if (avgUserLevel < workoutTemplate.required_level) {
        throw new Error(`משתמש צריך רמה מינימלית של ${workoutTemplate.required_level} עבור אימון זה`);
    }

    // Personalize each exercise
    const personalizedExercises = workoutTemplate.exercises.map(exercise => {
        const userLevel = userLevels[exercise.primary_attribute] || 1;
        const effectiveLevel = Math.max(1, Math.min(10, userLevel));
        
        // Calculate scaled values based on user level
        const scaledValue = scaleValue(
            exercise.base_value,
            exercise.max_value,
            effectiveLevel,
            exercise.scaling_type
        );
        
        const scaledSets = scaleValue(
            exercise.sets_base || 1,
            exercise.sets_max || 5,
            effectiveLevel,
            'sets'
        );

        return {
            name: exercise.name,
            sets: Math.round(scaledSets),
            reps: exercise.scaling_type === 'reps' ? Math.round(scaledValue) : null,
            time: exercise.scaling_type === 'time' ? Math.round(scaledValue) : null,
            distance: exercise.scaling_type === 'distance' ? Math.round(scaledValue) : null,
            weight: exercise.scaling_type === 'weight' ? Math.round(scaledValue) : null,
            rest: formatRestTime(exercise.rest_seconds || 60),
            instructions: generateInstructions(exercise, Math.round(scaledValue), exercise.scaling_type)
        };
    });

    // Calculate estimated duration
    const estimatedDuration = calculateWorkoutDuration(personalizedExercises);

    return {
        ...workoutTemplate,
        exercises: personalizedExercises,
        duration: estimatedDuration,
        personalizedFor: {
            userLevel: Math.round(avgUserLevel),
            attributes: workoutTemplate.target_attributes.reduce((acc, attr) => {
                acc[attr] = userLevels[attr] || 0;
                return acc;
            }, {})
        }
    };
}

/**
 * Scales a value based on user level using different progression curves
 */
function scaleValue(baseValue: number, maxValue: number, userLevel: number, scalingType: string) {
    // Different scaling curves for different types
    let progressionFactor;
    
    switch (scalingType) {
        case 'reps':
        case 'sets':
            // Linear progression for reps and sets
            progressionFactor = (userLevel - 1) / 9;
            break;
        case 'time':
            // Exponential progression for time-based exercises
            progressionFactor = Math.pow((userLevel - 1) / 9, 0.8);
            break;
        case 'distance':
            // Moderate progression for distance
            progressionFactor = Math.pow((userLevel - 1) / 9, 0.7);
            break;
        case 'weight':
            // Steep progression for weight
            progressionFactor = Math.pow((userLevel - 1) / 9, 1.2);
            break;
        default:
            progressionFactor = (userLevel - 1) / 9;
    }
    
    return baseValue + (maxValue - baseValue) * progressionFactor;
}

/**
 * Formats rest time in a readable format
 */
function formatRestTime(seconds: number) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes} דק'`;
    }
    return `${seconds} שניות`;
}

/**
 * Generates specific instructions based on the exercise parameters
 */
function generateInstructions(exercise: Exercise, scaledValue: number, scalingType: string) {
    switch (scalingType) {
        case 'reps':
            return `בצע ${scaledValue} חזרות בכל סט`;
        case 'time':
            return `בצע למשך ${scaledValue} שניות`;
        case 'distance':
            return `בצע מרחק של ${scaledValue} מטרים`;
        case 'weight':
            return `השתמש במשקל של ${scaledValue} ק"ג`;
        default:
            return 'בצע לפי ההוראות';
    }
}

/**
 * Estimates total workout duration based on exercises
 */
function calculateWorkoutDuration(exercises: PersonalizedExercise[]) {
    let totalTime = 0;
    
    exercises.forEach(exercise => {
        // Estimate time per set
        let setTime = 0;
        if (exercise.time) {
            setTime = exercise.time;
        } else if (exercise.reps) {
            setTime = exercise.reps * 2; // Assume 2 seconds per rep
        } else if (exercise.distance) {
            setTime = exercise.distance / 3; // Assume 3 m/s pace
        } else {
            setTime = 30; // Default 30 seconds per set
        }
        
        // Add rest time (convert from "1:30" format to seconds)
        let restTime = 60; // default
        if (typeof exercise.rest === 'string') {
            if (exercise.rest.includes(':')) {
                const [mins, secs] = exercise.rest.split(':').map(Number);
                restTime = mins * 60 + secs;
            } else if (exercise.rest.includes('שניות')) {
                restTime = parseInt(exercise.rest);
            }
        }
        
        totalTime += (setTime + restTime) * exercise.sets;
    });
    
    return Math.round(totalTime / 60); // Return in minutes
}

/**
 * Gets a personalized workout for a user
 */
export async function getPersonalizedWorkout(workoutId: string) {
    try {
        const user = await User.me();
        const userLevels = {
            push_strength: user.push_strength || 1,
            pull_strength: user.pull_strength || 1,
            cardio_endurance: user.cardio_endurance || 1,
            running_volume: user.running_volume || 1,
            rucking_volume: user.rucking_volume || 1,
            weight_work: user.weight_work || 1
        };
        
        // In a real app, you'd fetch the workout template from the database
        // For now, we'll use a placeholder
        const workoutTemplate = {
            // This would be fetched from database by workoutId
        };
        
        return personalizeWorkout(workoutTemplate, userLevels);
    } catch (error) {
        console.error('Error personalizing workout:', error);
        throw error;
    }
}