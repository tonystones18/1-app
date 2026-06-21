import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface Agent { id: string; code: string; name: string; status: string; operators: number; commission: string; currency: string; }

const mockAgents: Agent[] = [
  { id: "a1", code: "agent001", name: "Alpha Gaming Group", status: "active", operators: 4, commission: "$12,400", currency: "USD" },
  { id: "a2", code: "agent002", name: "Beta Distribution", status: "active", operators: 2, commission: "$7,800", currency: "EUR" }
];

export function AgentsPage(): React.JSX.Element {
  return (
    <CrudPage
      title="Agents"
      subtitle="Agent hierarchy, assigned operators, commission plans, and payouts"
      columns={[
        { key: "code", header: "Code", render: (a) => <code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{a.code}</code> },
        { key: "name", header: "Agent Name", render: (a) => <strong>{a.name}</strong> },
        { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
        { key: "operators", header: "Operators", render: (a) => a.operators },
        { key: "commission", header: "Commission (30d)", render: (a) => a.commission },
        { key: "actions", header: "", render: () => <button className="btn btn-ghost btn-sm">View</button> }
      ]}
      rows={mockAgents}
      getRowKey={(a) => a.id}
      addLabel="Add Agent"
      onAdd={() => alert("Add Agent")}
    />
  );
}
