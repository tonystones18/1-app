import React, { useState } from "react";
import { CrudPage, StatusBadge, SearchInput } from "../../components/CrudPage.js";

interface Player { id: string; email: string; country: string; currency: string; status: string; kycStatus: string; balance: string; createdAt: string; }

const mockPlayers: Player[] = [
  { id: "pl1", email: "player1@example.com", country: "GB", currency: "GBP", status: "active", kycStatus: "passed", balance: "£234.50", createdAt: "2026-05-12" },
  { id: "pl2", email: "player2@example.com", country: "MT", currency: "EUR", status: "active", kycStatus: "in_progress", balance: "€89.00", createdAt: "2026-06-01" },
  { id: "pl3", email: "player3@example.com", country: "US", currency: "USD", status: "suspended", kycStatus: "failed", balance: "$0.00", createdAt: "2026-04-22" }
];

export function PlayersPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const filtered = mockPlayers.filter((p) => p.email.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase()));
  return (
    <CrudPage
      title="Players"
      subtitle="Player accounts, profiles, KYC status, and account history"
      columns={[
        { key: "email", header: "Email", render: (p) => <strong style={{ fontSize: "0.875rem" }}>{p.email}</strong> },
        { key: "country", header: "Country", render: (p) => p.country },
        { key: "currency", header: "Currency", render: (p) => p.currency },
        { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
        { key: "kyc", header: "KYC", render: (p) => <StatusBadge status={p.kycStatus} /> },
        { key: "balance", header: "Balance", render: (p) => p.balance },
        { key: "created", header: "Registered", render: (p) => p.createdAt },
        { key: "actions", header: "", render: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm">View</button>
            <button className="btn btn-ghost btn-sm">Wallet</button>
          </div>
        )}
      ]}
      rows={filtered}
      getRowKey={(p) => p.id}
      emptyTitle="No players found"
      emptyDescription="Players will appear here once they register through a white label or operator"
      filters={<SearchInput value={search} onChange={setSearch} placeholder="Search by email or country…" />}
    />
  );
}
