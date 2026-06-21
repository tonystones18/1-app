import React, { useState } from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface Payment { id: string; playerId: string; direction: string; amount: string; currency: string; method: string; psp: string; status: string; createdAt: string; }

const mockPayments: Payment[] = [
  { id: "pay1", playerId: "pl1", direction: "deposit", amount: "£200.00", currency: "GBP", method: "card", psp: "stripe", status: "completed", createdAt: "2026-06-20T14:23:00Z" },
  { id: "pay2", playerId: "pl2", direction: "withdrawal", amount: "€50.00", currency: "EUR", method: "bank_transfer", psp: "passimpay", status: "pending", createdAt: "2026-06-20T12:10:00Z" },
  { id: "pay3", playerId: "pl1", direction: "deposit", amount: "£100.00", currency: "GBP", method: "card", psp: "stripe", status: "failed", createdAt: "2026-06-19T09:45:00Z" }
];

export function PaymentsPage(): React.JSX.Element {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Deposits", "Withdrawals", "Pending Approvals"];
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Deposits, withdrawals, PSP routing, and callback processing</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Export</button>
        </div>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={`tab${t === tab ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <CrudPage
        title=""
        columns={[
          { key: "id", header: "Payment ID", render: (p) => <code style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{p.id}</code> },
          { key: "direction", header: "Type", render: (p) => <span className={`badge badge-${p.direction === "deposit" ? "green" : "blue"}`}>{p.direction}</span> },
          { key: "amount", header: "Amount", render: (p) => <strong>{p.amount}</strong> },
          { key: "method", header: "Method", render: (p) => p.method.replace("_", " ") },
          { key: "psp", header: "PSP", render: (p) => p.psp },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "created", header: "Created", render: (p) => new Date(p.createdAt).toLocaleString() },
          { key: "actions", header: "", render: () => <button className="btn btn-ghost btn-sm">View</button> }
        ]}
        rows={mockPayments}
        getRowKey={(p) => p.id}
        emptyTitle="No payments found"
        emptyDescription="Payment transactions will appear here"
      />
    </div>
  );
}
