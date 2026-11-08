import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoadingState from './components/LoadingState.jsx';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import Dashboard from './pages/Dashboard.jsx';
import ExploreProjects from './pages/ExploreProjects.jsx';
import FindCollaborators from './pages/FindCollaborators.jsx';
import Showcase from './pages/Showcase.jsx';
import CreateProject from './pages/CreateProject.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import MyProjects from './pages/MyProjects.jsx';
import MyTeams from './pages/MyTeams.jsx';
import TeamWorkspace from './pages/TeamWorkspace.jsx';
import MyTasks from './pages/MyTasks.jsx';
import RequestsInbox from './pages/RequestsInbox.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import Settings from './pages/Settings.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreProjects />} />
        <Route path="/collaborators" element={<FindCollaborators />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/my-teams" element={<MyTeams />} />
        <Route path="/teams/:id" element={<TeamWorkspace />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/requests" element={<RequestsInbox />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/profile/:id" element={<StudentProfile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
