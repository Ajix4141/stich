import React, { useState } from 'react';
import { fmtDate, statusClass, statusLabel, SHIRT_LABELS, PANT_LABELS } from '../utils/helpers';

export default function OrderCard({ order, customerId, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const isShirt   = order.Type === 'Shirt';
  const labels    = isShirt ? SHIRT_LABELS : PANT_LABELS;
  const measures  = Object.entries(order.measurements || {}).filter(([, v]) => v);
  const unitPrice = parseFloat(order.PricePerItem) || 0;
  const total     = unitPrice * (parseFloat(order.Quantity) || 1);
  const paidAmt   = parseFloat(order.Paid) || 0;
  const remaining = total - paidAmt;

  const metaParts = [
    order['Shirt Type'] || order['Pant Type'],
    order.Quantity     ? `Qty: ${order.Quantity}` : '',
    order.Date         ? fmtDate(order.Date) : '',
    order.DeliveryDate ? `Due: ${fmtDate(order.DeliveryDate)}` : '',
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
        {order.PricePerItem && (
          <div className="oprice-block">
            <span className="oprice">₹{total.toLocaleString('en-IN')}</span>
            {remaining > 0
              ? <span className="oprice-due">₹{remaining.toLocaleString('en-IN')} due</span>
              : <span className="oprice-paid">Paid</span>
            }
          </div>
        )}
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
          {!!order.PricePerItem && (
            <div className="pay-summary">
              <div className="pay-row"><span className="pay-lbl">Price / item</span><span className="pay-val">₹{unitPrice.toLocaleString('en-IN')}</span></div>
              <div className="pay-row"><span className="pay-lbl">Total</span><span className="pay-val">₹{total.toLocaleString('en-IN')}</span></div>
              <div className="pay-row"><span className="pay-lbl">Paid</span><span className="pay-val">₹{paidAmt.toLocaleString('en-IN')}</span></div>
              <div className={`pay-row${remaining > 0 ? ' pay-due' : ''}`}><span className="pay-lbl">Remaining</span><span className="pay-val">₹{remaining.toLocaleString('en-IN')}</span></div>
            </div>
          )}
          {order.Notes && (
            <div className="order-notes">{order.Notes}</div>
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
