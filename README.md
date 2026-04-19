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
