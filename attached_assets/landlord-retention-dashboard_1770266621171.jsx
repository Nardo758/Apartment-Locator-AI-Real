import { useState, useEffect } from "react";

// --- Mock Data (Unit-focused) ---
const UNITS = [
  { id: 1, address: "1234 Main St", unit: "2A", beds: 2, baths: 2, sqft: 1100, rent: 2200, marketRent: 2050, status: "occupied", risk: 82, leaseExpiry: 18, daysVacant: 0, lat: 38, lng: -42, tenant: "M. Johnson", factors: [{ name: "Price vs Market", score: 35, detail: "+$150/mo (7.3% above)" }, { name: "Lease Expiring", score: 30, detail: "18 days remaining" }, { name: "No Pet Policy", score: 17, detail: "75% of market allows pets" }] },
  { id: 2, address: "1234 Main St", unit: "3B", beds: 1, baths: 1, sqft: 750, rent: 1650, marketRent: 1625, status: "occupied", risk: 22, leaseExpiry: 195, daysVacant: 0, lat: 38, lng: -42, tenant: "S. Williams", factors: [{ name: "Price vs Market", score: 8, detail: "+$25/mo (1.5% above)" }, { name: "Lease Proximity", score: 5, detail: "195 days remaining" }, { name: "Well Maintained", score: 9, detail: "0 requests in 90 days" }] },
  { id: 3, address: "567 Oak Ave", unit: "1A", beds: 2, baths: 1, sqft: 950, rent: 1800, marketRent: 1825, status: "occupied", risk: 45, leaseExpiry: 42, daysVacant: 0, lat: 52, lng: -28, tenant: "R. Chen", factors: [{ name: "Price vs Market", score: 5, detail: "-$25/mo (below market ✓)" }, { name: "Lease Expiring", score: 22, detail: "42 days remaining" }, { name: "Amenity Gap", score: 18, detail: "No in-unit laundry" }] },
  { id: 4, address: "567 Oak Ave", unit: "2B", beds: 3, baths: 2, sqft: 1350, rent: 2400, marketRent: 2150, status: "occupied", risk: 71, leaseExpiry: 28, daysVacant: 0, lat: 52, lng: -28, tenant: "A. Patel", factors: [{ name: "Price vs Market", score: 32, detail: "+$250/mo (11.6% above)" }, { name: "Lease Expiring", score: 25, detail: "28 days remaining" }, { name: "Maintenance Issues", score: 14, detail: "4 requests in 90 days" }] },
  { id: 5, address: "890 Elm St", unit: "1C", beds: 1, baths: 1, sqft: 680, rent: 0, marketRent: 1450, status: "vacant", risk: 95, leaseExpiry: 0, daysVacant: 45, lat: 28, lng: -58, tenant: null, factors: [{ name: "Days Vacant", score: 45, detail: "45 days — $2,175 lost rent" }, { name: "Above Market", score: 30, detail: "Was listed at $1,650 (14% above)" }, { name: "No Concession", score: 20, detail: "42% of nearby units offer concessions" }] },
  { id: 6, address: "890 Elm St", unit: "2A", beds: 2, baths: 1, sqft: 900, rent: 1750, marketRent: 1780, status: "occupied", risk: 18, leaseExpiry: 220, daysVacant: 0, lat: 28, lng: -58, tenant: "K. Lee", factors: [{ name: "Price vs Market", score: 3, detail: "-$30/mo (below market ✓)" }, { name: "Lease Proximity", score: 4, detail: "220 days remaining" }, { name: "Happy Tenant", score: 11, detail: "Renewed once already" }] },
  { id: 7, address: "2468 Riverside Dr", unit: "A", beds: 2, baths: 2, sqft: 1050, rent: 0, marketRent: 1900, status: "vacant", risk: 88, leaseExpiry: 0, daysVacant: 32, lat: 62, lng: -55, tenant: null, factors: [{ name: "Days Vacant", score: 38, detail: "32 days — $2,027 lost rent" }, { name: "Priced High", score: 28, detail: "Listed at $2,100 (11% above)" }, { name: "Low Foot Traffic", score: 22, detail: "2 showings in 30 days" }] },
  { id: 8, address: "2468 Riverside Dr", unit: "B", beds: 1, baths: 1, sqft: 620, rent: 1400, marketRent: 1380, status: "occupied", risk: 12, leaseExpiry: 310, daysVacant: 0, lat: 62, lng: -55, tenant: "J. Torres", factors: [{ name: "Price vs Market", score: 4, detail: "+$20/mo (1.4% above)" }, { name: "Lease Proximity", score: 2, detail: "310 days remaining" }, { name: "Low Risk", score: 6, detail: "Long-term tenant, no issues" }] },
];

const NEARBY = [
  { id: "n1", name: "Riverside Apts #204", rent: 1950, beds: 2, concession: "1 mo free", lat: 55, lng: -48 },
  { id: "n2", name: "Downtown Towers #8B", rent: 2100, beds: 2, concession: "$500 off", lat: 42, lng: -35 },
  { id: "n3", name: "Urban Living #3F", rent: 2250, beds: 2, concession: null, lat: 35, lng: -50 },
  { id: "n4", name: "Cedar Park Apts #1A", rent: 1680, beds: 1, concession: "Waived fee", lat: 22, lng: -45 },
  { id: "n5", name: "Parkview #5C", rent: 1775, beds: 2, concession: "Free parking", lat: 48, lng: -62 },
  { id: "n6", name: "The Granary #2B", rent: 1520, beds: 1, concession: null, lat: 30, lng: -30 },
];

const ALERTS = [
  { id: 1, type: "renewal", severity: "critical", title: "Lease Expiring — Unit 2A, 1234 Main St", message: "18 days left. Unit is $150/mo above market. High churn risk.", time: "2h ago" },
  { id: 2, type: "vacancy", severity: "warning", title: "Vacancy Cost Rising — Unit 1C, 890 Elm St", message: "45 days vacant. $2,175 lost so far. Comparable units filling in 12 days with concessions.", time: "6h ago" },
  { id: 3, type: "market", severity: "info", title: "Market Shift — Riverside District", message: "3 nearby properties now offering move-in concessions. Your vacant unit may need a competitive offer.", time: "1d ago" },
  { id: 4, type: "win", severity: "success", title: "Retention Win! — Unit 2A, 890 Elm St", message: "Tenant K. Lee renewed. Estimated savings vs. vacancy: $4,200.", time: "3d ago" },
];

// --- Utility functions ---
const getRiskColor = (risk) => {
  if (risk >= 70) return { bg: "#FEE2E2", border: "#EF4444", text: "#B91C1C", dot: "#EF4444", label: "Critical" };
  if (risk >= 40) return { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", dot: "#F59E0B", label: "At Risk" };
  return { bg: "#D1FAE5", border: "#10B981", text: "#065F46", dot: "#10B981", label: "Healthy" };
};

const getVacantColor = () => ({ bg: "#F3F4F6", border: "#9CA3AF", text: "#4B5563", dot: "#9CA3AF", label: "Vacant" });

const getUnitColor = (unit) => unit.status === "vacant" ? getVacantColor() : getRiskColor(unit.risk);

const formatCurrency = (n) => n ? `$${n.toLocaleString()}` : "—";

const getSeverityStyle = (s) => ({
  critical: { bg: "#FEE2E2", border: "#FECACA", icon: "⚠", color: "#B91C1C" },
  warning: { bg: "#FEF3C7", border: "#FDE68A", icon: "💰", color: "#92400E" },
  info: { bg: "#DBEAFE", border: "#BFDBFE", icon: "📊", color: "#1E40AF" },
  success: { bg: "#D1FAE5", border: "#A7F3D0", icon: "🎉", color: "#065F46" },
}[s]);

// --- Components ---

function RetentionHealthBar() {
  const metrics = [
    { label: "Portfolio Retention", value: "83%", sub: "vs 78% market", good: true },
    { label: "Units at Risk", value: "3", sub: "of 8 total", good: false },
    { label: "Vacancy Cost / Mo", value: "$4,202", sub: "2 units empty", good: false },
    { label: "Renewals Due", value: "4", sub: "within 90 days", good: null },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "10px 20px", background: "#0F1A2E", borderBottom: "1px solid #1E3A5F" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399" }} />
        <span style={{ color: "#94A3B8", fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>AUSTIN, TX</span>
      </div>
      <div style={{ width: 1, height: 28, background: "#1E3A5F", marginRight: 12, flexShrink: 0 }} />
      <div style={{ display: "flex", gap: 24, flex: 1, overflowX: "auto" }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", minWidth: 100, flexShrink: 0 }}>
            <span style={{ color: "#64748B", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{m.label}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: m.good === false ? "#F87171" : m.good ? "#34D399" : "#E2E8F0", fontSize: 18, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{m.value}</span>
              <span style={{ color: m.good ? "#34D399" : "#64748B", fontSize: 11 }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#1A2744", borderRadius: 8, padding: "8px 14px", maxWidth: 340, marginLeft: 12, flexShrink: 0 }}>
        <span style={{ color: "#FBBF24", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>AI INSIGHT </span>
        <span style={{ color: "#CBD5E1", fontSize: 12, lineHeight: 1.4 }}>4 leases expire soon — units priced 5%+ above market churn 3× more often.</span>
      </div>
    </div>
  );
}

function MapPin({ unit, selected, onClick, isNearby }) {
  if (isNearby) {
    return (
      <div onClick={onClick} style={{ position: "absolute", left: `${unit.lng + 70}%`, top: `${unit.lat}%`, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 1, opacity: 0.45, transition: "opacity 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.opacity = 0.8} onMouseLeave={e => e.currentTarget.style.opacity = 0.45}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#94A3B8", border: "2px solid #64748B" }} />
      </div>
    );
  }
  const c = getUnitColor(unit);
  const isSelected = selected?.id === unit.id;
  return (
    <div onClick={onClick} style={{ position: "absolute", left: `${unit.lng + 70}%`, top: `${unit.lat}%`, transform: "translate(-50%,-100%)", cursor: "pointer", zIndex: isSelected ? 20 : 10, transition: "transform 0.15s" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {isSelected && <div style={{ position: "absolute", width: 40, height: 40, borderRadius: "50%", background: c.dot, opacity: 0.15, top: -6, animation: "pulse 2s infinite" }} />}
        <div style={{ width: isSelected ? 18 : 14, height: isSelected ? 18 : 14, borderRadius: "50%", background: c.dot, border: `3px solid ${isSelected ? "#fff" : c.border}`, boxShadow: isSelected ? `0 0 0 3px ${c.dot}40, 0 2px 8px rgba(0,0,0,0.3)` : "0 1px 4px rgba(0,0,0,0.2)", transition: "all 0.15s" }} />
        <div style={{ marginTop: 2, background: isSelected ? c.dot : "rgba(15,26,46,0.85)", color: isSelected ? "#fff" : "#CBD5E1", fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", letterSpacing: 0.3 }}>
          {unit.unit}
        </div>
      </div>
    </div>
  );
}

function MapView({ units, nearby, selected, onSelect }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "linear-gradient(135deg, #0B1526 0%, #0F1F3D 40%, #132744 100%)", borderRadius: 0, overflow: "hidden" }}>
      {/* Fake map grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
        {[...Array(20)].map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#60A5FA" strokeWidth="0.5" />)}
        {[...Array(20)].map((_, i) => <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#60A5FA" strokeWidth="0.5" />)}
      </svg>
      {/* Fake roads */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}>
        <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#94A3B8" strokeWidth="2" />
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#94A3B8" strokeWidth="2" />
        <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#94A3B8" strokeWidth="1" />
        <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#94A3B8" strokeWidth="1" />
        <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="#94A3B8" strokeWidth="1" />
      </svg>
      {/* Nearby comparables */}
      {nearby.map(n => <MapPin key={n.id} unit={n} isNearby onClick={() => {}} />)}
      {/* Own units */}
      {units.map(u => <MapPin key={u.id} unit={u} selected={selected} onClick={() => onSelect(u)} />)}
      {/* Legend */}
      <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(15,26,46,0.92)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 14, border: "1px solid #1E3A5F" }}>
        {[
          { color: "#10B981", label: "Healthy" },
          { color: "#F59E0B", label: "At Risk" },
          { color: "#EF4444", label: "Critical" },
          { color: "#9CA3AF", label: "Vacant" },
          { color: "#64748B", label: "Nearby Comps", hollow: true },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.hollow ? "transparent" : l.color, border: l.hollow ? `2px solid ${l.color}` : "none", opacity: l.hollow ? 0.5 : 1 }} />
            <span style={{ color: "#94A3B8", fontSize: 10, fontWeight: 500 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarHealthWidget({ units }) {
  const occupied = units.filter(u => u.status === "occupied").length;
  const vacant = units.filter(u => u.status === "vacant").length;
  const atRisk = units.filter(u => u.status === "occupied" && u.risk >= 40).length;
  const vacancyCost = units.filter(u => u.status === "vacant").reduce((sum, u) => sum + (u.daysVacant * (u.marketRent / 30)), 0);

  return (
    <div style={{ padding: 16 }}>
      {/* Retention score hero */}
      <div style={{ textAlign: "center", padding: "14px 0 12px", background: "linear-gradient(135deg, #064E3B 0%, #065F46 100%)", borderRadius: 10, marginBottom: 14, border: "1px solid #10B981" + "30" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#34D399", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>83%</div>
        <div style={{ fontSize: 11, color: "#6EE7B7", fontWeight: 600, marginTop: 2 }}>Retention Rate</div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>Market avg: 78%</div>
      </div>
      {/* Unit stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Total Units", value: units.length, color: "#E2E8F0" },
          { label: "Occupied", value: occupied, color: "#34D399" },
          { label: "Vacant", value: vacant, color: "#F87171" },
          { label: "At Risk", value: atRisk, color: "#FBBF24" },
        ].map(s => (
          <div key={s.label} style={{ background: "#1A2744", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Vacancy cost */}
      <div style={{ background: "#2A1215", borderRadius: 8, padding: "10px 12px", border: "1px solid #7F1D1D" }}>
        <div style={{ fontSize: 10, color: "#FCA5A5", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Vacancy Cost This Month</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#F87171", fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(Math.round(vacancyCost))}</div>
        <div style={{ fontSize: 10, color: "#94A3B8" }}>{vacant} empty units · avg {Math.round(units.filter(u => u.status === "vacant").reduce((s, u) => s + u.daysVacant, 0) / Math.max(vacant, 1))} days</div>
      </div>
    </div>
  );
}

function RenewalsList({ units, selected, onSelect }) {
  const renewals = units.filter(u => u.status === "occupied" && u.leaseExpiry <= 90).sort((a, b) => a.leaseExpiry - b.leaseExpiry);
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", letterSpacing: 0.3 }}>Upcoming Renewals</span>
        <span style={{ fontSize: 10, color: "#64748B", background: "#1A2744", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{renewals.length} units</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {renewals.map(u => {
          const c = getUnitColor(u);
          const isSelected = selected?.id === u.id;
          return (
            <div key={u.id} onClick={() => onSelect(u)} style={{ background: isSelected ? "#1A2744" : "#111B2E", borderRadius: 8, padding: "10px 12px", cursor: "pointer", border: isSelected ? `1px solid ${c.border}` : "1px solid transparent", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}>Unit {u.unit} · {u.address.split(" ").slice(0, 2).join(" ")}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{u.beds}BR · {formatCurrency(u.rent)}/mo · {u.tenant}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.text, background: c.bg, padding: "2px 6px", borderRadius: 4 }}>{u.leaseExpiry}d</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: u.rent > u.marketRent ? "#F87171" : "#34D399" }}>
                  {u.rent > u.marketRent ? `+${formatCurrency(u.rent - u.marketRent)}/mo above market` : "At market ✓"}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: c.dot }}>{c.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterBar({ filter, setFilter }) {
  return (
    <div style={{ padding: "0 16px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", letterSpacing: 0.3, marginBottom: 8 }}>Filters</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["All", "Critical", "At Risk", "Healthy", "Vacant"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: filter === f ? "#2563EB" : "#1A2744", color: filter === f ? "#fff" : "#94A3B8", transition: "all 0.15s" }}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function UnitDetailPanel({ unit, onClose }) {
  if (!unit) return null;
  const c = getUnitColor(unit);
  const isVacant = unit.status === "vacant";
  const priceDiff = unit.rent ? unit.rent - unit.marketRent : (unit.factors[0]?.detail.includes("$1,650") ? 200 : 0);
  const dailyVacancyCost = unit.marketRent / 30;

  // Scenario calculations
  const scenarioDiscount = isVacant
    ? { label: "List at market rate with 1-mo free concession", annualCost: unit.marketRent, note: `Fill est. 12 days · ${formatCurrency(unit.marketRent)}/mo` }
    : { label: `Offer renewal at ${formatCurrency(unit.marketRent)}/mo`, annualCost: Math.max(0, priceDiff) * 12, note: `${formatCurrency(Math.max(0, priceDiff))}/mo discount × 12 months` };

  const scenarioLose = isVacant
    ? { label: "Hold above-market list price", annualCost: Math.round(dailyVacancyCost * 60) + 1000, note: "Est. 60+ more days vacant" }
    : { label: "Lose tenant → relist at market", annualCost: Math.round(dailyVacancyCost * 30) + 1000 + (unit.marketRent * 12 < unit.rent * 12 ? unit.rent * 12 - unit.marketRent * 12 : 0), note: `~30 day vacancy + $1,000 turnover` };

  const scenarioHold = isVacant ? null
    : { label: `Lose tenant → hold at ${formatCurrency(unit.rent)}/mo`, annualCost: Math.round(dailyVacancyCost * 50) + 1000, note: "~50 day vacancy (overpriced)" };

  return (
    <div style={{ background: "#0D1526", borderTop: `3px solid ${c.dot}`, overflowY: "auto", height: "100%" }}>
      <div style={{ padding: "16px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>Unit {unit.unit}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.text, background: c.bg, padding: "3px 10px", borderRadius: 20 }}>{isVacant ? "VACANT" : c.label.toUpperCase()} · {unit.risk}</span>
            </div>
            <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 3 }}>{unit.address} · {unit.beds}BR/{unit.baths}BA · {unit.sqft} sqft</div>
            {unit.tenant && <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>Tenant: {unit.tenant} · Lease expires in {unit.leaseExpiry} days</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Left column: Risk breakdown + Market Context */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Risk breakdown */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                {isVacant ? "Vacancy Factors" : "Retention Risk Breakdown"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {unit.factors.map((f, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "#CBD5E1", fontWeight: 500 }}>{f.name}</span>
                      <span style={{ fontSize: 11, color: f.score >= 25 ? "#F87171" : f.score >= 15 ? "#FBBF24" : "#34D399", fontWeight: 700 }}>{f.score}</span>
                    </div>
                    <div style={{ height: 4, background: "#1A2744", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${f.score}%`, background: f.score >= 25 ? "#EF4444" : f.score >= 15 ? "#F59E0B" : "#10B981", borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{f.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby market context */}
            <div style={{ background: "#111B2E", borderRadius: 10, padding: 14, border: "1px solid #1E3A5F" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Nearby Market · {unit.beds}BR within 1mi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(unit.marketRent)}</div>
                  <div style={{ fontSize: 9, color: "#64748B" }}>Avg Rent</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>24d</div>
                  <div style={{ fontSize: 9, color: "#64748B" }}>Days to Fill</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#FBBF24", fontFamily: "'DM Sans', sans-serif" }}>42%</div>
                  <div style={{ fontSize: 9, color: "#64748B" }}>Offering Deals</div>
                </div>
              </div>
              {/* Rent position bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ position: "relative", height: 6, background: "linear-gradient(90deg, #10B981, #F59E0B, #EF4444)", borderRadius: 3, marginBottom: 4 }}>
                  {unit.rent > 0 && <div style={{ position: "absolute", left: `${Math.min(95, Math.max(5, ((unit.rent - (unit.marketRent - 300)) / 600) * 100))}%`, top: -3, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "3px solid #2563EB", transform: "translateX(-50%)" }} />}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748B" }}>
                  <span>{formatCurrency(unit.marketRent - 300)}</span>
                  <span style={{ color: "#94A3B8", fontWeight: 600 }}>Your unit: {unit.rent > 0 ? formatCurrency(unit.rent) : "Not listed"}</span>
                  <span>{formatCurrency(unit.marketRent + 300)}</span>
                </div>
              </div>
              {/* Renter searches */}
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Top Renter Searches Here</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {["Pet-friendly", "In-unit laundry", "Under $2k", "EV charging"].map(t => (
                  <span key={t} style={{ fontSize: 9, background: "#1A2744", color: "#94A3B8", padding: "3px 8px", borderRadius: 10, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Vacancy Cost Calculator */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              {isVacant ? "What This Vacancy Is Costing You" : "What Would Turnover Cost?"}
            </div>

            {/* Current cost (if vacant) */}
            {isVacant && (
              <div style={{ background: "#2A1215", borderRadius: 10, padding: 14, marginBottom: 12, border: "1px solid #7F1D1D" }}>
                <div style={{ fontSize: 10, color: "#FCA5A5", fontWeight: 600 }}>VACANT {unit.daysVacant} DAYS</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#F87171", fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(Math.round(dailyVacancyCost * unit.daysVacant))} lost</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Lost rent: {formatCurrency(Math.round(dailyVacancyCost * unit.daysVacant))} · Prep & marketing: ~$1,000</div>
              </div>
            )}

            {/* Scenario comparison */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, marginBottom: 2 }}>12-Month Cost Scenarios</div>

              {/* Recommended */}
              <div style={{ background: "#052E16", borderRadius: 10, padding: 14, border: "2px solid #10B981" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, background: "#10B981", color: "#fff", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Recommended</span>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#D1FAE5", marginTop: 6 }}>{scenarioDiscount.label}</div>
                    <div style={{ fontSize: 10, color: "#6EE7B7", marginTop: 2 }}>{scenarioDiscount.note}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#34D399", fontFamily: "'DM Sans', sans-serif" }}>-{formatCurrency(scenarioDiscount.annualCost)}</div>
                    <div style={{ fontSize: 9, color: "#6EE7B7" }}>annual cost</div>
                  </div>
                </div>
              </div>

              {/* Alternative 1 */}
              <div style={{ background: "#111B2E", borderRadius: 10, padding: 14, border: "1px solid #1E3A5F" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{scenarioLose.label}</div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{scenarioLose.note}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#F87171", fontFamily: "'DM Sans', sans-serif" }}>-{formatCurrency(scenarioLose.annualCost)}</div>
                    <div style={{ fontSize: 9, color: "#F87171" }}>annual cost</div>
                  </div>
                </div>
              </div>

              {/* Alternative 2 */}
              {scenarioHold && (
                <div style={{ background: "#111B2E", borderRadius: 10, padding: 14, border: "1px solid #1E3A5F" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{scenarioHold.label}</div>
                      <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{scenarioHold.note}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#F87171", fontFamily: "'DM Sans', sans-serif" }}>-{formatCurrency(scenarioHold.annualCost)}</div>
                      <div style={{ fontSize: 9, color: "#F87171" }}>annual cost</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Recommendation */}
            <div style={{ background: "linear-gradient(135deg, #1E1B4B, #1A2744)", borderRadius: 10, padding: 14, marginTop: 12, border: "1px solid #4338CA" + "50" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 12 }}>✦</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 1 }}>AI Recommendation</span>
              </div>
              <div style={{ fontSize: 12, color: "#E2E8F0", lineHeight: 1.5 }}>
                {isVacant
                  ? `This unit has been empty ${unit.daysVacant} days at above-market pricing. Listing at ${formatCurrency(unit.marketRent)}/mo with a 1-month-free concession would match the 42% of nearby units offering deals and should fill within ~12 days based on market velocity.`
                  : unit.risk >= 70
                    ? `High churn risk with lease expiring in ${unit.leaseExpiry} days. Offering renewal at market rate (${formatCurrency(unit.marketRent)}/mo) costs ${formatCurrency(priceDiff * 12)}/yr in reduced rent but saves an estimated ${formatCurrency(scenarioLose.annualCost)} in turnover costs.`
                    : unit.risk >= 40
                      ? `Moderate risk — lease expires in ${unit.leaseExpiry} days. Unit is priced near market. Consider a small incentive (waived fee, minor upgrade) to secure early renewal.`
                      : `Low risk. Tenant is well-retained at near-market pricing. No action needed — monitor for changes.`
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsSidebar({ alerts }) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", letterSpacing: 0.3, marginBottom: 10 }}>Retention Alerts</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {alerts.map(a => {
          const s = getSeverityStyle(a.severity);
          return (
            <div key={a.id} style={{ background: "#111B2E", borderRadius: 8, padding: "8px 10px", borderLeft: `3px solid ${s.color}`, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#E2E8F0" }}>{s.icon} {a.title.split("—")[0]}</span>
                <span style={{ fontSize: 9, color: "#64748B" }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3, lineHeight: 1.4 }}>{a.message.substring(0, 80)}...</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function LandlordRetentionDashboard() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("map");

  const filteredUnits = UNITS.filter(u => {
    if (filter === "All") return true;
    if (filter === "Vacant") return u.status === "vacant";
    if (filter === "Critical") return u.status === "occupied" && u.risk >= 70;
    if (filter === "At Risk") return u.status === "occupied" && u.risk >= 40 && u.risk < 70;
    if (filter === "Healthy") return u.status === "occupied" && u.risk < 40;
    return true;
  });

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#080F1E", fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#E2E8F0", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.5); opacity: 0.05; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E3A5F; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", background: "#0B1526", borderBottom: "1px solid #1E3A5F" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>A</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", letterSpacing: -0.3 }}>ApartmentIQ</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#7C3AED", background: "#7C3AED" + "20", padding: "2px 8px", borderRadius: 10, marginLeft: 4 }}>LANDLORD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#64748B", cursor: "pointer" }}>Portfolio</span>
          <span style={{ fontSize: 11, color: "#64748B", cursor: "pointer" }}>Analytics</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1A2744", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#94A3B8", cursor: "pointer", border: "2px solid #2563EB" }}>LP</div>
        </div>
      </div>

      {/* Retention Health Bar */}
      <RetentionHealthBar />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar */}
        <div style={{ width: 260, background: "#0B1526", borderRight: "1px solid #1E3A5F", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <SidebarHealthWidget units={UNITS} />
          <div style={{ borderTop: "1px solid #1E3A5F" }}>
            <FilterBar filter={filter} setFilter={setFilter} />
          </div>
          <div style={{ borderTop: "1px solid #1E3A5F", flex: 1 }}>
            <RenewalsList units={UNITS} selected={selected} onSelect={setSelected} />
          </div>
          <div style={{ borderTop: "1px solid #1E3A5F" }}>
            <AlertsSidebar alerts={ALERTS} />
          </div>
        </div>

        {/* Map + Detail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Toggle bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px", background: "#0D1526", borderBottom: "1px solid #1E3A5F" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {["map", "list"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: view === v ? "#2563EB" : "transparent", color: view === v ? "#fff" : "#64748B", textTransform: "capitalize", transition: "all 0.15s" }}>{v}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#64748B" }}>Showing {filteredUnits.length} of {UNITS.length} units</span>
              <select style={{ fontSize: 10, background: "#1A2744", border: "1px solid #1E3A5F", color: "#94A3B8", borderRadius: 4, padding: "3px 8px" }}>
                <option>Sort: Retention Risk ↓</option>
                <option>Sort: Lease Expiry ↑</option>
                <option>Sort: Rent ↓</option>
              </select>
            </div>
          </div>

          {view === "map" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: selected ? "row" : "column" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <MapView units={filteredUnits} nearby={NEARBY} selected={selected} onSelect={setSelected} />
              </div>
              {selected && (
                <div style={{ width: "55%", borderLeft: "1px solid #1E3A5F", overflowY: "auto" }}>
                  <UnitDetailPanel unit={selected} onClose={() => setSelected(null)} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E3A5F" }}>
                    {["Unit", "Address", "Beds", "Rent", "Market", "Δ", "Status", "Risk", "Lease"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: "#64748B", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.sort((a, b) => b.risk - a.risk).map(u => {
                    const c = getUnitColor(u);
                    return (
                      <tr key={u.id} onClick={() => setSelected(u)} style={{ borderBottom: "1px solid #1E3A5F20", cursor: "pointer", background: selected?.id === u.id ? "#1A2744" : "transparent" }}>
                        <td style={{ padding: "10px", fontWeight: 700, color: "#E2E8F0" }}>{u.unit}</td>
                        <td style={{ padding: "10px", color: "#94A3B8" }}>{u.address}</td>
                        <td style={{ padding: "10px", color: "#94A3B8" }}>{u.beds}/{u.baths}</td>
                        <td style={{ padding: "10px", color: "#E2E8F0", fontWeight: 600 }}>{u.rent ? formatCurrency(u.rent) : "—"}</td>
                        <td style={{ padding: "10px", color: "#64748B" }}>{formatCurrency(u.marketRent)}</td>
                        <td style={{ padding: "10px", color: u.rent > u.marketRent ? "#F87171" : u.rent ? "#34D399" : "#64748B", fontWeight: 600 }}>
                          {u.rent ? (u.rent > u.marketRent ? `+${u.rent - u.marketRent}` : u.rent < u.marketRent ? `${u.rent - u.marketRent}` : "—") : "—"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, background: u.status === "vacant" ? "#374151" : "#064E3B", color: u.status === "vacant" ? "#9CA3AF" : "#6EE7B7", padding: "2px 8px", borderRadius: 10 }}>
                            {u.status === "vacant" ? `Empty ${u.daysVacant}d` : "Occupied"}
                          </span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 40, height: 4, background: "#1A2744", borderRadius: 2 }}>
                              <div style={{ width: `${u.risk}%`, height: "100%", background: c.dot, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: c.dot }}>{u.risk}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px", color: u.leaseExpiry > 0 ? (u.leaseExpiry <= 30 ? "#F87171" : u.leaseExpiry <= 60 ? "#FBBF24" : "#94A3B8") : "#64748B", fontWeight: u.leaseExpiry <= 30 ? 700 : 400 }}>
                          {u.leaseExpiry > 0 ? `${u.leaseExpiry}d` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
