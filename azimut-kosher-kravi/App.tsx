import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CreateWorkoutScreen from './src/screens/CreateWorkoutScreen';
import SelectWorkoutScreen from './src/screens/SelectWorkoutScreen';
import WorkoutHistoryScreen from './src/screens/WorkoutHistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1a3d2e" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a3d2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'System',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateWorkout" 
          component={CreateWorkoutScreen}
          options={{ title: 'צור אימון' }}
        />
        <Stack.Screen 
          name="SelectWorkout" 
          component={SelectWorkoutScreen}
          options={{ title: 'בחר אימון' }}
        />
        <Stack.Screen 
          name="WorkoutHistory" 
          component={WorkoutHistoryScreen}
          options={{ title: 'היסטוריית אימונים' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'הגדרות' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}