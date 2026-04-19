import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { useCustomers } from './hooks/useCustomers';
import { initials, avClass } from './utils/helpers';
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
  const filtered = customers.filter(c =>
    c.Name?.toLowerCase().includes(search.toLowerCase())
  );

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
                placeholder="Search by name…"
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
              filtered.map(c => (
                <div
                  key={c.id}
                  className={`cust-row${c.id === activeId ? ' active' : ''}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className={`av ${avClass(c.Name)}`}>{initials(c.Name)}</div>
                  <div className="ci">
                    <div className="cn">{c.Name}</div>
                    <div className="cs">
                      {c.Phone || 'No phone'} · {(c.Orders || []).length} order{(c.Orders || []).length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))
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
