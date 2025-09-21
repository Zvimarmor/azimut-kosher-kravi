import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, SafeAreaView, Alert } from "react-native";
import { StrengthExplosive } from "../../Entities/StrengthExplosive";
import { WorkoutHistoryService } from "../../Entities/WorkoutHistory";
import { User, UserService } from "../../Entities/User";
import { Button } from "../../Components/ui/button";
import { LanguageContext } from "../../Components/LanguageContext";

const pageTexts = {
  hebrew: {
    title: "אימון מהיר",
    subtitle: "תדריך משימה",
    message: "אימון מהיר ויעיל עם תרגילי כוח וחוזק",
    backHome: "חזרה למסך הבית",
    missionBrief: "תדריך משימה",
    startMission: "התחל משימה",
    finished: "סיום",
    rest: "מנוחה",
    missionAccomplished: "המשימה הושלמה בהצלחה!",
    outstandingWork: "עבודה מצוינת!",
    minutes: "דקות",
    seconds: "שניות",
    difficulty: "רמת קושי",
    feeling: "איך הרגשת?",
    easy: "קל",
    moderate: "בינוני", 
    hard: "קשה",
    great: "מצוין",
    good: "טוב",
    okay: "בסדר",
    tired: "עייף",
    submit: "שלח"
  },
  english: {
    title: "Quick Workout",
    subtitle: "Mission Brief",
    message: "Quick and effective strength training workout",
    backHome: "Back to Home",
    missionBrief: "Mission Brief",
    startMission: "Start Mission",
    finished: "Finished",
    rest: "Rest",
    missionAccomplished: "Mission Accomplished!",
    outstandingWork: "Outstanding work!",
    minutes: "minutes",
    seconds: "seconds",
    difficulty: "Difficulty",
    feeling: "How did you feel?",
    easy: "Easy",
    moderate: "Moderate",
    hard: "Hard", 
    great: "Great",
    good: "Good",
    okay: "Okay",
    tired: "Tired",
    submit: "Submit"
  }
};

interface QuickWorkoutProps {
  navigation?: any; // Will be properly typed when navigation is set up
}

export default function QuickWorkout({ navigation }: QuickWorkoutProps) {
  const languageContext = useContext(LanguageContext);
  const language = (languageContext as any)?.language || 'hebrew';
  const currentTexts = pageTexts[language as keyof typeof pageTexts];

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [exercises] = useState<StrengthExplosive[]>([
    {
      title: "Push-ups",
      target_attributes: ['push_strength'],
      sets: 3,
      reps: 15,
      rest_between_sets: 60,
      instructions: "תרגיל לחיזוק שרירי החזה והכתפיים",
      difficulty: 'beginner'
    },
    {
      title: "Squats", 
      target_attributes: ['weight_work'],
      sets: 3,
      reps: 20,
      rest_between_sets: 60,
      instructions: "תרגיל לחיזוק שרירי הרגליים",
      difficulty: 'beginner'
    }
  ]);
  const [feedback, setFeedback] = useState<{ difficulty: string | null, feeling: string | null }>({ difficulty: null, feeling: null });

  useEffect(() => {
    // Initialize mock user - in real app this would come from auth
    const mockUser = UserService.createUser({
      name: "חייל דוגמה",
      fitness_level: 'intermediate',
      unit: "גדוד 101",
      rank: "רב סמל"
    });
    setCurrentUser(mockUser);
  }, []);

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setWorkoutTime(Date.now());
  };

  const handleFinishWorkout = () => {
    if (!currentUser) return;
    
    const duration = Math.floor((Date.now() - workoutTime) / 60000); // minutes
    setIsWorkoutCompleted(true);
    
    // Create workout history entry
    const workoutEntry = WorkoutHistoryService.createWorkoutHistory({
      userId: currentUser.id,
      workout_title: currentTexts.title,
      duration_completed: duration,
      difficulty: (feedback.difficulty as 'easy' | 'moderate' | 'hard') || 'moderate',
      feeling: (feedback.feeling as 'great' | 'good' | 'okay' | 'tired') || 'okay',
      exercises_completed: exercises.map(ex => ex.title)
    });

    Alert.alert(currentTexts.missionAccomplished, currentTexts.outstandingWork);
  };

  const goHome = () => {
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>טוען...</Text>
      </SafeAreaView>
    );
  }

  if (isWorkoutCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{currentTexts.missionAccomplished}</Text>
          <Text style={styles.subtitle}>{currentTexts.outstandingWork}</Text>
          
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>{currentTexts.difficulty}</Text>
            <View style={styles.buttonRow}>
              <Button 
                variant={feedback.difficulty === 'easy' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, difficulty: 'easy' }))}
              >
                {currentTexts.easy}
              </Button>
              <Button 
                variant={feedback.difficulty === 'moderate' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, difficulty: 'moderate' }))}
              >
                {currentTexts.moderate}
              </Button>
              <Button 
                variant={feedback.difficulty === 'hard' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, difficulty: 'hard' }))}
              >
                {currentTexts.hard}
              </Button>
            </View>

            <Text style={styles.sectionTitle}>{currentTexts.feeling}</Text>
            <View style={styles.buttonRow}>
              <Button 
                variant={feedback.feeling === 'great' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, feeling: 'great' }))}
              >
                {currentTexts.great}
              </Button>
              <Button 
                variant={feedback.feeling === 'good' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, feeling: 'good' }))}
              >
                {currentTexts.good}
              </Button>
              <Button 
                variant={feedback.feeling === 'okay' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, feeling: 'okay' }))}
              >
                {currentTexts.okay}
              </Button>
              <Button 
                variant={feedback.feeling === 'tired' ? 'default' : 'outline'}
                onPress={() => setFeedback(prev => ({ ...prev, feeling: 'tired' }))}
              >
                {currentTexts.tired}
              </Button>
            </View>
          </View>

          <Button onPress={goHome} style={styles.homeButton}>
            {currentTexts.backHome}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isWorkoutStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{currentTexts.title}</Text>
          
          <View style={styles.exerciseList}>
            {exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} סטים × {exercise.reps} חזרות
                </Text>
                <Text style={styles.exerciseInstructions}>
                  {exercise.instructions}
                </Text>
              </View>
            ))}
          </View>

          <Button onPress={handleFinishWorkout} style={styles.finishButton}>
            {currentTexts.finished}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{currentTexts.title}</Text>
        <Text style={styles.subtitle}>{currentTexts.missionBrief}</Text>
        <Text style={styles.message}>{currentTexts.message}</Text>

        <Button onPress={handleStartWorkout} style={styles.startButton}>
          {currentTexts.startMission}
        </Button>

        <Button variant="outline" onPress={goHome} style={styles.homeButton}>
          {currentTexts.backHome}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5530',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  exerciseList: {
    width: '100%',
    marginBottom: 30,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5530',
    textAlign: 'right',
    marginBottom: 8,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    lineHeight: 20,
  },
  feedbackSection: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5530',
    textAlign: 'right',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  startButton: {
    marginBottom: 20,
    minWidth: 200,
  },
  finishButton: {
    marginTop: 20,
    minWidth: 200,
  },
  homeButton: {
    minWidth: 200,
  },
});