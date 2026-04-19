# ✂️ Stitch — Tailor's Book

A React app to manage customer measurements and orders for your tailoring shop.

---

## Setup (one time only)

Make sure you have **Node.js** installed. Download it from https://nodejs.org if you don't.

Then open a terminal in this folder and run:

```bash
npm install
```

---

## Run the app

```bash
npm start
```

This opens the app in your browser at `http://localhost:3000`.  
The app will **not** open by simply clicking `index.html` — you always run it via the terminal.

---

## Project structure

```
stitch/
├── public/
│   └── index.html          # HTML shell (no app logic here)
├── src/
│   ├── index.js            # React entry point
│   ├── index.css           # Global resets + CSS variables
│   ├── App.jsx             # Root component, state wiring
│   ├── App.css             # All styles
│   ├── hooks/
│   │   └── useCustomers.js # All data logic (localStorage + CRUD)
│   ├── utils/
│   │   └── helpers.js      # Pure utility functions
│   └── components/
│       ├── CustomerModal.jsx   # Add / edit customer
│       ├── OrderModal.jsx      # Add / edit order (with autocomplete)
│       ├── ForAutocomplete.jsx # Name autocomplete with size prefill
│       ├── OrderCard.jsx       # Expandable order card
│       └── DetailPanel.jsx     # Right panel with tabs
└── package.json
```

---

## Data

- All data is saved to **localStorage** automatically after every change.
- Use **Export** to download a `stitch-backup.json` file anytime.
- Use **Import** to restore from a backup (e.g. when switching computers).

---

## Component Flow Tree

```
App  [src/App.jsx]
│   State: activeId, search, showSaveBadge, custModalOpen,
│          editCustomer, orderModalOpen, orderCustId, editOrder
│   Hook:  useCustomers() → customers[], addCustomer, updateCustomer,
│          deleteCustomer, addOrder, updateOrder, deleteOrder,
│          updateOrderStatus, exportBackup, importBackup
│
├── Sidebar (inline JSX in App)
│   └── customer rows → onClick: setActiveId(c.id)
│
├── DetailPanel  [src/components/DetailPanel.jsx]
│   Props: customer, onBack, onEdit, onAddOrder, onEditOrder,
│          onDeleteOrder, onStatusChange, onDeleteCustomer
│   State: tab ('overview' | 'sizes' | 'orders')
│   │
│   ├── SizesSummary (internal)   props: customer
│   ├── SizesTab    (internal)    props: customer
│   │     State: activePerson
│   └── OrderCard  [src/components/OrderCard.jsx]
│         Props: order, customerId, onEdit, onDelete, onStatusChange
│         State: open (expand/collapse)
│         Utils: fmtDate, statusClass, statusLabel, SHIRT_LABELS, PANT_LABELS
│
├── CustomerModal  [src/components/CustomerModal.jsx]
│   Props: customer, customers[], onSave, onClose
│   State: name, phone
│   Utils: validateCustomer()
│
└── OrderModal  [src/components/OrderModal.jsx]
    Props: customer, order, onSave, onClose
    State: type, forName, subtype, qty, price, date, status,
           shirtM, pantM, prefilled
    Utils: validateOrder(), today(), SHIRT_FIELDS, PANT_FIELDS
    │
    └── ForAutocomplete  [src/components/ForAutocomplete.jsx]
          Props: customer, value, onChange, onSelect
          State: open, focusIdx
          Utils: initials, avClass, buildAcHint, getKnownNames
```

---

## Data Shape

All data lives in `localStorage` under the key `stitch_v3`:

```js
Customer {
  id, Name, Phone,
  Orders: [{ id, Type, 'Shirt Type'|'Pant Type', Sizes,
             Quantity, Price, Date, Status, measurements{} }],
  Sizes: {
    Shirts: { [personName]: { shirtlen, chest, shoulder, sleeve, neck, cuff, hip, stomach } },
    Pants:  { [personName]: { length, waist, hip, thigh, knee, bottom, inseam, seat } }
  }
}
```

---

## CSS Class Map

### App shell
| Class | Used in |
|---|---|
| `.app` | App.jsx — root grid (rows: auto 1fr) |
| `.topbar` | App.jsx — flex nav bar |
| `.brand` / `.brand-icon` / `.brand-name` | App.jsx |
| `.save-badge` / `.save-badge.show` | App.jsx |
| `.tbtn` | App.jsx — Export / Import buttons |
| `.main` / `.main.has-customer` | App.jsx — 2-col grid, customer toggle class |

### Sidebar
| Class | Used in |
|---|---|
| `.sidebar` / `.sb-head` / `.sb-title` | App.jsx |
| `.chip` | App.jsx — customer count badge |
| `.search-box` / `.s-icon` | App.jsx |
| `.add-btn` | App.jsx — New Customer button |
| `.cust-scroll` | App.jsx — scrollable list |
| `.cust-row` / `.cust-row.active` | App.jsx |
| `.ci` / `.cn` / `.cs` | App.jsx — customer info inside row |
| `.empty-sb` / `.ei` | App.jsx — empty state |

### Avatars
| Class | Used in |
|---|---|
| `.av` / `.av0`–`.av7` | App.jsx, DetailPanel.jsx, OrderCard.jsx, ForAutocomplete.jsx |
| `.dh-av` | DetailPanel.jsx — 56px header avatar |
| `.ac-avatar` | ForAutocomplete.jsx — 30px dropdown avatar |

### Detail panel
| Class | Used in |
|---|---|
| `.detail` | DetailPanel.jsx |
| `.welcome` / `.wi` | DetailPanel.jsx — no-customer state |
| `.mob-back` | DetailPanel.jsx — back button (hidden on desktop) |
| `.dh` / `.dh-info` / `.dh-name` / `.dh-sub` / `.dh-actions` | DetailPanel.jsx |
| `.tabs` / `.tab` / `.tab.active` | DetailPanel.jsx |
| `.cg` / `.card` / `.card.full` / `.ct` / `.ct-dot` | DetailPanel.jsx |
| `.person-tabs` / `.ptab` / `.ptab.active` | DetailPanel.jsx — sizes profile picker |
| `.sz-grid` / `.sz-label` / `.sz-val` / `.sz-empty` | DetailPanel.jsx |
| `.orders-list` | DetailPanel.jsx, OrderCard.jsx |

### Order card
| Class | Used in |
|---|---|
| `.order-card` / `.order-head` / `.order-body` / `.order-foot` | OrderCard.jsx |
| `.otype` / `.otype-shirt` / `.otype-pant` | OrderCard.jsx |
| `.ofor-block` / `.ofor` / `.ofor-meta` | OrderCard.jsx |
| `.ostatus` / `.s-pending` / `.s-ready` / `.s-delivered` | OrderCard.jsx |
| `.oprice` / `.ochev` / `.ochev.open` | OrderCard.jsx |
| `.omeasure-grid` / `.om-lbl` / `.om-val` | OrderCard.jsx |
| `.status-sel` | OrderCard.jsx — status dropdown |

### Buttons
| Class | Used in |
|---|---|
| `.abtn` | DetailPanel.jsx, CustomerModal.jsx, OrderModal.jsx, OrderCard.jsx |
| `.abtn.primary` | CustomerModal.jsx, OrderModal.jsx |
| `.abtn.accent` | DetailPanel.jsx — Add Order |
| `.abtn.danger` | DetailPanel.jsx, OrderCard.jsx |

### Modals
| Class | Used in |
|---|---|
| `.overlay` / `.modal` | CustomerModal.jsx, OrderModal.jsx |
| `.modal-top` / `.modal-heading` / `.mx` / `.mbody` / `.mfoot` | CustomerModal.jsx, OrderModal.jsx |

### Forms
| Class | Used in |
|---|---|
| `.fsec` / `.fr` / `.fr3` / `.fg` / `.fg.full` | CustomerModal.jsx, OrderModal.jsx |
| `.type-toggle` / `.ttype` / `.ttype.sel-shirt` / `.ttype.sel-pant` | OrderModal.jsx |
| `.prefill-note` | OrderModal.jsx |

### Autocomplete
| Class | Used in |
|---|---|
| `.ac-wrap` / `.ac-dropdown` | ForAutocomplete.jsx |
| `.ac-item` / `.ac-item.focused` / `.ac-name` / `.ac-hint` / `.ac-new` | ForAutocomplete.jsx |

### Responsive (≤768px)
| Selector | Effect |
|---|---|
| `.main` | Single column |
| `.main:not(.has-customer) .detail` | Hide detail when no customer selected |
| `.main.has-customer .sidebar` | Hide sidebar when customer selected |
| `.mob-back` | Show back button |
| `.tabs` / `.tab` | Full-width equal tabs |
| `.cg` | 1-col cards |
| `.sz-grid` | 3-col (was 4) |
| `.omeasure-grid` | 2-col (was 3) |
| `.fr` / `.fr3` | 1-col / 2-col (was 2 / 3) |
| `.overlay` / `.modal` | Bottom sheet, rounded top only |
