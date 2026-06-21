import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface WhiteLabel { id: string; code: string; name: string; domain: string; operatorId: string; status: string; playerCount: number; theme: string; }

const mockWhiteLabels: WhiteLabel[] = [
  { id: "wl1", code: "betzone-wl", name: "BetZone Casino", domain: "casino.betzone.com", operatorId: "o1", status: "published", playerCount: 8400, theme: "Dark Blue" },
  { id: "wl2", code: "spinpalace-wl", name: "Spin Palace", domain: "spinpalace.eu", operatorId: "o2", status: "draft", playerCount: 0, theme: "Purple" }
];

export function WhiteLabelsPage(): React.JSX.Element {
  return (
    <CrudPage
      title="White Labels"
      subtitle="Branded operator sites, theme builder, domains, menus, and provider packs"
      columns={[
        { key: "name", header: "White Label", render: (w) => <strong>{w.name}</strong> },
        { key: "domain", header: "Domain", render: (w) => <a href={`https://${w.domain}`} target="_blank" rel="noreferrer" style={{ color: "var(--color-brand-600)" }}>{w.domain}</a> },
        { key: "status", header: "Status", render: (w) => <StatusBadge status={w.status} /> },
        { key: "players", header: "Players", render: (w) => w.playerCount.toLocaleString() },
        { key: "theme", header: "Theme", render: (w) => w.theme },
        { key: "actions", header: "", render: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm">Theme Builder</button>
            <button className="btn btn-ghost btn-sm">Publish</button>
          </div>
        )}
      ]}
      rows={mockWhiteLabels}
      getRowKey={(w) => w.id}
      addLabel="Create White Label"
      onAdd={() => alert("Create White Label")}
    />
  );
}
