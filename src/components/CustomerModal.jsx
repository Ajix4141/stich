import React, { useState, useEffect } from 'react';
import { validateCustomer } from '../utils/customerValidation';

export default function CustomerModal({ customer, customers = [], onSave, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setName(customer?.Name || '');
    setPhone(customer?.Phone || '');
  }, [customer]);

  function handleSave() {
    const error = validateCustomer({ name, phone, customers, editingId: customer?.id });
    if (error) { alert(error); return; }
    onSave({ Name: name.trim(), Phone: phone.trim() });
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-top">
          <div className="modal-heading">{customer ? `Edit — ${customer.Name}` : 'New Customer'}</div>
          <button className="mx" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fsec">Basic Info</div>
          <div className="fr">
            <div className="fg">
              <label>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ajit Mohalkar" />
            </div>
            <div className="fg">
              <label>Phone *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
            </div>
          </div>
          <div className="mfoot">
            <button className="abtn" onClick={onClose}>Cancel</button>
            <button className="abtn primary" onClick={handleSave}>Save Customer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
