import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { useCustomers } from './hooks/useCustomers';
import { initials, avClass, fmtDate, statusClass, statusLabel } from './utils/helpers';
import CustomerModal from './components/CustomerModal';
import OrderModal from './components/OrderModal';
import DetailPanel from './components/DetailPanel';

export default function App() {
  const {
    customers, addCustomer, updateCustomer, deleteCustomer,
    addOrder, updateOrder, deleteOrder, updateOrderStatus,
    exportBackup, importBackup,
  } = useCustomers();

  const [activeId, setActiveId]         = useState(null);
  const [search, setSearch]             = useState('');
  const [showSaveBadge, setShowSaveBadge] = useState(false);
  const saveBadgeTimer = useRef(null);

  // modals
  const [custModalOpen, setCustModalOpen]   = useState(false);
  const [editCustomer, setEditCustomer]     = useState(null);   // null = add mode
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderCustId, setOrderCustId]       = useState(null);
  const [editOrder, setEditOrder]           = useState(null);   // null = add mode

  const fileInputRef = useRef(null);

  const activeCustomer = customers.find(c => c.id === activeId) || null;

  function earliestPendingOrder(c) {
    return (c.Orders || [])
      .filter(o => o.Status !== 'Delivered' && o.DeliveryDate)
      .sort((a, b) => a.DeliveryDate.localeCompare(b.DeliveryDate))[0] || null;
  }

  function customerFinancials(c) {
    let total = 0, due = 0;
    for (const o of (c.Orders || [])) {
      const t = (parseFloat(o.PricePerItem) || 0) * (parseFloat(o.Quantity) || 1);
      const d = t - (parseFloat(o.Paid) || 0);
      if (o.Status !== 'Delivered' || d > 0) {
        total += t;
        due   += Math.max(0, d);
      }
    }
    return { total, due };
  }

  const filtered = customers
    .filter(c => c.Name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const da = earliestPendingOrder(a)?.DeliveryDate || null;
      const db = earliestPendingOrder(b)?.DeliveryDate || null;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });

  function flashSaved() {
    setShowSaveBadge(true);
    clearTimeout(saveBadgeTimer.current);
    saveBadgeTimer.current = setTimeout(() => setShowSaveBadge(false), 2000);
  }

  // ── Customer actions ──────────────────────────────────────────────────────
  function handleSaveCustomer(data) {
    if (editCustomer) {
      updateCustomer(editCustomer.id, data);
      flashSaved();
      setCustModalOpen(false);
      setEditCustomer(null);
    } else {
      const id = addCustomer(data);
      setActiveId(id);
      flashSaved();
      setCustModalOpen(false);
    }
  }

  function handleDeleteCustomer(id) {
    if (!window.confirm(`Delete all records for "${customers.find(c=>c.id===id)?.Name}"?`)) return;
    deleteCustomer(id);
    if (activeId === id) setActiveId(null);
    flashSaved();
  }

  // ── Order actions ─────────────────────────────────────────────────────────
  function openAddOrder(custId) {
    setOrderCustId(custId);
    setEditOrder(null);
    setOrderModalOpen(true);
  }

  function openEditOrder(order) {
    setOrderCustId(activeId);
    setEditOrder(order);
    setOrderModalOpen(true);
  }

  function handleSaveOrder(orderData, measurements, forName, type) {
    if (editOrder) {
      updateOrder(orderCustId, editOrder.id, orderData, measurements, forName, type);
    } else {
      addOrder(orderCustId, orderData, measurements, forName, type);
    }
    flashSaved();
    setOrderModalOpen(false);
    setEditOrder(null);
  }

  function handleDeleteOrder(custId, orderId) {
    if (!window.confirm('Delete this order?')) return;
    deleteOrder(custId, orderId);
    flashSaved();
  }

  function handleStatusChange(custId, orderId, status) {
    updateOrderStatus(custId, orderId, status);
    flashSaved();
  }

  // ── Backup ────────────────────────────────────────────────────────────────
  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const count = await importBackup(file);
      if (window.confirm(`Import ${count} record(s)? This replaces all current data.`)) {
        setActiveId(null);
        flashSaved();
      }
    } catch {
      alert('Invalid backup file.');
    }
    e.target.value = '';
  }

  return (
    <div className="app">

      {/* Topbar */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-icon">✂️</div>
          <div className="brand-name">Stitch (HB Tailors)<span>.</span></div>
        </div>
        <span className={`save-badge${showSaveBadge ? ' show' : ''}`}>✓ Auto-saved</span>
        <button className="tbtn" onClick={exportBackup}>📥 Export</button>
        <button className="tbtn" onClick={() => fileInputRef.current.click()}>📂 Import</button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </div>

      {/* Main */}
      <div className={`main${activeCustomer ? ' has-customer' : ''}`}>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sb-head">
            <div className="sb-title">
              Customers
              <span className="chip">{filtered.length}</span>
            </div>
            <div className="search-box">
              <span className="s-icon">⌕</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={() => { setEditCustomer(null); setCustModalOpen(true); }}>
              ＋ New Customer
            </button>
          </div>

          <div className="cust-scroll">
            {filtered.length === 0 ? (
              <div className="empty-sb">
                <div className="ei">{search ? '🔍' : '👗'}</div>
                <p>{search ? 'No customer found.' : 'No customers yet.\nAdd your first one!'}</p>
              </div>
            ) : (
              filtered.map(c => {
                const { total, due } = customerFinancials(c);
                const orders = (c.Orders || [])
                  .map(o => {
                    const t = (parseFloat(o.PricePerItem) || 0) * (parseFloat(o.Quantity) || 1);
                    const d = Math.max(0, t - (parseFloat(o.Paid) || 0));
                    return { ...o, _total: t, _due: d };
                  })
                  .filter(o => o.Status !== 'Delivered' || o._due > 0)
                  .sort((a, b) => (a.DeliveryDate || '').localeCompare(b.DeliveryDate || ''));
                return (
                  <div
                    key={c.id}
                    className={`cust-row${c.id === activeId ? ' active' : ''}`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <div className={`av ${avClass(c.Name)}`}>{initials(c.Name)}</div>
                    <div className="ci">
                      <div className="cn-row">
                        <span className="cn">{c.Name}</span>
                      </div>
                      {orders.length === 0
                        ? <div className="cs">{c.Phone || 'No phone'} · 0 orders</div>
                        : orders.map(o => (
                            <div key={o.id} className="cs-order-row">
                              <span className="cs-order-date">
                                {o.DeliveryDate ? `📅 ${fmtDate(o.DeliveryDate)}` : 'No date'}
                              </span>
                              <span className="cs-order-qty">×{o.Quantity || 1}</span>
                              <span className={`ostatus ${statusClass(o.Status || 'Pending')}`}>
                                {statusLabel(o.Status || 'Pending')}
                              </span>
                              {o._due > 0
                                ? <span className="cs-order-due">₹{o._due.toLocaleString('en-IN')} due</span>
                                : <span className="cs-order-paid">Paid</span>
                              }
                            </div>
                          ))
                      }
                      {total > 0 && (
                        <div className="cs-fin">
                          <span>₹{total.toLocaleString('en-IN')}</span>
                          {due > 0
                            ? <span className="cs-due">₹{due.toLocaleString('en-IN')} due</span>
                            : <span className="cs-paid">Fully paid</span>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail */}
        <DetailPanel
          customer={activeCustomer}
          onBack={() => setActiveId(null)}
          onEdit={c => { setEditCustomer(c); setCustModalOpen(true); }}
          onAddOrder={openAddOrder}
          onEditOrder={openEditOrder}
          onDeleteOrder={handleDeleteOrder}
          onStatusChange={handleStatusChange}
          onDeleteCustomer={handleDeleteCustomer}
        />
      </div>

      {/* Customer modal */}
      {custModalOpen && (
        <CustomerModal
          customer={editCustomer}
          customers={customers}
          onSave={handleSaveCustomer}
          onClose={() => { setCustModalOpen(false); setEditCustomer(null); }}
        />
      )}

      {/* Order modal */}
      {orderModalOpen && (
        <OrderModal
          customer={customers.find(c => c.id === orderCustId)}
          order={editOrder}
          onSave={handleSaveOrder}
          onClose={() => { setOrderModalOpen(false); setEditOrder(null); }}
        />
      )}
    </div>
  );
}
