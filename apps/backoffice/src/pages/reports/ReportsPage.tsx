import React, { useState } from "react";

interface ReportDef { code: string; name: string; domain: string; description: string; formats: string[]; }

const reportCatalog: ReportDef[] = [
  { code: "PROVIDER_PL", name: "Provider P&L", domain: "Aggregator", description: "Revenue, cost, margin, fees by provider", formats: ["JSON", "CSV", "XLSX"] },
  { code: "OPERATOR_PL", name: "Operator P&L", domain: "Aggregator", description: "Operator revenue, costs, bonuses per period", formats: ["JSON", "CSV", "XLSX"] },
  { code: "GGR_REPORT", name: "GGR Report", domain: "B2C", description: "Gross gaming revenue by operator, game, cohort", formats: ["JSON", "CSV", "XLSX", "PDF"] },
  { code: "DEPOSITS_REPORT", name: "Deposits Report", domain: "B2C", description: "Deposit volume, acceptance, PSP breakdown", formats: ["JSON", "CSV", "XLSX"] },
  { code: "COMPLIANCE_KYC", name: "KYC Compliance", domain: "Compliance", description: "KYC queue status, document approvals, jurisdiction evidence", formats: ["JSON", "CSV", "PDF"] }
];

export function ReportsPage(): React.JSX.Element {
  const [selected, setSelected] = useState<ReportDef | null>(null);
  const [domain, setDomain] = useState("All");
  const domains = ["All", "Aggregator", "B2C", "Compliance", "Finance"];

  const filtered = domain === "All" ? reportCatalog : reportCatalog.filter((r) => r.domain === domain);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Governed reports for Aggregator, B2C, B2B, Finance, and Compliance</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {domains.map((d) => (
          <button key={d} className={`tab${d === domain ? " active" : ""}`} onClick={() => setDomain(d)}>{d}</button>
        ))}
      </div>

      <div className="grid-auto">
        {filtered.map((report) => (
          <div key={report.code} className="card" style={{ cursor: "pointer" }} onClick={() => setSelected(report)}>
            <div className="card-body">
              <span className="badge badge-blue" style={{ marginBottom: "8px", display: "inline-block" }}>{report.domain}</span>
              <div className="card-title" style={{ marginBottom: "8px" }}>{report.name}</div>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-neutral-500)", marginBottom: "12px" }}>{report.description}</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {report.formats.map((f) => (
                  <span key={f} className="badge badge-neutral">{f}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "16px", color: "var(--color-neutral-600)", fontSize: "0.875rem" }}>{selected.description}</p>
              <div className="auth-form">
                <div className="field">
                  <label className="field-label">Period Start</label>
                  <input type="date" className="input" defaultValue="2026-06-01" />
                </div>
                <div className="field">
                  <label className="field-label">Period End</label>
                  <input type="date" className="input" defaultValue="2026-06-30" />
                </div>
                <div className="field">
                  <label className="field-label">Format</label>
                  <select className="select">
                    {selected.formats.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert("Report export queued!"); setSelected(null); }}>Generate Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
