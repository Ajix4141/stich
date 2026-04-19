import { useState, useCallback } from 'react';
import { uid, today } from '../utils/helpers';

const LS_KEY = 'stitch_v3';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function useCustomers() {
  const [customers, setCustomers] = useState(loadFromStorage);

  const persist = useCallback((updated) => {
    saveToStorage(updated);
    setCustomers(updated);
  }, []);

  // ── Customer operations ──────────────────────────────────────────────────
  const addCustomer = useCallback(({ Name, Phone }) => {
    const nc = {
      id: uid(),
      Name,
      Phone,
      Orders: [],
      Sizes: { Shirts: {}, Pants: {} },
    };
    const updated = [nc, ...customers];
    persist(updated);
    return nc.id;
  }, [customers, persist]);

  const updateCustomer = useCallback((id, { Name, Phone }) => {
    const updated = customers.map(c =>
      c.id === id ? { ...c, Name, Phone } : c
    );
    persist(updated);
  }, [customers, persist]);

  const deleteCustomer = useCallback((id) => {
    persist(customers.filter(c => c.id !== id));
  }, [customers, persist]);

  // ── Order operations ─────────────────────────────────────────────────────
  const addOrder = useCallback((customerId, orderData, measurements, forName, type) => {
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      const sizes = { Shirts: { ...c.Sizes?.Shirts }, Pants: { ...c.Sizes?.Pants } };

      // Save / update sizes for this person
      if (type === 'Shirt') {
        sizes.Shirts[forName] = { ...(sizes.Shirts[forName] || {}), ...measurements };
      } else {
        sizes.Pants[forName] = { ...(sizes.Pants[forName] || {}), ...measurements };
      }

      const newOrder = { id: uid(), ...orderData, measurements };
      return { ...c, Sizes: sizes, Orders: [...(c.Orders || []), newOrder] };
    });
    persist(updated);
  }, [customers, persist]);

  const updateOrder = useCallback((customerId, orderId, orderData, measurements, forName, type) => {
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      const sizes = { Shirts: { ...c.Sizes?.Shirts }, Pants: { ...c.Sizes?.Pants } };

      if (type === 'Shirt') {
        sizes.Shirts[forName] = { ...(sizes.Shirts[forName] || {}), ...measurements };
      } else {
        sizes.Pants[forName] = { ...(sizes.Pants[forName] || {}), ...measurements };
      }

      const orders = (c.Orders || []).map(o =>
        o.id === orderId ? { ...o, ...orderData, measurements } : o
      );
      return { ...c, Sizes: sizes, Orders: orders };
    });
    persist(updated);
  }, [customers, persist]);

  const deleteOrder = useCallback((customerId, orderId) => {
    // Only delete the order — Sizes for the profile are kept intentionally
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      return { ...c, Orders: (c.Orders || []).filter(o => o.id !== orderId) };
    });
    persist(updated);
  }, [customers, persist]);

  const updateOrderStatus = useCallback((customerId, orderId, status) => {
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        Orders: (c.Orders || []).map(o =>
          o.id === orderId ? { ...o, Status: status } : o
        ),
      };
    });
    persist(updated);
  }, [customers, persist]);

  // ── Backup ───────────────────────────────────────────────────────────────
  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'stitch-backup.json',
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }, [customers]);

  const importBackup = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const imp = Array.isArray(data) ? data : [data];
          persist(imp);
          resolve(imp.length);
        } catch {
          reject(new Error('Invalid backup file'));
        }
      };
      reader.readAsText(file);
    });
  }, [persist]);

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    exportBackup,
    importBackup,
  };
}
