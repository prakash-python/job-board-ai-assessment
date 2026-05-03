import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { APPLICATION_ENDPOINTS } from '../../constants/apiConstants';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appData = res.data.results || res.data;
        setApps(Array.isArray(appData) ? appData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const stats = {
    total: apps.length,
    accepted: apps.filter(a => a.status === 'ACCEPTED').length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
    // Group all active statuses as 'In Progress'
    inProgress: apps.filter(a => ['APPLIED', 'REVIEWED', 'SHORTLISTED'].includes(a.status)).length,
  };

  // Process timeline data from real application dates
  const processTimelineData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    // Get applications from the last 7 days
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    apps.forEach(app => {
      const appDate = new Date(app.created_at);
      if (appDate >= lastWeek) {
        const dayName = days[appDate.getDay()];
        counts[dayName]++;
      }
    });

    // Reorder to show last 7 days ending today
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = days[d.getDay()];
      result.push({
        name: dayName,
        apps: counts[dayName]
      });
    }
    return result;
  };

  const timelineData = processTimelineData();

  const pieData = [
    { name: 'Accepted', value: stats.accepted },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Rejected', value: stats.rejected },
  ].filter(d => d.value > 0); // Only show statuses that have data

  // Fallback for pie chart if no data
  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#334155'];

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="dashboard-container fade-in-up">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Track your application progress and discover new opportunities.</p>
        </div>
        <div className="quick-actions">
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          <Link to="/customer/profile" className="btn btn-ghost">Update Profile</Link>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>📨</span>
            <span className="metric-trend positive">↑ 12%</span>
          </div>
          <div className="metric-value">{stats.total}</div>
          <div className="metric-label">Total Applications</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>✅</span>
            <span className="metric-trend positive">↑ 4%</span>
          </div>
          <div className="metric-value">{stats.accepted}</div>
          <div className="metric-label">Accepted Jobs</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>⏳</span>
            <span className="metric-trend neutral">-</span>
          </div>
          <div className="metric-value">{stats.inProgress}</div>
          <div className="metric-label">In Progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>❌</span>
            <span className="metric-trend negative">↓ 2%</span>
          </div>
          <div className="metric-value">{stats.rejected}</div>
          <div className="metric-label">Rejected</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card area-chart">
          <h3>Applications Over Time</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                />
                <Area type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card pie-chart">
          <h3>Status Breakdown</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {finalPieData.map((entry, i) => (
              <div key={entry.name} className="legend-item">
                <span className="legend-dot" style={{background: COLORS[i % COLORS.length]}}></span>
                <span className="legend-text">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="section-header-flex">
          <h3>Recent Applications</h3>
          <Link to="/my-applications" className="view-all-link">View All →</Link>
        </div>
        
        <div className="activity-list">
          {apps.length === 0 ? (
             <div className="empty-state">
               <span className="empty-icon">📝</span>
               <p>No applications yet.</p>
               <Link to="/jobs" className="btn btn-primary btn-sm mt-3" style={{display: 'inline-block', marginTop: '16px'}}>Find Jobs</Link>
             </div>
          ) : (
            apps.slice(0, 3).map((app, i) => (
              <div key={app.id || i} className="activity-item">
                <div className="activity-info">
                  <div className="activity-icon">💼</div>
                  <div>
                    <h4>{app.job_title || 'Software Engineer'}</h4>
                    <p>{app.company_name || 'TechNova Solutions'}</p>
                  </div>
                </div>
                <div className="activity-meta">
                  <span className="activity-date">{new Date(app.created_at || Date.now()).toLocaleDateString()}</span>
                  <span className={`status-badge ${app.status?.toLowerCase() || 'pending'}`}>
                    {app.status || 'PENDING'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
