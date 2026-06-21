import React, { useState } from "react";
import { CrudPage, StatusBadge, SearchInput } from "../../components/CrudPage.js";

interface Operator { id: string; code: string; name: string; status: string; currency: string; players: number; ggr: string; providers: number; }

const mockOperators: Operator[] = [
  { id: "o1", code: "betzone", name: "BetZone Ltd", status: "active", currency: "USD", players: 12400, ggr: "$84,300", providers: 8 },
  { id: "o2", code: "spinpalace", name: "Spin Palace", status: "active", currency: "EUR", players: 8700, ggr: "€56,200", providers: 6 },
  { id: "o3", code: "casinomax", name: "Casino Max", status: "suspended", currency: "GBP", players: 3200, ggr: "£12,800", providers: 4 }
];

export function OperatorsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const filtered = mockOperators.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase()));
  return (
    <CrudPage
      title="Operators"
      subtitle="Operator accounts, commercial terms, provider assignments, and performance"
      columns={[
        { key: "code", header: "Code", render: (o) => <code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{o.code}</code> },
        { key: "name", header: "Operator", render: (o) => <strong>{o.name}</strong> },
        { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
        { key: "currency", header: "Currency", render: (o) => o.currency },
        { key: "players", header: "Players", render: (o) => o.players.toLocaleString() },
        { key: "ggr", header: "GGR (30d)", render: (o) => o.ggr },
        { key: "providers", header: "Providers", render: (o) => o.providers },
        { key: "actions", header: "", render: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm">View</button>
            <button className="btn btn-ghost btn-sm">Pricing</button>
          </div>
        )}
      ]}
      rows={filtered}
      getRowKey={(o) => o.id}
      addLabel="Add Operator"
      onAdd={() => alert("Add Operator")}
      emptyTitle="No operators yet"
      emptyDescription="Onboard your first operator to get started"
      filters={<SearchInput value={search} onChange={setSearch} placeholder="Search operators…" />}
    />
  );
}
