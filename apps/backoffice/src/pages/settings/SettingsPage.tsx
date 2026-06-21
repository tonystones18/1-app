import React, { useState } from "react";
import { roleRegistry } from "@visionesoft/permissions";

export function SettingsPage(): React.JSX.Element {
  const [tab, setTab] = useState("General");
  const tabs = ["General", "RBAC & Roles", "Feature Flags", "Integrations", "System"];
  const roles = Object.values(roleRegistry);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Platform configuration, RBAC, feature flags, and system settings</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => <button key={t} className={`tab${t === tab ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === "General" && (
        <div className="card">
          <div className="card-header"><div className="card-title">Platform Configuration</div></div>
          <div className="card-body">
            <div className="grid-2">
              <div className="field"><label className="field-label">Platform Name</label><input className="input" defaultValue="VisioneSoft Platform" /></div>
              <div className="field"><label className="field-label">Default Currency</label><input className="input" defaultValue="USD" /></div>
              <div className="field"><label className="field-label">Default Language</label><input className="input" defaultValue="en" /></div>
              <div className="field"><label className="field-label">Timezone</label><input className="input" defaultValue="UTC" /></div>
              <div className="field"><label className="field-label">Support Email</label><input className="input" defaultValue="support@visionesoft.com" /></div>
              <div className="field"><label className="field-label">Build Version</label><input className="input" defaultValue="v32.0.0 Phase 0" disabled /></div>
            </div>
          </div>
        </div>
      )}

      {tab === "RBAC & Roles" && (
        <div className="card">
          <div className="card-header"><div className="card-title">Role Registry</div></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Role ID</th><th>Label</th><th>Buy Price Access</th><th>Permissions</th></tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td><code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{role.id}</code></td>
                    <td><strong>{role.label}</strong></td>
                    <td><span className={`badge badge-${role.canViewBuyPrice ? "green" : "red"}`}>{role.canViewBuyPrice ? "Yes" : "No"}</span></td>
                    <td><span className="badge badge-neutral">{role.permissions.length} permissions</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Feature Flags" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Feature Flags</div>
            <div className="card-actions"><button className="btn btn-secondary btn-sm">+ New Flag</button></div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Flag</th><th>Description</th><th>Status</th><th>Rollout</th></tr></thead>
              <tbody>
                {[
                  ["ai_copilot", "AI Copilot for all roles", "enabled", "100%"],
                  ["media_ai_generation", "AI media generation in Media Center", "enabled", "100%"],
                  ["sportsbook", "Sportsbook module", "disabled", "0%"],
                  ["mobile_apps", "White-label mobile app builder", "disabled", "0%"],
                  ["advanced_routing_simulation", "Route simulation v2", "enabled", "50%"]
                ].map(([flag, desc, status, rollout]) => (
                  <tr key={flag}>
                    <td><code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{flag}</code></td>
                    <td style={{ fontSize: "0.8125rem" }}>{desc}</td>
                    <td><span className={`badge badge-${status === "enabled" ? "green" : "neutral"}`}>{status}</span></td>
                    <td>{rollout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Integrations" && (
        <div className="card">
          <div className="card-header"><div className="card-title">Integration Registry</div></div>
          <div className="card-body">
            <div className="grid-3">
              {[
                { name: "Cloudflare R2", status: "configured", icon: "☁" },
                { name: "Cloudflare Images", status: "configured", icon: "🖼" },
                { name: "Workers AI", status: "configured", icon: "🤖" },
                { name: "PostgreSQL", status: "configured", icon: "🐘" },
                { name: "Redis", status: "pending", icon: "🔴" },
                { name: "ClickHouse", status: "pending", icon: "📊" }
              ].map((integration) => (
                <div key={integration.name} className="card">
                  <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{integration.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{integration.name}</div>
                      <span className={`badge badge-${integration.status === "configured" ? "green" : "yellow"}`}>{integration.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "System" && (
        <div className="card">
          <div className="card-header"><div className="card-title">System Information</div></div>
          <div className="card-body">
            <table>
              <tbody>
                {[
                  ["Architecture Version", "v32.0.0"],
                  ["Build Stage", "Phase 0 — Foundation"],
                  ["Build Progress", "~35% (all services scaffolded)"],
                  ["Architecture Status", "Architecture Complete, Greenfield Build"],
                  ["Database", "PostgreSQL via Prisma"],
                  ["Analytics", "ClickHouse (planned)"],
                  ["Cache", "Redis (planned)"],
                  ["Object Storage", "RustFS primary, Cloudflare R2 replication"],
                  ["CDN", "Cloudflare"],
                  ["Node.js", ">=20.19.0"],
                  ["Package Manager", "pnpm 9.15.4"],
                  ["Build System", "Turborepo"]
                ].map(([k, v]) => (
                  <tr key={k}><td style={{ width: "200px", color: "var(--color-neutral-500)" }}>{k}</td><td style={{ fontWeight: 500 }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
