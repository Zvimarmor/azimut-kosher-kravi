import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Pages/Home';
import CreateWorkout from './Pages/CreateWorkout';
import SelectWorkout from './Pages/SelectWorkout';
import WorkoutHistory from './Pages/WorkoutHistory';
import Settings from './Pages/Settings';
import QuickWorkout from './Pages/QuickWorkout';

export default function App() {
  return (
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
        </Routes>
      </Layout>
    </Router>
  );
}