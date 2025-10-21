import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from './features/auth/AuthContext';
import { ThemeProvider } from './components/shared/ThemeContext';
import Home from './Pages/Home';
import CreateWorkout from './Pages/CreateWorkout';
import SelectWorkout from './Pages/SelectWorkout';
import WorkoutHistory from './Pages/WorkoutHistory';
import Settings from './Pages/Settings';
import QuickWorkout from './Pages/QuickWorkout';
import WorkoutSetup from './Pages/WorkoutSetup';
import MilitaryChat from './Pages/MilitaryChat';
import Heritage from './Pages/Heritage';
import HeritageEntry from './Pages/HeritageEntry';
import ExerciseLibrary from './Pages/ExerciseLibrary';
import ExerciseDetail from './Pages/ExerciseDetail';
import AboutUs from './Pages/AboutUs';
import Admin from './Pages/Admin';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/create-workout" element={<CreateWorkout />} />
              <Route path="/select-workout" element={<SelectWorkout />} />
              <Route path="/workout-history" element={<WorkoutHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/quick-workout" element={<QuickWorkout />} />
              <Route path="/workout-setup" element={<WorkoutSetup />} />
              <Route path="/military-chat" element={<MilitaryChat />} />
              <Route path="/heritage" element={<Heritage />} />
              <Route path="/heritage-entry" element={<HeritageEntry />} />
              <Route path="/exercise-library" element={<ExerciseLibrary />} />
              <Route path="/exercise-detail/:id" element={<ExerciseDetail />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}