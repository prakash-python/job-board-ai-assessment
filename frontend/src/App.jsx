import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import ApplyPage from './pages/ApplyPage';
import MyApplications from './pages/MyApplications';

// Admin Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUsers from './pages/admin/AdminUsers';

// Customer Pages
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import Profile from './pages/customer/Profile';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Auth Routes */}
          <Route path="/signin" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />

          {/* Dashboard Shortcut */}
          <Route path="/dashboard" element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/customer/dashboard" replace />
            ) : <Navigate to="/signin" replace />
          } />

          {/* Post Job (Admin/Employer only) */}
          <Route path="/post-job" element={
            user && user.role === 'admin' ? <AdminJobs /> : <Navigate to="/signin" replace />
          } />

          {/* Customer Protected Routes with Sidebar */}
          <Route element={<ProtectedRoute requireCustomer={true} />}>
            <Route element={<SidebarLayout type="customer" />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/profile" element={<Profile />} />
              <Route path="/my-applications" element={<MyApplications />} />
            </Route>
            {/* Pages without Sidebar but protected */}
            <Route path="/jobs/:id/apply" element={<ApplyPage />} />
          </Route>

          {/* Admin Protected Routes with Sidebar */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<SidebarLayout type="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
