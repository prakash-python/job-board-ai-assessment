/**
 * AdminUsers Page — Allows ADMINs to manage users.
 */
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { USER_ENDPOINTS } from '../../constants/apiConstants';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(USER_ENDPOINTS.LIST);
      setUsers(res.data);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axiosInstance.delete(USER_ENDPOINTS.DETAIL(id));
      setUsers(users.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete user. You cannot delete yourself.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header fade-in-up">
          <div>
            <h1>Manage Users</h1>
            <p className="text-secondary">View and manage registered users.</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card admin-table-card fade-in-up fade-in-up-delay-1">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-accent'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_active 
                        ? <span className="badge badge-success">Active</span> 
                        : <span className="badge badge-danger">Inactive</span>}
                    </td>
                    <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
