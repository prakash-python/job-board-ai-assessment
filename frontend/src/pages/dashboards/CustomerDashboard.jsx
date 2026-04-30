import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { APPLICATION_ENDPOINTS } from '../../constants/apiConstants';

const CustomerDashboard = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axiosInstance.get(APPLICATION_ENDPOINTS.LIST);
        setApps(res.data);
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
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="fade-in-up">
          <h1>Customer Dashboard</h1>
          <p className="text-secondary">Overview of your applications.</p>
        </div>

        <div className="grid-3 fade-in-up fade-in-up-delay-1" style={{ marginTop: '2rem' }}>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-primary-light)' }}>{stats.total}</h2>
            <p className="text-secondary">Total Applied</p>
          </div>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-success)' }}>{stats.accepted}</h2>
            <p className="text-secondary">Accepted</p>
          </div>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-danger)' }}>{stats.rejected}</h2>
            <p className="text-secondary">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
