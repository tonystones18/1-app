import React, { useState } from "react";
import { CrudPage, StatusBadge, SearchInput } from "../../components/CrudPage.js";

interface Game { id: string; name: string; provider: string; category: string; rtp: string; status: string; jurisdictions: number; }

const mockGames: Game[] = [
  { id: "g1", name: "Gates of Olympus", provider: "Pragmatic Play", category: "Slots", rtp: "96.50%", status: "active", jurisdictions: 42 },
  { id: "g2", name: "Sweet Bonanza", provider: "Pragmatic Play", category: "Slots", rtp: "96.51%", status: "active", jurisdictions: 38 },
  { id: "g3", name: "Lightning Roulette", provider: "Evolution", category: "Live Casino", rtp: "97.30%", status: "active", jurisdictions: 55 },
  { id: "g4", name: "Crazy Time", provider: "Evolution", category: "Game Shows", rtp: "96.08%", status: "active", jurisdictions: 50 }
];

export function GamesPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const filtered = mockGames.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.provider.toLowerCase().includes(search.toLowerCase()));
  return (
    <CrudPage
      title="Game Catalog"
      subtitle="Master game catalog with RTP, jurisdictions, and provider mappings"
      columns={[
        { key: "name", header: "Game Name", render: (g) => <strong>{g.name}</strong> },
        { key: "provider", header: "Provider", render: (g) => g.provider },
        { key: "category", header: "Category", render: (g) => <span className="badge badge-blue">{g.category}</span> },
        { key: "rtp", header: "RTP", render: (g) => g.rtp },
        { key: "status", header: "Status", render: (g) => <StatusBadge status={g.status} /> },
        { key: "jurisdictions", header: "Jurisdictions", render: (g) => g.jurisdictions },
        { key: "actions", header: "", render: () => <button className="btn btn-ghost btn-sm">View</button> }
      ]}
      rows={filtered}
      getRowKey={(g) => g.id}
      addLabel="Sync Games"
      emptyTitle="No games in catalog"
      emptyDescription="Sync games from a provider to populate the catalog"
      filters={<SearchInput value={search} onChange={setSearch} placeholder="Search games…" />}
    />
  );
}
