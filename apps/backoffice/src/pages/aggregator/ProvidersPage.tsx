import React, { useState } from "react";
import { CrudPage, StatusBadge, SearchInput } from "../../components/CrudPage.js";

interface Provider { id: string; code: string; name: string; status: string; walletMode: string; games: number; health: string; updatedAt: string; }

const mockProviders: Provider[] = [
  { id: "p1", code: "pragmatic", name: "Pragmatic Play", status: "active", walletMode: "seamless", games: 312, health: "ok", updatedAt: "2026-06-20" },
  { id: "p2", code: "evolution", name: "Evolution Gaming", status: "active", walletMode: "seamless", games: 180, health: "ok", updatedAt: "2026-06-20" },
  { id: "p3", code: "pgsoft", name: "PG Soft", status: "active", walletMode: "transfer", games: 220, health: "ok", updatedAt: "2026-06-20" },
  { id: "p4", code: "hacksaw", name: "Hacksaw Gaming", status: "active", walletMode: "seamless", games: 78, health: "degraded", updatedAt: "2026-06-19" },
  { id: "p5", code: "amusnet", name: "Amusnet", status: "sandbox", walletMode: "transfer", games: 95, health: "ok", updatedAt: "2026-06-18" }
];

export function ProvidersPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const filtered = mockProviders.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CrudPage
      title="Providers"
      subtitle="Game provider integrations, health monitoring, and configuration"
      columns={[
        { key: "code", header: "Code", render: (p) => <code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{p.code}</code> },
        { key: "name", header: "Provider Name", render: (p) => <strong>{p.name}</strong> },
        { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
        { key: "wallet", header: "Wallet Mode", render: (p) => <span className="badge badge-neutral">{p.walletMode}</span> },
        { key: "games", header: "Games", render: (p) => p.games.toLocaleString() },
        { key: "health", header: "Health", render: (p) => <span className={`status-dot status-${p.health}`}>{p.health}</span> },
        { key: "updated", header: "Updated", render: (p) => p.updatedAt },
        { key: "actions", header: "", render: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm">View</button>
            <button className="btn btn-ghost btn-sm">Health</button>
          </div>
        )}
      ]}
      rows={filtered}
      getRowKey={(p) => p.id}
      addLabel="Add Provider"
      onAdd={() => alert("Add Provider — connect to identity service")}
      emptyTitle="No providers yet"
      emptyDescription="Add your first provider integration"
      filters={<SearchInput value={search} onChange={setSearch} placeholder="Search providers…" />}
    />
  );
}
