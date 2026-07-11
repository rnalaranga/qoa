import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Mail, Calendar, Trash2, Edit, X, Printer,
  Plus, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle2, Settings as SettingsIcon, UserPlus
} from 'lucide-react';

const getInitials = (name) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const getStatusStyle = (printer) => {
  if (printer.printer_status === 'Stopped' || printer.printer_status === 'Offline')
    return { color: 'var(--neon-rose)', label: printer.printer_status, cls: 'badge-rose' };
  if (printer.printer_status === 'Warning' || (printer.error_status && printer.error_status !== 'OK' && printer.printer_status !== 'Stopped'))
    return { color: 'var(--neon-amber)', label: 'Warning', cls: 'badge-amber' };
  if (printer.printer_status === 'Printing' || printer.printer_status === 'Warmup')
    return { color: 'var(--neon-violet)', label: printer.printer_status, cls: 'badge-violet' };
  return { color: 'var(--neon-emerald)', label: 'OK', cls: 'badge-emerald' };
};

const AVATAR_COLORS = [
  ['#00d4ff', '#a855f7'], ['#ff3b6b', '#ffb800'], ['#00ff88', '#00d4ff'],
  ['#a855f7', '#ff3b6b'], ['#ffb800', '#ff6b35'],
];

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openAddModal = () => {
    setIsEditMode(false); setEditingId(null);
    setNewName(''); setNewContact(''); setNewUsername(''); setNewPassword(''); setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer, e) => {
    e.stopPropagation();
    setIsEditMode(true); setEditingId(customer.id);
    setNewName(customer.name); setNewContact(customer.contact_info || '');
    setError(null); setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      if (!newName.trim()) { setError('Customer name is required'); setSubmitting(false); return; }
      if (isEditMode) {
        await axios.put(`/api/customers/${editingId}`, { name: newName, contact_info: newContact, username: newUsername, password: newPassword });
      } else {
        await axios.post('/api/customers', { name: newName, contact_info: newContact, username: newUsername, password: newPassword });
      }
      await fetchCustomers();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} customer`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Customer Directory</h1>
          <p>Manage clients and view their assigned printer fleet.</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <UserPlus size={15} /> Add Customer
        </button>
      </div>

      {/* Table Panel */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>

        {loading ? (
          <div className="loading-container" style={{ height: 250 }}>
            <div className="dot" style={{ width: 12, height: 12 }} />
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state" style={{ height: 280 }}>
            <div className="empty-state-icon"><Users size={30} /></div>
            <h3>No customers yet</h3>
            <p>Create your first customer to start assigning printers.</p>
            <button className="btn-primary" onClick={openAddModal} style={{ marginTop: '0.5rem' }}>
              <Plus size={14} /> Create Customer
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Fleet</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, idx) => {
                  const gradColors = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const isExpanded = expandedRow === customer.id;
                  const printerCount = customer.assigned_printers?.length || 0;

                  return (
                    <React.Fragment key={customer.id}>
                      {/* Main Row */}
                      <tr
                        onClick={() => toggleRow(customer.id)}
                        style={{
                          cursor: 'pointer',
                          background: isExpanded ? 'var(--bg-input)' : 'transparent',
                          borderBottom: isExpanded ? 'none' : undefined,
                          transition: 'background 0.2s',
                        }}
                      >
                        {/* Customer */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: `linear-gradient(135deg, ${gradColors[0]}, ${gradColors[1]})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.85rem', color: '#000',
                              boxShadow: `0 0 12px ${gradColors[0]}40`,
                            }}>
                              {getInitials(customer.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                {customer.name}
                                {isExpanded
                                  ? <ChevronUp size={13} style={{ color: 'var(--neon-cyan)' }} />
                                  : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                                }
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>
                                CUST-{customer.id.toString().padStart(4, '0')}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            <Mail size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                            {customer.contact_info || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No email</span>}
                          </div>
                        </td>

                        {/* Fleet */}
                        <td>
                          <span className={`badge ${printerCount > 0 ? 'badge-cyan' : 'badge-amber'}`}>
                            <Printer size={11} />
                            {printerCount} {printerCount === 1 ? 'Printer' : 'Printers'}
                          </span>
                        </td>

                        {/* Joined */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <Calendar size={13} style={{ flexShrink: 0 }} />
                            {new Date(customer.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'nowrap' }}>
                            <button
                              onClick={e => openEditModal(customer, e)}
                              className="icon-btn"
                              title="Edit"
                              style={{ width: 32, height: 32, borderRadius: 8 }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={e => e.stopPropagation()}
                              style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neon-rose-dim)', border: '1px solid rgba(255,59,107,0.2)', color: 'var(--neon-rose)', cursor: 'pointer', transition: 'all 0.2s' }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" style={{ padding: '0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{
                              padding: '1rem 2rem 1.5rem 5rem',
                              background: 'var(--card-inner-bg)',
                              borderTop: '1px dashed var(--border-subtle)',
                            }}>
                              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Printer size={14} style={{ color: 'var(--neon-cyan)' }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                  Assigned Fleet Status
                                </span>
                              </div>

                              {customer.assigned_printers?.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                  <thead>
                                    <tr>
                                      {['Printer', 'Toner Level', 'Pages Printed', 'Status', 'Error'].map(h => (
                                        <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customer.assigned_printers.map(p => {
                                      const tonerNum = parseInt(p.toner_level?.replace('%', '')) || 0;
                                      const isTonerError = p.toner_level === 'Insert Toner' || p.toner_level === 'Replace Toner';
                                      const tonerColor = isTonerError || tonerNum <= 10 ? 'var(--neon-rose)' : tonerNum <= 25 ? 'var(--neon-amber)' : 'var(--neon-emerald)';
                                      const { cls, label } = getStatusStyle(p);
                                      const isOffline = p.printer_status === 'Stopped' || p.printer_status === 'Offline';

                                      return (
                                        <tr key={p.ip_address} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                          <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                                            <div style={{ color: 'var(--text-primary)' }}>{p.qoa_num || p.ip_address}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>{p.model} · {p.ip_address}</div>
                                          </td>
                                          <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                              <div style={{ width: 60, height: 5, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                                                <div style={{ width: `${isTonerError ? 0 : tonerNum}%`, height: '100%', background: tonerColor, borderRadius: 99, boxShadow: `0 0 6px ${tonerColor}` }} />
                                              </div>
                                              <span style={{ color: tonerColor, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                {isTonerError ? p.toner_level : `${tonerNum}%`}
                                                {isOffline && <AlertTriangle size={11} style={{ color: 'var(--neon-amber)' }} title="Last known reading (Offline)" />}
                                              </span>
                                            </div>
                                          </td>
                                          <td style={{ padding: '0.875rem 1rem', color: isOffline ? 'var(--text-muted)' : 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                              {p.pages_printed && !isNaN(parseInt(p.pages_printed)) ? parseInt(p.pages_printed).toLocaleString() : '—'}
                                              {isOffline && <AlertTriangle size={11} style={{ color: 'var(--neon-amber)' }} title="Last known reading (Offline)" />}
                                            </div>
                                          </td>
                                          <td style={{ padding: '0.875rem 1rem' }}>
                                            <span className={`badge ${cls}`}>{label}</span>
                                          </td>
                                          <td style={{ padding: '0.875rem 1rem', color: p.error_status && p.error_status !== 'OK' ? 'var(--neon-rose)' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>
                                            {p.error_status && p.error_status !== 'OK' ? p.error_status : '—'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                  No printers currently assigned to this customer.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isEditMode ? <Edit size={16} style={{ color: 'var(--neon-cyan)' }} /> : <UserPlus size={16} style={{ color: 'var(--neon-cyan)' }} />}
                  {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                </h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={17} /></button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="error-msg" style={{ marginBottom: '1.25rem' }}>
                  <AlertTriangle size={14} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Company / Customer Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. MegaCorp Inc."
                    className="form-input"
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    value={newContact}
                    onChange={e => setNewContact(e.target.value)}
                    placeholder="contact@megacorp.com"
                    className="form-input"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'transparent', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>
                    {isEditMode ? 'Create / Update User Account (Optional)' : 'Create User Account (Optional)'}
                  </h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="customer_admin"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder={isEditMode ? 'Leave blank to keep unchanged' : '••••••••'}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={submitting}>
                    {submitting ? 'Saving…' : isEditMode ? '✓ Save Changes' : '✓ Create Customer'}
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

export default Customers;
