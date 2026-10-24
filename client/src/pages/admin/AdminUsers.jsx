import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield, ShieldCheck } from 'lucide-react';
import { adminService, formatINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ page, limit: 15, search, role });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, role]);

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionWord = nextStatus === 'active' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionWord} the account for "${userName}"?`)) return;

    try {
      const res = await adminService.toggleUserStatus(userId, nextStatus);
      showToast(res.data.message || `Account ${nextStatus}.`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status.', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Customer & User Management</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Registered customers, spending activity, and account status controls.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search user by name, email, or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          </div>

          <select
            className="form-control form-select"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="user">Club Member (user)</option>
            <option value="admin">Administrator (admin)</option>
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setRole(''); setPage(1); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        User ID: #{u.user_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{u.phone || 'No phone'}</div>
                    </td>

                    <td>
                      {u.role === 'admin' ? (
                        <span className="badge badge-burgundy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={12} /> ADMIN
                        </span>
                      ) : (
                        <span className="badge badge-outline">MEMBER</span>
                      )}
                    </td>

                    <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>

                    <td>
                      <strong>{u.total_orders}</strong>
                    </td>

                    <td style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>
                      {formatINR(u.total_spent)}
                    </td>

                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${u.status === 'active' ? 'btn-outline' : 'btn-burgundy'}`}
                        onClick={() => handleToggleStatus(u.user_id, u.status, u.full_name)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
