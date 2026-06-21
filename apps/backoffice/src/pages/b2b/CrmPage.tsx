import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface CrmAccount { id: string; company: string; country: string; status: string; assignedTo: string; contractValue: string; lastActivity: string; }

const mockAccounts: CrmAccount[] = [
  { id: "c1", company: "BetZone Ltd", country: "MT", status: "active", assignedTo: "John Smith", contractValue: "$240,000/yr", lastActivity: "2026-06-20" },
  { id: "c2", company: "Spin Palace SRL", country: "CY", status: "onboarding", assignedTo: "Maria Garcia", contractValue: "$120,000/yr", lastActivity: "2026-06-18" },
  { id: "c3", company: "Casino Max Ltd", country: "GB", status: "at_risk", assignedTo: "David Lee", contractValue: "$60,000/yr", lastActivity: "2026-06-10" }
];

export function CrmPage(): React.JSX.Element {
  return (
    <CrudPage
      title="Operator CRM"
      subtitle="B2B CRM accounts, contacts, activities, and pipeline management"
      columns={[
        { key: "company", header: "Company", render: (a) => <strong>{a.company}</strong> },
        { key: "country", header: "Country", render: (a) => a.country },
        { key: "status", header: "Lifecycle", render: (a) => <StatusBadge status={a.status} /> },
        { key: "assigned", header: "Account Manager", render: (a) => a.assignedTo },
        { key: "value", header: "Contract Value", render: (a) => a.contractValue },
        { key: "activity", header: "Last Activity", render: (a) => a.lastActivity },
        { key: "actions", header: "", render: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm">View</button>
            <button className="btn btn-ghost btn-sm">Log Activity</button>
          </div>
        )}
      ]}
      rows={mockAccounts}
      getRowKey={(a) => a.id}
      addLabel="Add Account"
      onAdd={() => alert("Add CRM Account")}
    />
  );
}
