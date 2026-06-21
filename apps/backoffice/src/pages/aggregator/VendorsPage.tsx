import React, { useState } from "react";
import { CrudPage, StatusBadge, SearchInput } from "../../components/CrudPage.js";

interface Vendor { id: string; code: string; name: string; status: string; providers: number; games: number; currency: string; }

const mockVendors: Vendor[] = [
  { id: "v1", code: "pragmaticgroup", name: "Pragmatic Group", status: "active", providers: 2, games: 512, currency: "USD" },
  { id: "v2", code: "evolutiongroup", name: "Evolution Group", status: "active", providers: 3, games: 300, currency: "EUR" }
];

export function VendorsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const filtered = mockVendors.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <CrudPage
      title="Vendors"
      subtitle="Game studio and vendor relationships, contracts, and commercial terms"
      columns={[
        { key: "code", header: "Code", render: (v) => <code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{v.code}</code> },
        { key: "name", header: "Vendor Name", render: (v) => <strong>{v.name}</strong> },
        { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
        { key: "providers", header: "Providers", render: (v) => v.providers },
        { key: "games", header: "Games", render: (v) => v.games.toLocaleString() },
        { key: "currency", header: "Currency", render: (v) => v.currency },
        { key: "actions", header: "", render: () => <button className="btn btn-ghost btn-sm">View</button> }
      ]}
      rows={filtered}
      getRowKey={(v) => v.id}
      addLabel="Add Vendor"
      onAdd={() => alert("Add Vendor")}
      filters={<SearchInput value={search} onChange={setSearch} placeholder="Search vendors…" />}
    />
  );
}
