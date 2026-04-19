import React, { useState, useEffect } from 'react';
import ForAutocomplete from './ForAutocomplete';
import { today } from '../utils/helpers';
import { SHIRT_FIELDS, PANT_FIELDS } from '../constants/fields';
import { validateOrder } from '../utils/orderValidation';

const emptyShirt = () => Object.fromEntries(SHIRT_FIELDS.map(f => [f.key, '']));
const emptyPant  = () => Object.fromEntries(PANT_FIELDS.map(f => [f.key, '']));

export default function OrderModal({ customer, order, onSave, onClose }) {
  const [type, setType]       = useState('Shirt');
  const [forName, setForName] = useState('');
  const [subtype, setSubtype] = useState('');
  const [qty, setQty]         = useState('');
  const [price, setPrice]     = useState('');
  const [date, setDate]       = useState(today());
  const [status, setStatus]   = useState('Pending');
  const [shirtM, setShirtM]   = useState(emptyShirt());
  const [pantM, setPantM]     = useState(emptyPant());
  const [prefilled, setPrefilled] = useState(false);

  // Populate form when editing an existing order
  useEffect(() => {
    if (order) {
      setType(order.Type || 'Shirt');
      setForName(order.Sizes || '');
      setSubtype(order['Shirt Type'] || order['Pant Type'] || '');
      setQty(order.Quantity || '');
      setPrice(order.Price || '');
      setDate(order.Date || today());
      setStatus(order.Status || 'Pending');
      const m = order.measurements || {};
      if (order.Type === 'Shirt') setShirtM({ ...emptyShirt(), ...m });
      else setPantM({ ...emptyPant(), ...m });
    } else {
      // Default "for" to customer's own name and prefill their sizes
      const name = customer?.Name || '';
      setForName(name);
      prefillFromSaved(name, 'Shirt');
    }
  }, [order, customer]);

  function prefillFromSaved(name, t) {
    const sz = customer?.Sizes || {};
    if (t === 'Shirt') {
      const saved = name && sz.Shirts?.[name];
      if (saved && Object.values(saved).some(Boolean)) {
        setShirtM({ ...emptyShirt(), ...saved });
        setPrefilled(true);
        return;
      }
      setShirtM(emptyShirt());
    } else {
      const saved = name && sz.Pants?.[name];
      if (saved && Object.values(saved).some(Boolean)) {
        setPantM({ ...emptyPant(), ...saved });
        setPrefilled(true);
        return;
      }
      setPantM(emptyPant());
    }
    setPrefilled(false);
  }

  function handleTypeChange(t) {
    setType(t);
    prefillFromSaved(forName, t);
  }

  function handleForSelect(name) {
    prefillFromSaved(name, type);
  }

  function handleSave() {
    const error = validateOrder({ forName, qty, price, type, shirtM, pantM });
    if (error) { alert(error); return; }
    const mState = type === 'Shirt' ? shirtM : pantM;
    const measurements = Object.fromEntries(Object.entries(mState).filter(([, v]) => v));

    const subKey = type === 'Shirt' ? 'Shirt Type' : 'Pant Type';
    const orderData = {
      Type: type,
      [subKey]: subtype,
      Sizes: forName.trim(),
      Quantity: qty,
      Price: price,
      Date: date || today(),
      Status: status || 'Pending',
    };
    onSave(orderData, measurements, forName.trim(), type);
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-top">
          <div className="modal-heading">
            {order ? 'Edit Order' : `New Order — ${customer?.Name || ''}`}
          </div>
          <button className="mx" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">

          {/* Type */}
          <div className="fsec">Order Type</div>
          <div className="type-toggle">
            <button className={`ttype${type === 'Shirt' ? ' sel-shirt' : ''}`} onClick={() => handleTypeChange('Shirt')}>👔 Shirt</button>
            <button className={`ttype${type === 'Pant'  ? ' sel-pant'  : ''}`} onClick={() => handleTypeChange('Pant')}>👖 Pant</button>
          </div>

          {/* Details */}
          <div className="fsec">Order Details</div>
          <div className="fr">
            <div className="fg">
              <label>For (Name) *</label>
              <ForAutocomplete
                customer={customer}
                value={forName}
                onChange={setForName}
                onSelect={handleForSelect}
              />
              {prefilled && (
                <div className="prefill-note">✓ Sizes pre-filled from saved measurements</div>
              )}
            </div>
            <div className="fg">
              <label>Quantity</label>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="1" min="1" />
            </div>
          </div>

          <div className="fr" style={{ marginTop: 10 }}>
            <div className="fg">
              <label>{type === 'Shirt' ? 'Shirt Type' : 'Pant Type'}</label>
              <input value={subtype} onChange={e => setSubtype(e.target.value)} placeholder="e.g. Formal, Kurta, Casual…" />
            </div>
            <div className="fg">
              <label>Price</label>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 1500 Rs" />
            </div>
          </div>

          <div className="fr" style={{ marginTop: 10 }}>
            <div className="fg">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="fg">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Pending">⏳ Pending</option>
                <option value="Ready">✅ Ready</option>
                <option value="Delivered">📦 Delivered</option>
              </select>
            </div>
          </div>

          {/* Shirt measurements */}
          {type === 'Shirt' && (
            <>
              <div className="fsec">
                Shirt Measurements
                <span style={{ fontWeight: 400, color: 'var(--ink3)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>
                  {' '}— auto-filled if name is known
                </span>
              </div>
              <div className="fr3">
                {SHIRT_FIELDS.map(({ key, label }) => (
                  <div className="fg" key={key}>
                    <label>{label}</label>
                    <input
                      type="text"
                      value={shirtM[key]}
                      required={true}
                      onChange={e => setShirtM(m => ({ ...m, [key]: e.target.value }))}
                      placeholder={`e.g. 42"`}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pant measurements */}
          {type === 'Pant' && (
            <>
              <div className="fsec">
                Pant Measurements
                <span style={{ fontWeight: 400, color: 'var(--ink3)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>
                  {' '}— auto-filled if name is known
                </span>
              </div>
              <div className="fr3">
                {PANT_FIELDS.map(({ key, label }) => (
                  <div className="fg" key={key}>
                    <label>{label}</label>
                    <input
                      type="text"
                      value={pantM[key]}
                      onChange={e => setPantM(m => ({ ...m, [key]: e.target.value }))}
                      placeholder={`e.g. 34"`}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mfoot">
            <button className="abtn" onClick={onClose}>Cancel</button>
            <button className="abtn primary" onClick={handleSave}>Save Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}
