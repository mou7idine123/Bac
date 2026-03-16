import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Quizzes from './pages/Quizzes';
import Assistant from './pages/Assistant';
import Planning from './pages/Planning';
import Progress from './pages/Progress';
import Exams from './pages/Exams';

// Admin Imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminExercises from './pages/admin/AdminExercises';
import AdminQuizzes from './pages/admin/AdminQuizzes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
               <ProtectedRoute>
                  <Layout />
               </ProtectedRoute>
            }
          >
            <Route index            element={<Dashboard />} />
            <Route path="courses"   element={<Courses />} />
            <Route path="quizzes"   element={<Quizzes />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="planning"  element={<Planning />} />
            <Route path="progress"  element={<Progress />} />
            <Route path="exams"     element={<Exams />} />
          </Route>
          {/* Admin routes */}
          <Route 
             path="/admin" 
             element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
             <Route index element={<AdminDashboard />} />
             <Route path="courses" element={<AdminCourses />} />
             <Route path="exercises" element={<AdminExercises />} />
             <Route path="quizzes" element={<AdminQuizzes />} />
             {/* Future admin pages will be added here */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
