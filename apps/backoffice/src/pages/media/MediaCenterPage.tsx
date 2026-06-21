import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface MediaAsset { id: string; title: string; type: string; ownerType: string; status: string; size: string; mimeType: string; updatedAt: string; }

const mockAssets: MediaAsset[] = [
  { id: "m1", title: "Pragmatic Play Logo (Full)", type: "provider_logo", ownerType: "provider", status: "approved", size: "42KB", mimeType: "image/svg+xml", updatedAt: "2026-06-20" },
  { id: "m2", title: "Gates of Olympus Thumbnail", type: "game_image", ownerType: "game", status: "approved", size: "128KB", mimeType: "image/webp", updatedAt: "2026-06-19" },
  { id: "m3", title: "Summer Promotion Banner", type: "banner", ownerType: "campaign", status: "pending_approval", size: "256KB", mimeType: "image/jpeg", updatedAt: "2026-06-21" },
  { id: "m4", title: "AI Generated Background", type: "ai_generated", ownerType: "platform", status: "draft", size: "1.2MB", mimeType: "image/png", updatedAt: "2026-06-21" }
];

export function MediaCenterPage(): React.JSX.Element {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Media Center</h1>
          <p className="page-subtitle">Asset library, Cloudflare Images, R2 storage, approvals, and AI generation</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">🤖 Generate with AI</button>
          <button className="btn btn-primary">+ Upload Asset</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "24px" }}>
        {[
          { label: "Total Assets", value: "4" },
          { label: "Pending Approval", value: "1" },
          { label: "AI Generated", value: "1" },
          { label: "CDN Deliveries", value: "—" }
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <span className="kpi-label">{k.label}</span>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <CrudPage
        title=""
        columns={[
          { key: "title", header: "Asset Name", render: (a) => <strong>{a.title}</strong> },
          { key: "type", header: "Type", render: (a) => <span className="badge badge-blue">{a.type.replace("_", " ")}</span> },
          { key: "owner", header: "Owner", render: (a) => a.ownerType },
          { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
          { key: "size", header: "Size", render: (a) => a.size },
          { key: "mime", header: "Type", render: (a) => a.mimeType },
          { key: "updated", header: "Updated", render: (a) => a.updatedAt },
          { key: "actions", header: "", render: () => (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-ghost btn-sm">Preview</button>
              <button className="btn btn-ghost btn-sm">Approve</button>
            </div>
          )}
        ]}
        rows={mockAssets}
        getRowKey={(a) => a.id}
        emptyTitle="No assets yet"
        emptyDescription="Upload or generate your first media asset"
      />
    </div>
  );
}
