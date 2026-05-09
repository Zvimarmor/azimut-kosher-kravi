import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './Layout';
import { ThemeProvider } from './components/shared/ThemeContext';
import { AuthProvider } from './features/auth/AuthContext';
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

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full"
      >
        <Routes location={location}>
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
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}