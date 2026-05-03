import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { USER_ENDPOINTS } from '../../constants/apiConstants';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(USER_ENDPOINTS.LIST);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && u.is_active) ||
      (filterStatus === 'inactive' && !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const showDeleteConfirm = (id) => {
    setConfirmModal({ show: true, id });
  };
  
  const handleDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ show: false, id: null });
    try {
      await axiosInstance.delete(USER_ENDPOINTS.DETAIL(id));
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      const msg = err.response?.data?.detail || (typeof err.response?.data === 'string' && err.response?.data.includes('<!DOCTYPE') ? 'Server error occurred.' : err.response?.data) || 'Failed to delete user.';
      setError(msg);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const customerCount = users.filter(u => u.role === 'CUSTOMER').length;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Manage Users</h1>
          <p>{users.length} total users · {adminCount} admin{adminCount !== 1 ? 's' : ''} · {customerCount} candidate{customerCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍  Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CUSTOMER">Candidate</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-avatar-cell">
                      <div className="avatar-circle">
                        {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="user-cell-info">
                        <span className="user-cell-name">{u.name || '—'}</span>
                        <span className="user-cell-email">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-customer'}`}>
                      {u.role === 'ADMIN' ? '⚡ Admin' : '👤 Candidate'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {new Date(u.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="row-actions">
                      {u.id !== currentUser?.id ? (
                        <button className="icon-btn danger" title="Delete user" onClick={() => showDeleteConfirm(u.id)}>🗑</button>
                      ) : (
                        <span className="text-muted text-xs font-medium">Current User</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <p>{search || filterRole !== 'all' || filterStatus !== 'all' ? 'No users match your filters.' : 'No users found.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationModal
        show={confirmModal.show}
        title="Delete User"
        message="Are you sure you want to permanently delete this user account? This action cannot be undone."
        confirmText="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ show: false, id: null })}
      />
    </div>
  );
};

export default AdminUsers;
