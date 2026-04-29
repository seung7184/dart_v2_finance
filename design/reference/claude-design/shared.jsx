// Shared icon components (simple, line, 1.5 stroke) — used across showcases

const Icon = {
  Plus: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  ArrowRight: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  ArrowUp: (props) => (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9V3M3 6l3-3 3 3"/>
    </svg>
  ),
  ArrowDown: (props) => (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3v6M3 6l3 3 3-3"/>
    </svg>
  ),
  Check: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12l5 5L20 6"/>
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
    </svg>
  ),
  Home: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-9z"/>
    </svg>
  ),
  Activity: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12h4l3-8 4 16 3-8h4"/>
    </svg>
  ),
  Chart: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>
    </svg>
  ),
  Gear: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Bank: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-7h6v7"/>
    </svg>
  ),
  Leaf: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 4c-4 0-10 1-13 6-2 4-1 9 2 11 3 1 8 1 11-3 3-4 3-10 0-14zM6 18c4-4 8-6 12-8"/>
    </svg>
  ),
  Shop: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 7zM9 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
  ),
  Bolt: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
    </svg>
  ),
  Train: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 12h14M8 20l-2 2M16 20l2 2"/><circle cx="9" cy="15" r=".5" fill="currentColor"/><circle cx="15" cy="15" r=".5" fill="currentColor"/>
    </svg>
  ),
  Signal: (props) => (
    <svg viewBox="0 0 16 12" width="16" height="10" fill="currentColor" {...props}>
      <rect x="0" y="8" width="3" height="4" rx="1"/>
      <rect x="4" y="6" width="3" height="6" rx="1"/>
      <rect x="8" y="3" width="3" height="9" rx="1"/>
      <rect x="12" y="0" width="3" height="12" rx="1"/>
    </svg>
  ),
  Battery: (props) => (
    <svg viewBox="0 0 24 12" width="24" height="10" fill="none" stroke="currentColor" strokeWidth="1" {...props}>
      <rect x="1" y="1" width="20" height="10" rx="2.5"/>
      <rect x="22" y="4" width="1.5" height="4" rx="0.5" fill="currentColor"/>
      <rect x="3" y="3" width="16" height="6" rx="1.5" fill="currentColor"/>
    </svg>
  ),
  Wifi: (props) => (
    <svg viewBox="0 0 16 12" width="16" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
      <path d="M1 4.5a11 11 0 0 1 14 0M3 7a7 7 0 0 1 10 0M5.5 9.5a3 3 0 0 1 5 0"/>
      <circle cx="8" cy="11" r="0.8" fill="currentColor"/>
    </svg>
  ),
};

window.Icon = Icon;

// Brand lettermark
const BrandMark = ({ size = 28 }) => (
  <div
    className="sidebar-brand-mark"
    style={{ width: size, height: size, fontSize: size * 0.57, borderRadius: size * 0.22 }}
  >
    D
  </div>
);
window.BrandMark = BrandMark;

// Small helpers
const fmtEUR = (n, opts = {}) => {
  const f = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', ...opts });
  return f.format(n);
};
const fmtEURnum = (n) => {
  // Just the number part, for composition with a separate symbol
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};
window.fmtEUR = fmtEUR;
window.fmtEURnum = fmtEURnum;
