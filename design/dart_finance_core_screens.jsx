import { useState } from "react";

const screens = [
  "Mobile Home",
  "Mobile Quick Add",
  "Web Transactions",
  "Web CSV Mapping",
  "Web Why This Number",
];

const colors = {
  bg: "#0f1117",
  sidebar: "#0a0c10",
  surface: "#161b22",
  surfaceHover: "#1c2330",
  border: "#21262d",
  accent: "#3b82f6",
  accentMuted: "#1d3a6e",
  text: "#e6edf3",
  textMuted: "#8b949e",
  textFaint: "#484f58",
  positive: "#3fb950",
  negative: "#f85149",
  warning: "#d29922",
  safe: "#58a6ff",
};

// ─── Screen 1: Mobile Home ───────────────────────────────────────────────────
function MobileHome() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        width: 360,
        background: colors.bg,
        borderRadius: 32,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Status bar */}
        <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", color: colors.textMuted, fontSize: 12 }}>
          <span>9:41</span>
          <span>●●●</span>
        </div>

        {/* Header */}
        <div style={{ padding: "20px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: colors.textMuted, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>Good morning</div>
            <div style={{ color: colors.text, fontSize: 18, fontWeight: 600, marginTop: 2 }}>Lars</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: colors.accentMuted, display: "flex", alignItems: "center", justifyContent: "center", color: colors.accent, fontWeight: 700, fontSize: 14 }}>L</div>
        </div>

        {/* Safe to spend hero */}
        <div style={{ padding: "24px 24px 20px", textAlign: "center" }}>
          <div style={{ color: colors.textMuted, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Safe to spend today</div>
          <div style={{ color: colors.safe, fontSize: 52, fontWeight: 700, letterSpacing: "-2px", lineHeight: 1 }}>€ 37,20</div>
          <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 10 }}>Until payday on the 25th · 8 days</div>
        </div>

        {/* Cards */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* This month */}
          <div style={{ background: colors.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>This month remaining</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <div style={{ color: colors.text, fontSize: 22, fontWeight: 600 }}>€ 298</div>
              <div style={{ color: colors.textFaint, fontSize: 12 }}>of € 1,240 budget</div>
            </div>
            <div style={{ marginTop: 8, height: 3, background: colors.border, borderRadius: 2 }}>
              <div style={{ height: "100%", width: "24%", background: colors.accent, borderRadius: 2 }} />
            </div>
          </div>

          {/* Next bills */}
          <div style={{ background: colors.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Next bills due</div>
            {[
              { name: "Rent", date: "Apr 25", amount: "€ 850" },
              { name: "Spotify", date: "Apr 23", amount: "€ 11,99" },
              { name: "Gym", date: "Apr 28", amount: "€ 29,99" },
            ].map((bill, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < 2 ? 8 : 0, borderBottom: i < 2 ? `1px solid ${colors.border}` : "none", marginBottom: i < 2 ? 8 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.warning }} />
                  <span style={{ color: colors.text, fontSize: 13 }}>{bill.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: colors.text, fontSize: 13, fontWeight: 500 }}>{bill.amount}</div>
                  <div style={{ color: colors.textFaint, fontSize: 11 }}>{bill.date}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Planned investing */}
          <div style={{ background: colors.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${colors.border}`, marginBottom: 16 }}>
            <div style={{ color: colors.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Planned investing · April</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <div style={{ color: colors.text, fontSize: 22, fontWeight: 600 }}>€ 800</div>
              <div style={{ background: colors.accentMuted, color: colors.accent, fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500 }}>Protected</div>
            </div>
            <div style={{ color: colors.textFaint, fontSize: 12, marginTop: 4 }}>VWCE + SXR8 · Target Apr 28</div>
          </div>
        </div>

        {/* Quick add FAB */}
        <div style={{ padding: "0 16px 28px" }}>
          <div style={{ background: colors.accent, borderRadius: 14, padding: "14px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
            + Quick Add Expense
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Mobile Quick Add ─────────────────────────────────────────────
function MobileQuickAdd() {
  const [amount, setAmount] = useState("12,50");
  const [selected, setSelected] = useState("Groceries");
  const cats = ["Groceries", "Transport", "Dining", "Health", "Other"];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 360, background: colors.bg, borderRadius: 32, border: `1px solid ${colors.border}`, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Handle */}
        <div style={{ paddingTop: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: colors.border }} />
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ color: colors.text, fontSize: 18, fontWeight: 600 }}>Add Expense</div>
          <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>April 22, 2026</div>
        </div>

        {/* Amount display */}
        <div style={{ textAlign: "center", padding: "32px 24px 16px" }}>
          <div style={{ color: colors.textFaint, fontSize: 14, marginBottom: 4 }}>EUR</div>
          <div style={{ color: colors.text, fontSize: 56, fontWeight: 700, letterSpacing: "-2px" }}>€ {amount}</div>
        </div>

        {/* Categories */}
        <div style={{ padding: "0 16px", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {cats.map(c => (
            <div key={c} onClick={() => setSelected(c)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${selected === c ? colors.accent : colors.border}`, background: selected === c ? colors.accentMuted : colors.surface, color: selected === c ? colors.accent : colors.textMuted, fontSize: 13, cursor: "pointer", fontWeight: selected === c ? 600 : 400, transition: "all 0.15s" }}>
              {c}
            </div>
          ))}
        </div>

        {/* Keypad */}
        <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
          {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(k => (
            <div key={k} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "16px 0", textAlign: "center", color: colors.text, fontSize: 22, fontWeight: k === "⌫" ? 400 : 500, cursor: "pointer" }}>
              {k}
            </div>
          ))}
        </div>

        {/* Save */}
        <div style={{ padding: "0 16px 28px" }}>
          <div style={{ background: colors.accent, borderRadius: 14, padding: "14px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
            Save — € {amount}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Web Transactions ──────────────────────────────────────────────
function WebTransactions() {
  const txns = [
    { date: "Apr 22", desc: "Albert Heijn", merchant: "Groceries", amount: -28.40, intent: "living_expense", status: "reviewed" },
    { date: "Apr 22", desc: "ING → Trading 212", merchant: "Investment", amount: -800.00, intent: "investment_contribution", status: "reviewed" },
    { date: "Apr 21", desc: "NS Treinticket", merchant: "Transport", amount: -12.80, intent: "living_expense", status: "reviewed" },
    { date: "Apr 21", desc: "Tikkie — Dinner Elisa", merchant: "Reimbursement", amount: +42.50, intent: "reimbursement_in", status: "reviewed" },
    { date: "Apr 20", desc: "Action Zaandam", merchant: "—", amount: -7.60, intent: null, status: "needs_review" },
    { date: "Apr 19", desc: "ING Savings transfer", merchant: "Transfer", amount: -500.00, intent: "transfer", status: "reviewed" },
  ];

  const intentLabel = (intent) => {
    if (!intent) return null;
    const map = { living_expense: ["Living", colors.textMuted], investment_contribution: ["Investing", colors.accent], reimbursement_in: ["Reimb. In", colors.positive], transfer: ["Transfer", colors.textFaint] };
    return map[intent] || [intent, colors.textMuted];
  };

  return (
    <div style={{ background: colors.bg, borderRadius: 16, border: `1px solid ${colors.border}`, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toolbar */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: colors.text, fontWeight: 600, fontSize: 15 }}>Transactions <span style={{ color: colors.textFaint, fontWeight: 400, fontSize: 13 }}>· April 2026</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 12px", color: colors.textMuted, fontSize: 12, cursor: "pointer" }}>Filter</div>
          <div style={{ background: colors.accent, borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Import CSV</div>
        </div>
      </div>

      {/* Needs review banner */}
      <div style={{ margin: "12px 16px 0", background: "#2d1f00", border: `1px solid #5a3e00`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: colors.warning, fontSize: 14 }}>⚠</span>
        <span style={{ color: "#c9a227", fontSize: 13 }}>1 transaction needs review · affects safe-to-spend reserve</span>
        <span style={{ marginLeft: "auto", color: colors.warning, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Review →</span>
      </div>

      {/* Table */}
      <div style={{ padding: "12px 0" }}>
        <div style={{ padding: "4px 20px 8px", display: "grid", gridTemplateColumns: "80px 1fr 100px 90px 80px 80px", gap: 8 }}>
          {["Date", "Description", "Category", "Amount", "Intent", "Status"].map(h => (
            <div key={h} style={{ color: colors.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>
        {txns.map((t, i) => {
          const [label, labelColor] = intentLabel(t.intent) || ["—", colors.textFaint];
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 90px 80px 80px", gap: 8, padding: "10px 20px", borderTop: `1px solid ${colors.border}`, background: t.status === "needs_review" ? "#1a1400" : "transparent", cursor: "pointer" }}
              onMouseEnter={e => { if (t.status !== "needs_review") e.currentTarget.style.background = colors.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.status === "needs_review" ? "#1a1400" : "transparent"; }}>
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{t.date}</div>
              <div style={{ color: colors.text, fontSize: 13, fontWeight: 500 }}>{t.desc}</div>
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{t.merchant}</div>
              <div style={{ color: t.amount < 0 ? colors.text : colors.positive, fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {t.amount < 0 ? `−€ ${Math.abs(t.amount).toFixed(2).replace(".", ",")}` : `+€ ${t.amount.toFixed(2).replace(".", ",")}` }
              </div>
              <div style={{ color: labelColor, fontSize: 12, background: t.intent ? `${labelColor}18` : "transparent", borderRadius: 6, padding: "2px 6px", display: "inline-flex", alignItems: "center", height: 20 }}>{label}</div>
              <div style={{ color: t.status === "needs_review" ? colors.warning : colors.positive, fontSize: 12 }}>
                {t.status === "needs_review" ? "⚠ Review" : "✓"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen 4: Web CSV Field Mapping ────────────────────────────────────────
function WebCSVMapping() {
  const csvCols = ["Datum", "Naam / Omschrijving", "Rekening", "Tegenrekening", "Code", "Af Bij", "Bedrag (EUR)", "Mutatiesoort", "Mededelingen"];
  const dartFields = ["Date *", "Description *", "Account", "Counter account", "—", "Direction", "Amount *", "Type", "Notes"];
  const required = [true, true, false, false, false, false, true, false, false];

  return (
    <div style={{ background: colors.bg, borderRadius: 16, border: `1px solid ${colors.border}`, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: colors.positive + "22", border: `1px solid ${colors.positive}44`, borderRadius: 8, padding: "4px 10px", color: colors.positive, fontSize: 12, fontWeight: 500 }}>ING Bank</div>
          <div style={{ color: colors.text, fontWeight: 600, fontSize: 15 }}>CSV Field Mapping</div>
          <div style={{ marginLeft: "auto", color: colors.textMuted, fontSize: 12 }}>transactions_april_2026.csv · 143 rows</div>
        </div>
      </div>

      {/* Preview row */}
      <div style={{ padding: "12px 24px", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ color: colors.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Preview row 1</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["22-04-2026", "Albert Heijn", "NL91INGB...", "NL15INGB...", "GT", "Af", "-28,40", "Betaalautomaat", ""].map((v, i) => (
            <div key={i} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "3px 8px", color: v ? colors.text : colors.textFaint, fontSize: 12, fontFamily: "monospace" }}>
              {v || "—"}
            </div>
          ))}
        </div>
      </div>

      {/* Mapping table */}
      <div style={{ padding: "0" }}>
        <div style={{ padding: "10px 24px", display: "grid", gridTemplateColumns: "1fr 16px 1fr 60px", gap: 12 }}>
          <div style={{ color: colors.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>CSV Column</div>
          <div />
          <div style={{ color: colors.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dart Field</div>
          <div style={{ color: colors.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Req.</div>
        </div>
        {csvCols.map((col, i) => (
          <div key={i} style={{ padding: "8px 24px", borderTop: `1px solid ${colors.border}`, display: "grid", gridTemplateColumns: "1fr 16px 1fr 60px", gap: 12, alignItems: "center" }}>
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 10px", color: colors.text, fontSize: 13, fontFamily: "monospace" }}>{col}</div>
            <div style={{ color: colors.textFaint, fontSize: 12, textAlign: "center" }}>→</div>
            <div style={{ background: dartFields[i] === "—" ? "transparent" : colors.accentMuted, border: `1px solid ${dartFields[i] === "—" ? colors.border : colors.accent + "44"}`, borderRadius: 8, padding: "6px 10px", color: dartFields[i] === "—" ? colors.textFaint : colors.accent, fontSize: 13 }}>
              {dartFields[i]}
            </div>
            <div style={{ textAlign: "center" }}>
              {required[i] && <span style={{ color: colors.accent, fontSize: 12, fontWeight: 600 }}>✓</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${colors.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 16px", color: colors.textMuted, fontSize: 13, cursor: "pointer" }}>Back</div>
        <div style={{ background: colors.accent, borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Import 143 rows →</div>
      </div>
    </div>
  );
}

// ─── Screen 5: Web "Why This Number?" ────────────────────────────────────────
function WebWhyThisNumber() {
  const [open, setOpen] = useState({ bills: true, sinking: false, investing: true, anomalies: true });

  return (
    <div style={{ background: colors.bg, borderRadius: 16, border: `1px solid ${colors.border}`, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ color: colors.textMuted, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>Safe to Spend Today — Why € 37,20?</div>
        <div style={{ color: colors.safe, fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginTop: 4 }}>€ 37,20 <span style={{ color: colors.textMuted, fontSize: 14, fontWeight: 400, letterSpacing: 0 }}>/ day · 8 days until payday</span></div>
      </div>

      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Available cash */}
        <div style={{ background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: colors.textMuted, fontSize: 13, fontWeight: 500 }}>Available Cash</span>
            <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>€ 2.940,60</span>
          </div>
          {[["ING Checking", "€ 2.940,60", true], ["ING Savings", "€ 4.200,00", false, "Not accessible"]].map(([name, val, included, reason], i) => (
            <div key={i} style={{ padding: "10px 16px 10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i === 0 ? `1px solid ${colors.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: included ? colors.positive : colors.textFaint }} />
                <span style={{ color: included ? colors.text : colors.textFaint, fontSize: 13 }}>{name}</span>
                {reason && <span style={{ color: colors.textFaint, fontSize: 11, background: colors.surfaceHover, borderRadius: 4, padding: "1px 6px" }}>{reason}</span>}
              </div>
              <span style={{ color: included ? colors.text : colors.textFaint, fontSize: 13 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Protected obligations */}
        <div style={{ background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: colors.textMuted, fontSize: 13, fontWeight: 500 }}>Protected Obligations</span>
            <span style={{ color: colors.negative, fontSize: 13, fontWeight: 600 }}>− € 2.643,50</span>
          </div>

          {/* Bills */}
          <div onClick={() => setOpen(o => ({ ...o, bills: !o.bills }))} style={{ padding: "10px 16px 10px 28px", cursor: "pointer", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: colors.textFaint, fontSize: 12 }}>{open.bills ? "▾" : "▸"}</span>
              <span style={{ color: colors.text, fontSize: 13 }}>Upcoming bills before Apr 25</span>
            </div>
            <span style={{ color: colors.text, fontSize: 13 }}>− € 1.491,98</span>
          </div>
          {open.bills && [["Rent", "Apr 25", "€ 850,00"], ["Spotify", "Apr 23", "€ 11,99"], ["Gym", "Apr 28", "€ 29,99"]].map(([n, d, a], i) => (
            <div key={i} style={{ padding: "8px 16px 8px 44px", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ color: colors.textMuted, fontSize: 13 }}>{n} <span style={{ color: colors.textFaint, fontSize: 12 }}>· {d}</span></span>
              <span style={{ color: colors.text, fontSize: 13 }}>− {a}</span>
            </div>
          ))}

          {/* Planned investing */}
          <div onClick={() => setOpen(o => ({ ...o, investing: !o.investing }))} style={{ padding: "10px 16px 10px 28px", cursor: "pointer", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: colors.textFaint, fontSize: 12 }}>{open.investing ? "▾" : "▸"}</span>
              <span style={{ color: colors.text, fontSize: 13 }}>Planned investing</span>
              <span style={{ background: colors.accentMuted, color: colors.accent, fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 500 }}>Protected</span>
            </div>
            <span style={{ color: colors.text, fontSize: 13 }}>− € 800,00</span>
          </div>
          {open.investing && (
            <div style={{ padding: "8px 16px 8px 44px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colors.textMuted, fontSize: 13 }}>VWCE + SXR8 DCA · Target Apr 28</span>
              <span style={{ color: colors.text, fontSize: 13 }}>− € 800,00</span>
            </div>
          )}

          {/* Anomalies */}
          <div onClick={() => setOpen(o => ({ ...o, anomalies: !o.anomalies }))} style={{ padding: "10px 16px 10px 28px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: colors.textFaint, fontSize: 12 }}>{open.anomalies ? "▾" : "▸"}</span>
              <span style={{ color: colors.text, fontSize: 13 }}>Unreviewed transactions reserve</span>
              <span style={{ background: "#2d1f00", color: colors.warning, fontSize: 10, padding: "1px 6px", borderRadius: 4 }}>1 pending</span>
            </div>
            <span style={{ color: colors.text, fontSize: 13 }}>− € 7,60</span>
          </div>
          {open.anomalies && (
            <div style={{ padding: "8px 16px 8px 44px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: colors.textMuted, fontSize: 13 }}>Action Zaandam — Apr 20 <span style={{ color: colors.warning }}>· Needs review</span></span>
              <span style={{ color: colors.text, fontSize: 13 }}>− € 7,60</span>
            </div>
          )}
        </div>

        {/* Result */}
        <div style={{ background: colors.accentMuted, border: `1px solid ${colors.accent}44`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 4 }}>
            <span style={{ color: colors.textMuted, fontSize: 13 }}>Spendable pool</span>
            <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>€ 297,10</span>
            <span style={{ color: colors.textMuted, fontSize: 13 }}>÷ Days until payday</span>
            <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>8 days</span>
            <div style={{ gridColumn: "1/-1", height: 1, background: colors.accent + "33", margin: "8px 0" }} />
            <span style={{ color: colors.safe, fontSize: 15, fontWeight: 600 }}>Safe to Spend Today</span>
            <span style={{ color: colors.safe, fontSize: 15, fontWeight: 700 }}>€ 37,20</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState(0);
  const isMobile = active < 2;

  const ScreenComponents = [MobileHome, MobileQuickAdd, WebTransactions, WebCSVMapping, WebWhyThisNumber];
  const ActiveScreen = ScreenComponents[active];

  return (
    <div style={{ minHeight: "100vh", background: "#070a0f", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "32px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: "8px 16px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>D</div>
          <span style={{ color: "#e6edf3", fontWeight: 600, fontSize: 15 }}>Dart Finance</span>
          <span style={{ color: "#484f58", fontSize: 12 }}>· Core 5 Screens</span>
        </div>
      </div>

      {/* Screen tabs */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
        {screens.map((s, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${active === i ? colors.accent : colors.border}`, background: active === i ? colors.accentMuted : colors.surface, color: active === i ? colors.accent : colors.textMuted, fontSize: 13, cursor: "pointer", fontWeight: active === i ? 600 : 400, transition: "all 0.15s" }}>
            {i < 2 ? "📱" : "🖥"} {s}
          </div>
        ))}
      </div>

      {/* Context tag */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ background: isMobile ? "#1a2e1a" : "#1a1e2e", border: `1px solid ${isMobile ? colors.positive + "44" : colors.accent + "44"}`, borderRadius: 6, padding: "3px 10px", color: isMobile ? colors.positive : colors.accent, fontSize: 12 }}>
          {isMobile ? "📱 Mobile — reassurance + fast input" : "🖥 Web — review, control, audit"}
        </span>
      </div>

      {/* Screen */}
      <div style={{ maxWidth: isMobile ? 420 : 900, margin: "0 auto" }}>
        <ActiveScreen />
      </div>

      {/* Footer note */}
      <div style={{ textAlign: "center", marginTop: 28, color: colors.textFaint, fontSize: 12 }}>
        Execution Lock v1.3 · ING + T212 only · Web-first dev order · Engine before polish
      </div>
    </div>
  );
}
