import React, { useState } from 'react';
import OrderCard from './OrderCard';
import { initials, avClass, fmtDate } from '../utils/helpers';

function SizesSummary({ customer }) {
  const sz = customer.Sizes || {};
  const allPeople = [...new Set([...Object.keys(sz.Shirts || {}), ...Object.keys(sz.Pants || {})])];

  if (!allPeople.length) {
    return <p className="sz-empty">No sizes saved yet. They're saved automatically when you create orders.</p>;
  }

  return allPeople.map((person, idx) => {
    const sh = sz.Shirts?.[person] || {};
    const pa = sz.Pants?.[person]  || {};
    const shEntries = Object.entries(sh).filter(([, v]) => v);
    const paEntries = Object.entries(pa).filter(([, v]) => v);

    return (
      <div key={person}>
        {idx > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 14px' }} />}
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.8rem', fontWeight: 700, marginBottom: 8, color: 'var(--ink2)' }}>
          👤 {person}
        </div>
        {shEntries.length > 0 && (
          <>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink3)', marginBottom: 5 }}>Shirt</div>
            <div className="sz-grid" style={{ marginBottom: 8 }}>
              {shEntries.map(([k, v]) => (
                <div key={k}>
                  <div className="sz-label">{k}</div>
                  <div className="sz-val">{v}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {paEntries.length > 0 && (
          <>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink3)', marginBottom: 5 }}>Pant</div>
            <div className="sz-grid">
              {paEntries.map(([k, v]) => (
                <div key={k}>
                  <div className="sz-label">{k}</div>
                  <div className="sz-val">{v}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  });
}

function SizesTab({ customer }) {
  const sz = customer.Sizes || {};
  const allPeople = [...new Set([...Object.keys(sz.Shirts || {}), ...Object.keys(sz.Pants || {})])];
  const [activePerson, setActivePerson] = useState(allPeople[0] || null);

  if (!allPeople.length) {
    return (
      <div className="card full">
        <p className="sz-empty">No sizes saved yet. They're saved automatically when you create orders.</p>
      </div>
    );
  }

  const sh = sz.Shirts?.[activePerson] || {};
  const pa = sz.Pants?.[activePerson]  || {};
  const shEntries = Object.entries(sh).filter(([, v]) => v);
  const paEntries = Object.entries(pa).filter(([, v]) => v);

  return (
    <>
      <div className="person-tabs">
        {allPeople.map(p => (
          <button key={p} className={`ptab${p === activePerson ? ' active' : ''}`} onClick={() => setActivePerson(p)}>
            {p}
          </button>
        ))}
      </div>
      <div className="cg">
        {shEntries.length > 0 && (
          <div className="card full">
            <div className="ct"><span className="ct-dot" style={{ background: 'var(--coral)' }} />Shirt Sizes</div>
            <div className="sz-grid">
              {shEntries.map(([k, v]) => (
                <div key={k}>
                  <div className="sz-label">{k}</div>
                  <div className="sz-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {paEntries.length > 0 && (
          <div className="card full">
            <div className="ct"><span className="ct-dot" style={{ background: 'var(--sky)' }} />Pant Sizes</div>
            <div className="sz-grid">
              {paEntries.map(([k, v]) => (
                <div key={k}>
                  <div className="sz-label">{k}</div>
                  <div className="sz-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!shEntries.length && !paEntries.length && (
          <div className="card full">
            <p className="sz-empty">No measurements saved for {activePerson} yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function DetailPanel({ customer, onEdit, onAddOrder, onEditOrder, onDeleteOrder, onStatusChange, onDeleteCustomer }) {
  const [tab, setTab] = useState('overview');

  if (!customer) {
    return (
      <div className="detail">
        <div className="welcome">
          <div className="wi">✂️</div>
          <h2>Select a customer</h2>
          <p>Pick someone from the list to view their profile, sizes, and orders.</p>
        </div>
      </div>
    );
  }

  const orders = customer.Orders || [];
  const sz = customer.Sizes || {};
  const allPeople = [...new Set([...Object.keys(sz.Shirts || {}), ...Object.keys(sz.Pants || {})])];

  return (
    <div className="detail">
      {/* Header */}
      <div className="dh">
        <div className={`dh-av ${avClass(customer.Name)}`}>{initials(customer.Name)}</div>
        <div className="dh-info">
          <div className="dh-name">{customer.Name}</div>
          <div className="dh-sub">
            {customer.Phone || 'No phone'} · {orders.length} order{orders.length !== 1 ? 's' : ''} · {allPeople.length} saved profile{allPeople.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="dh-actions">
          <button className="abtn danger" onClick={() => onDeleteCustomer(customer.id)}>🗑</button>
          <button className="abtn" onClick={() => onEdit(customer)}>✏ Edit</button>
          <button className="abtn accent" onClick={() => onAddOrder(customer.id)}>＋ Add Order</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'sizes', 'orders'].map(t => (
          <button
            key={t}
            className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? 'Overview' : t === 'sizes' ? 'Saved Sizes' : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="cg">
          <div className="card full">
            <div className="ct"><span className="ct-dot" style={{ background: 'var(--coral)' }} />Recent Orders</div>
            <div className="orders-list">
              {orders.length > 0
                ? [...orders].reverse().slice(0, 3).map(o => (
                    <OrderCard
                      key={o.id} order={o} customerId={customer.id}
                      onEdit={onEditOrder} onDelete={id => onDeleteOrder(customer.id, id)}
                      onStatusChange={(oid, s) => onStatusChange(customer.id, oid, s)}
                    />
                  ))
                : <p className="sz-empty">No orders yet. Use "+ Add Order" to create one.</p>
              }
            </div>
          </div>
          <div className="card full">
            <div className="ct"><span className="ct-dot" style={{ background: 'var(--violet)' }} />Saved Measurement Profiles</div>
            <SizesSummary customer={customer} />
          </div>
        </div>
      )}

      {/* Sizes */}
      {tab === 'sizes' && <SizesTab customer={customer} />}

      {/* Orders */}
      {tab === 'orders' && (
        <>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.85rem', fontWeight: 700, color: 'var(--ink2)', marginBottom: 12 }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
          <div className="orders-list">
            {orders.length > 0
              ? [...orders].reverse().map(o => (
                  <OrderCard
                    key={o.id} order={o} customerId={customer.id}
                    onEdit={onEditOrder} onDelete={id => onDeleteOrder(customer.id, id)}
                    onStatusChange={(oid, s) => onStatusChange(customer.id, oid, s)}
                  />
                ))
              : <p className="sz-empty">No orders yet. Use "+ Add Order" to create one.</p>
            }
          </div>
        </>
      )}
    </div>
  );
}
