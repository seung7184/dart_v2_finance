// Shared web chrome: sidebar + topbar. Toss-calm, dark.

const { Icon, BrandMark } = window;

const WebShell = ({ active = "transactions", children, topbar }) => {
  const nav = [
    { id: "home",         label: "Home",         icon: <Icon.Home />     },
    { id: "transactions", label: "Transactions", icon: <Icon.Activity /> },
    { id: "budget",       label: "Budget",       icon: <Icon.Chart />    },
    { id: "investing",    label: "Investing",    icon: <Icon.Leaf />     },
    { id: "accounts",     label: "Accounts",     icon: <Icon.Bank />     },
  ];
  const tools = [
    { id: "import",       label: "Import CSV",   icon: <Icon.ArrowRight /> },
    { id: "settings",     label: "Settings",     icon: <Icon.Gear />    },
  ];
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "224px 1fr",
      background: "var(--surface-0)",
      fontFamily: "var(--font-sans)",
      color: "var(--text-secondary)",
    }}>
      {/* Sidebar */}
      <aside style={{
        borderRight: "1px solid var(--border-subtle)",
        padding: "22px 14px",
        display: "flex", flexDirection: "column", gap: 18,
        background: "var(--surface-0)",
        position: "sticky", top: 0, alignSelf: "start", height: "100vh",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 10px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--accent-500)", color: "#fff",
            display: "grid", placeItems: "center",
            fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em",
          }}>D</div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Dart Finance
          </div>
        </div>

        <NavSection label="Workspace" items={nav} active={active} />
        <NavSection label="Tools" items={tools} active={active} />

        <div style={{ marginTop: "auto", padding: "10px 10px 0", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              background: "var(--surface-2)", color: "var(--text-primary)",
              display: "grid", placeItems: "center",
              fontWeight: 600, fontSize: 12,
            }}>LV</div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>
                Lars van Dijk
              </span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                lars@dart.eu
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {topbar}
        <div style={{ padding: "24px 32px 48px", display: "flex", flexDirection: "column", gap: 20 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

const NavSection = ({ label, items, active }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "var(--text-tertiary)",
      padding: "0 10px 6px",
    }}>{label}</div>
    {items.map(it => {
      const on = it.id === active;
      return (
        <div key={it.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "7px 10px", borderRadius: 8,
          background: on ? "var(--surface-2)" : "transparent",
          color: on ? "var(--text-primary)" : "var(--text-secondary)",
          fontSize: 13, fontWeight: on ? 600 : 500,
          letterSpacing: "-0.005em",
          cursor: "pointer",
        }}>
          <span style={{ color: on ? "var(--text-primary)" : "var(--text-tertiary)", display: "inline-flex" }}>
            {it.icon}
          </span>
          <span>{it.label}</span>
        </div>
      );
    })}
  </div>
);

const WebTopbar = ({ title, sub, right }) => (
  <div style={{
    padding: "18px 32px",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16,
    background: "var(--surface-0)",
  }}>
    <div>
      <h1 style={{
        margin: 0, fontSize: 20, fontWeight: 600,
        color: "var(--text-primary)", letterSpacing: "-0.02em",
      }}>{title}</h1>
      {sub && <div style={{
        fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, letterSpacing: "-0.005em",
      }}>{sub}</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{right}</div>
  </div>
);

window.WebShell = WebShell;
window.WebTopbar = WebTopbar;

// ── Shared small atoms ──────────────────────────────────────────────────────

const WebBtn = ({ variant = "secondary", children, icon, onClick }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 32, padding: "0 12px",
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
    letterSpacing: "-0.005em",
    borderRadius: 8, cursor: "pointer",
    transition: "background 140ms cubic-bezier(0.2,0,0,1), border-color 140ms cubic-bezier(0.2,0,0,1)",
  };
  const styles = variant === "primary" ? {
    background: "var(--accent-500)", color: "#fff", border: "1px solid var(--accent-500)",
  } : variant === "ghost" ? {
    background: "transparent", color: "var(--text-secondary)", border: "1px solid transparent",
  } : {
    background: "var(--surface-1)", color: "var(--text-primary)",
    border: "1px solid var(--border-default)",
  };
  return (
    <button onClick={onClick} style={{ ...base, ...styles }}>
      {icon}{children}
    </button>
  );
};

window.WebBtn = WebBtn;

// Format nl-NL
const fmtEUR2 = (n) => new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Math.abs(n));
window.fmtEUR2 = fmtEUR2;
