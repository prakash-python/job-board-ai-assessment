import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import ApplyPage from './pages/ApplyPage';
import MyApplications from './pages/MyApplications';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';

// Admin Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail';
import AdminUsers from './pages/admin/AdminUsers';

// Customer Pages
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import Profile from './pages/customer/Profile';

const App = () => {
  const { user, loading, isAdmin, isCustomer } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes (Uses Navbar + Footer) */}
        <Route element={<PublicLayout />}>
        {/* Landing Route */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/signin" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
      </Route>

      {/* Hybrid Routes (PublicLayout if logged out, SidebarLayout if logged in) */}
      <Route element={user ? <SidebarLayout type={isAdmin ? 'admin' : 'customer'} /> : <PublicLayout />}>
        <Route path="/jobs" element={<JobList />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/company-profile/:companyId" element={<CompanyDetail />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Route>

      {/* Dashboard Shortcut */}
      <Route path="/dashboard" element={
        user ? (
          isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/customer/dashboard" replace />
        ) : <Navigate to="/signin" replace />
      } />

      {/* Post Job (Employer only logic managed inside component or UI fallback) */}
      <Route path="/post-job" element={
        !user ? <Navigate to="/signin" replace /> :
        isAdmin ? <AdminJobs /> : (
          <div className="container" style={{padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{background: 'rgba(15, 23, 42, 0.6)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', maxWidth: '500px'}}>
              <div style={{fontSize: '3rem', marginBottom: '16px'}}>🔒</div>
              <h2 style={{color: 'white', marginBottom: '16px'}}>Employer Access Required</h2>
              <p style={{color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6'}}>
                Only employer accounts have permission to post new job listings. 
                If you represent a company, please contact support to upgrade your account type.
              </p>
              <Link to="/customer/dashboard" className="btn btn-primary">Return to Dashboard</Link>
            </div>
          </div>
        )
      } />

      {/* Customer Protected Routes with Sidebar (AppLayout) */}
      <Route element={<ProtectedRoute requireCustomer={true} />}>
        <Route element={<SidebarLayout type="customer" />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/profile" element={<Profile />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/jobs/:id/apply" element={<ApplyPage />} />
        </Route>
      </Route>

      {/* Admin Protected Routes with Sidebar (AppLayout) */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route element={<SidebarLayout type="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};

export default App;
