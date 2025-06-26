import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Worker Components
import WorkerLayout from './components/worker/WorkerLayout';
import WorkerDashboard from './components/worker/WorkerDashboard';
import WorkerProfile from './components/worker/WorkerProfile';
import MaintenanceRequests from './components/worker/MaintenanceRequests';
import LeaveRequestForm from './components/worker/LeaveRequestForm';
import MyLeaveRequests from './components/worker/MyLeaveRequests';

// Tenant Components
import TenantLayout from './components/tenant/TenantLayout';
import TenantDashboard from './components/tenant/TenantDashboard';
import TenantProfile from './components/tenant/TenantProfile';
import RoomDetails from './components/tenant/RoomDetails';
import TenantBills from './components/tenant/TenantBills';
import RooftopSection from './components/tenant/RooftopSection';
import TenantMaintenanceRequests from './components/tenant/MaintenanceRequests';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import UserManagement from './components/admin/UserManagement';
import ApartmentManagement from './components/admin/ApartmentManagement';
import RooftopManagement from './components/admin/RooftopManagement';
import UtilityManagement from './components/admin/UtilityManagement';
import TenantManagement from './components/admin/TenantManagement';
import RooftopReservationReview from './components/admin/RooftopReservationReview';
import MaintenanceManagement from './components/admin/MaintenanceManagement';
import LeaveManagement from './components/admin/LeaveManagement';
import BeverageConsumption from './components/admin/BeverageConsumption';
import UtilityBillManagement from './components/admin/UtilityBillManagement';
import AdminDashboard from './components/admin/AdminDashboard';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

const App = () => {
  const [appError, setAppError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      console.log('App component initializing...');
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing app:', err);
      setAppError(err.message);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (appError) {
    return (
      <div style={{
        padding: '24px',
        maxWidth: '400px',
        margin: '40px auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>Application Error</h2>
        <p style={{ marginTop: '8px', color: '#6b7280' }}>{appError}</p>
        <button
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => window.location.reload()}
        >
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="apartments" element={<ApartmentManagement />} />
              <Route path="maintenance" element={<MaintenanceManagement />} />
              <Route path="leave-management" element={<LeaveManagement />} />
              <Route path="beverages" element={<RooftopManagement />} />
              <Route path="utilities" element={<UtilityManagement />} />
              <Route path="tenants" element={<TenantManagement />} />
              <Route path="rooftop-reservations" element={<RooftopReservationReview />} />
              <Route path="beverage-consumption" element={<BeverageConsumption />} />
              <Route path="utility-bills" element={<UtilityBillManagement />} />
            </Route>

            {/* Worker Routes */}
            <Route
              path="/worker/*"
              element={
                <ProtectedRoute allowedRoles={['worker', 'admin']}>
                  <WorkerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<WorkerDashboard />} />
              <Route path="dashboard" element={<WorkerDashboard />} />
              <Route path="profile" element={<WorkerProfile />} />
              <Route path="maintenance-requests" element={<MaintenanceRequests />} />
              <Route path="leave-request" element={<LeaveRequestForm />} />
              <Route path="my-leaves" element={<MyLeaveRequests />} />
            </Route>

            {/* Tenant Routes */}
            <Route
              path="/tenant/*"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <TenantLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TenantDashboard />} />
              <Route path="dashboard" element={<TenantDashboard />} />
              <Route path="room-details" element={<RoomDetails />} />
              <Route path="bills" element={<TenantBills />} />
              <Route path="profile" element={<TenantProfile />} />
              <Route path="rooftop" element={<RooftopSection />} />
              <Route path="maintenance" element={<TenantMaintenanceRequests />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
