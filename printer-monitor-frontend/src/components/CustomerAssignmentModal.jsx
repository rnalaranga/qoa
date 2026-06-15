import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus, Users, Link2, AlertTriangle } from 'lucide-react';

const CustomerAssignmentModal = ({ printer, customers, onClose, onAssign }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAssign = async () => {
    setLoading(true);
    setError(null);
    try {
      let customerId = selectedCustomerId;
      if (isCreatingNew) {
        if (!newCustomerName.trim()) { setError('Customer name is required'); setLoading(false); return; }
        const res = await axios.post('http://153.75.225.81:5000/api/customers', { name: newCustomerName });
        customerId = res.data.id;
      }
      if (!customerId) { setError('Please select or create a customer'); setLoading(false); return; }
      await axios.put(`http://153.75.225.81:5000/api/printers/${printer.ip_address}/assign`, { customer_id: customerId });
      onAssign();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign printer');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      await axios.put(`http://153.75.225.81:5000/api/printers/${printer.ip_address}/assign`, { customer_id: null });
      onAssign();
      onClose();
    } catch {
      setError('Failed to unassign printer');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link2 size={17} style={{ color: 'var(--neon-cyan)' }} />
              Assign to Customer
            </h2>
            <p>{printer.ip_address} · {printer.model}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="modal-body">
          {/* Error */}
          {error && (
            <div className="error-msg" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="tab-group">
            <button
              className={`tab-btn ${!isCreatingNew ? 'active' : ''}`}
              onClick={() => setIsCreatingNew(false)}
            >
              <Users size={15} />
              Select Existing
            </button>
            <button
              className={`tab-btn ${isCreatingNew ? 'active' : ''}`}
              onClick={() => setIsCreatingNew(true)}
            >
              <UserPlus size={15} />
              New Customer
            </button>
          </div>

          {/* Content */}
          {!isCreatingNew ? (
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Choose Customer</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="form-select"
                >
                  <option value="">— Select a customer —</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="form-input"
                onKeyDown={e => e.key === 'Enter' && handleAssign()}
              />
            </div>
          )}

          {/* Footer */}
          <div className="modal-footer">
            <div>
              {printer.customer_id && (
                <button className="btn-danger-ghost" onClick={handleUnassign} disabled={loading}>
                  Unassign
                </button>
              )}
            </div>
            <div className="modal-footer-right">
              <button className="btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAssign} disabled={loading}>
                {loading ? 'Saving…' : '✓ Assign Printer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAssignmentModal;
