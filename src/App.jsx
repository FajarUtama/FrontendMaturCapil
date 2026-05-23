import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider } from './context/MockDataContext';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';

// RootSwitcher
import { RootSwitcher } from './pages/root/RootSwitcher';

// Citizen Portal Pages
import { CitizenFeed } from './pages/citizen/CitizenFeed';
import { CitizenAuth } from './pages/citizen/CitizenAuth';
import { CitizenCreateComplaint } from './pages/citizen/CitizenCreateComplaint';
import { CitizenHistory } from './pages/citizen/CitizenHistory';
import { CitizenProfile } from './pages/citizen/CitizenProfile';
import { CitizenComplaintDetail } from './pages/citizen/CitizenComplaintDetail';

// Admin Portal Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminComplaintDetail } from './pages/admin/AdminComplaintDetail';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

function App() {
  return (
    <MockDataProvider>
      <Router>
        <Routes>
          {/* Root switcher screen */}
          <Route path="/" element={<RootSwitcher />} />

          {/* Citizen Portal Route Tree */}
          <Route path="/maturcapil" element={<CitizenLayout />}>
            <Route index element={<CitizenFeed />} />
            <Route path="login" element={<CitizenAuth />} />
            <Route path="register" element={<CitizenAuth />} />
            <Route path="create" element={<CitizenCreateComplaint />} />
            <Route path="history" element={<CitizenHistory />} />
            <Route path="profile" element={<CitizenProfile />} />
            <Route path="report/:id" element={<CitizenComplaintDetail />} />
          </Route>

          {/* Admin Portal Route Tree */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="complaints/:id" element={<AdminComplaintDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </MockDataProvider>
  );
}

export default App;
