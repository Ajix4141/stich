import React, { useState } from 'react';
import { fmtDate, statusClass, statusLabel, SHIRT_LABELS, PANT_LABELS } from '../utils/helpers';

export default function OrderCard({ order, customerId, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const isShirt  = order.Type === 'Shirt';
  const labels   = isShirt ? SHIRT_LABELS : PANT_LABELS;
  const measures = Object.entries(order.measurements || {}).filter(([, v]) => v);

  const metaParts = [
    order['Shirt Type'] || order['Pant Type'],
    order.Quantity ? `Qty: ${order.Quantity}` : '',
    order.Date     ? fmtDate(order.Date) : '',
  ].filter(Boolean);

  return (
    <div className="order-card">
      <div className="order-head" onClick={() => setOpen(o => !o)}>
        <span className={`otype ${isShirt ? 'otype-shirt' : 'otype-pant'}`}>
          {isShirt ? '👔 Shirt' : '👖 Pant'}
        </span>
        <div className="ofor-block">
          <div className="ofor">For: {order.Sizes || '—'}</div>
          <div className="ofor-meta">{metaParts.join(' · ')}</div>
        </div>
        <span className={`ostatus ${statusClass(order.Status || 'Pending')}`}>
          {statusLabel(order.Status || 'Pending')}
        </span>
        {order.Price && <span className="oprice">{order.Price}</span>}
        <span className={`ochev${open ? ' open' : ''}`}>▼</span>
      </div>

      {open && (
        <div className="order-body">
          {measures.length > 0 ? (
            <div className="omeasure-grid">
              {measures.map(([k, v]) => (
                <div key={k}>
                  <div className="om-lbl">{labels[k] || k}</div>
                  <div className="om-val">{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="sz-empty" style={{ marginBottom: 12 }}>No measurements recorded.</p>
          )}
          <div className="order-foot">
            <select
              className="status-sel"
              value={order.Status || 'Pending'}
              onChange={e => onStatusChange(order.id, e.target.value)}
            >
              <option value="Pending">⏳ Pending</option>
              <option value="Ready">✅ Ready</option>
              <option value="Delivered">📦 Delivered</option>
            </select>
            <button className="abtn danger" onClick={() => onDelete(order.id)}>🗑 Delete</button>
            <button className="abtn" onClick={() => onEdit(order)}>✏ Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}
