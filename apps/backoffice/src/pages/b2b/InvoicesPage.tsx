import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface Invoice { id: string; number: string; operator: string; total: string; currency: string; status: string; dueAt: string; issuedAt: string; }

const mockInvoices: Invoice[] = [
  { id: "inv1", number: "INV-202606-00123", operator: "BetZone Ltd", total: "$20,400.00", currency: "USD", status: "issued", dueAt: "2026-07-15", issuedAt: "2026-06-20" },
  { id: "inv2", number: "INV-202606-00122", operator: "Spin Palace", total: "€12,800.00", currency: "EUR", status: "paid", dueAt: "2026-07-01", issuedAt: "2026-06-01" },
  { id: "inv3", number: "INV-202606-00121", operator: "Casino Max", total: "£5,200.00", currency: "GBP", status: "overdue", dueAt: "2026-06-15", issuedAt: "2026-05-20" }
];

export function InvoicesPage(): React.JSX.Element {
  return (
    <CrudPage
      title="Invoices"
      subtitle="Operator billing, credit notes, payment status, and aging"
      columns={[
        { key: "number", header: "Invoice #", render: (i) => <code style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{i.number}</code> },
        { key: "operator", header: "Operator", render: (i) => <strong>{i.operator}</strong> },
        { key: "total", header: "Total", render: (i) => i.total },
        { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
        { key: "issued", header: "Issued", render: (i) => i.issuedAt },
        { key: "due", header: "Due Date", render: (i) => i.dueAt },
        { key: "actions", header: "", render: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm">View</button>
            <button className="btn btn-ghost btn-sm">PDF</button>
          </div>
        )}
      ]}
      rows={mockInvoices}
      getRowKey={(i) => i.id}
      addLabel="Create Invoice"
      onAdd={() => alert("Create Invoice")}
    />
  );
}
