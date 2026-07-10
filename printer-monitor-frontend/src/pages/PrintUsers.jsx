import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Key, Trash2, Edit, X, FileText,
  Plus, CheckCircle2, UserPlus, AlertTriangle
} from 'lucide-react';

const getInitials = (name) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const AVATAR_COLORS = [
  ['#00d4ff', '#a855f7'], ['#ff3b6b', '#ffb800'], ['#00ff88', '#00d4ff'],
  ['#a855f7', '#ff3b6b'], ['#ffb800', '#ff6b35'],
];

const PrintUsers = () => {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    pin_code: '',
    monthly_quota: 0,
    color_quota: 0,
    is_active: true,
    customer_id: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [usersRes, customersRes] = await Promise.all([
        axios.get('/api/print-users'),
        axios.get('/api/customers')
      ]);
      setUsers(usersRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const generatePin = () => {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit PIN
  };

  const openAddModal = () => {
    setIsEditMode(false); 
    setEditingId(null);
    setFormData({ name: '', pin_code: generatePin(), monthly_quota: 500, color_quota: 50, is_active: true, customer_id: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true); 
    setEditingId(user.id);
    setFormData({ 
      name: user.name, 
      pin_code: user.pin_code, 
      monthly_quota: user.monthly_quota, 
      color_quota: user.color_quota,
      is_active: user.is_active === 1 || user.is_active === true,
      customer_id: user.customer_id || ''
    });
    setError(null); 
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? Their PIN will be removed from all printers.')) {
      try {
        await axios.delete(`/api/print-users/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      if (!formData.name.trim()) { setError('User name is required'); setSubmitting(false); return; }
      if (!formData.pin_code || formData.pin_code.length < 4) { setError('PIN Code must be at least 4 digits'); setSubmitting(false); return; }
      
      if (isEditMode) {
        await axios.put(`/api/print-users/${editingId}`, formData);
      } else {
        await axios.post('/api/print-users', formData);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>User & Quota Management</h1>
          <p>Manage employee PIN codes (Department Codes) and printing quotas.</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <UserPlus size={15} /> Add User
        </button>
      </div>

      {/* Table Panel */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-container" style={{ height: 250 }}>
            <div className="dot" style={{ width: 12, height: 12 }} />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ height: 280 }}>
            <div className="empty-state-icon"><Users size={30} /></div>
            <h3>No users found</h3>
            <p>Add users and generate PIN codes for follow-me printing.</p>
            <button className="btn-primary" onClick={openAddModal} style={{ marginTop: '0.5rem' }}>
              <Plus size={14} /> Add First User
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Customer</th>
                  <th>PIN Code</th>
                  <th>B&W Quota</th>
                  <th>Color Quota</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  const gradColors = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const isActive = user.is_active === 1 || user.is_active === true;
                  return (
                    <tr key={user.id} style={{ opacity: isActive ? 1 : 0.5 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div className="avatar" style={{ background: `linear-gradient(135deg, ${gradColors[0]}, ${gradColors[1]})` }}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-muted)' }}>{user.customer_name || 'Global'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--neon-amber)' }}>
                          <Key size={14} />
                          {user.pin_code}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{user.monthly_quota}</span> pages/mo
                      </td>
                      <td>
                        <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{user.color_quota}</span> pages/mo
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-emerald' : 'badge-rose'}`}>
                          {isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button className="icon-btn edit-btn" onClick={() => openEditModal(user)}>
                            <Edit size={16} />
                          </button>
                          <button className="icon-btn delete-btn" onClick={() => handleDelete(user.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              {error && (
                <div className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--neon-rose-dim)', border: '1px solid rgba(255,59,107,0.2)', color: 'var(--neon-rose)', borderRadius: '6px', marginBottom: '1rem' }}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Customer Company (Optional)</label>
                  <select 
                    className="form-input" 
                    value={formData.customer_id} 
                    onChange={e => setFormData({...formData, customer_id: e.target.value})}
                  >
                    <option value="">-- Global (All Printers) --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Department PIN Code</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="5 digits"
                        value={formData.pin_code}
                        onChange={e => setFormData({...formData, pin_code: e.target.value})}
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', letterSpacing: '2px' }}
                        maxLength={8}
                      />
                      {!isEditMode && (
                        <button type="button" className="btn-ghost" onClick={() => setFormData({...formData, pin_code: generatePin()})}>
                          Generate
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Monthly B&W Quota</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.monthly_quota}
                      onChange={e => setFormData({...formData, monthly_quota: e.target.value})}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Monthly Color Quota</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.color_quota}
                      onChange={e => setFormData({...formData, color_quota: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    style={{ width: 16, height: 16, accentColor: 'var(--neon-emerald)' }}
                  />
                  <label htmlFor="is_active" style={{ color: 'var(--text-bright)', cursor: 'pointer' }}>Active (Can print)</label>
                </div>

                <div className="modal-footer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (isEditMode ? 'Update User' : 'Add User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintUsers;
