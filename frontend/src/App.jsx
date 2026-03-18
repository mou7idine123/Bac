import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Quizzes from './pages/Quizzes';
import Exercises from './pages/Exercises';
import Sheets from './pages/Sheets';
import Assistant from './pages/Assistant';
import Planning from './pages/Planning';
import Exams from './pages/Exams';
import LessonView from './pages/LessonView';
import ChapterSummaries from './pages/ChapterSummaries';

// Admin Imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminChapters from './pages/admin/AdminChapters';
import AdminResumes from './pages/admin/AdminResumes';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSheets from './pages/admin/AdminSheets';
import AdminExercises from './pages/admin/AdminExercises';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminSettings from './pages/admin/AdminSettings';
import AdminExams from './pages/admin/AdminExams';
import AdminUsers from './pages/admin/AdminUsers';

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
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/lesson/:lessonId" element={<LessonView />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="sheets" element={<Sheets />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="planning" element={<Planning />} />
            <Route path="exams" element={<Exams />} />
            <Route path="summaries" element={<ChapterSummaries />} />
          </Route>
          {/* Admin routes */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="chapters" element={<AdminChapters />} />
            <Route path="resumes" element={<AdminResumes />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="sheets" element={<AdminSheets />} />
            <Route path="exercises" element={<AdminExercises />} />
            <Route path="quizzes" element={<AdminQuizzes />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="exams" element={<AdminExams />} />
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
