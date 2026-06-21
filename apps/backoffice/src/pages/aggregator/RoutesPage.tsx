import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface RoutePolicy { id: string; code: string; type: string; provider: string; priority: string; status: string; successRate: string; }

const mockRoutes: RoutePolicy[] = [
  { id: "r1", code: "casino-primary", type: "GAME_LAUNCH", provider: "Pragmatic Play", priority: "PRIMARY", status: "active", successRate: "99.2%" },
  { id: "r2", code: "casino-fallback", type: "GAME_LAUNCH", provider: "PG Soft", priority: "FALLBACK", status: "active", successRate: "98.7%" },
  { id: "r3", code: "live-primary", type: "GAME_LAUNCH", provider: "Evolution", priority: "PRIMARY", status: "active", successRate: "99.8%" }
];

export function RoutesPage(): React.JSX.Element {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Route Center</h1>
          <p className="page-subtitle">Game launch, wallet, callback, and payment route policies</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Simulate</button>
          <button className="btn btn-primary">+ New Policy</button>
        </div>
      </div>

      <div className="tabs">
        {["Policies", "Groups", "Monitoring", "Simulations", "Incidents", "Analytics"].map((tab) => (
          <button key={tab} className={`tab${tab === "Policies" ? " active" : ""}`}>{tab}</button>
        ))}
      </div>

      <CrudPage
        title=""
        columns={[
          { key: "code", header: "Policy Code", render: (r) => <code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{r.code}</code> },
          { key: "type", header: "Route Type", render: (r) => <span className="badge badge-blue">{r.type}</span> },
          { key: "provider", header: "Provider", render: (r) => r.provider },
          { key: "priority", header: "Priority", render: (r) => <span className="badge badge-neutral">{r.priority}</span> },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "success", header: "Success Rate", render: (r) => r.successRate },
          { key: "actions", header: "", render: () => (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-ghost btn-sm">Edit</button>
              <button className="btn btn-ghost btn-sm">Simulate</button>
            </div>
          )}
        ]}
        rows={mockRoutes}
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
