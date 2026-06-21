import React from "react";

interface KpiCardProps {
  label: string;
  value: string;
  change?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: string;
}

function KpiCard({ label, value, change, icon }: KpiCardProps): React.JSX.Element {
  return (
    <div className="kpi-card">
      <span className="kpi-label">{icon ? `${icon} ` : ""}{label}</span>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change kpi-change-${change.direction}`}>
          {change.direction === "up" ? "↑" : change.direction === "down" ? "↓" : "—"} {change.value}
        </div>
      )}
    </div>
  );
}

interface AlertItem {
  severity: "info" | "warning" | "critical";
  title: string;
  time: string;
}

const alerts: AlertItem[] = [
  { severity: "info", title: "Phase 0 Foundation build in progress — all services active", time: "just now" },
  { severity: "info", title: "Architecture baseline frozen at v32.0.0", time: "2026-06-20" },
  { severity: "info", title: "Database migrations pending — run prisma migrate dev", time: "pending" }
];

const severityColor: Record<string, string> = {
  info: "blue",
  warning: "yellow",
  critical: "red"
};

export function DashboardPage(): React.JSX.Element {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Aggregator Overview</h1>
          <p className="page-subtitle">VisioneSoft Platform — Phase 0 Foundation · Build Progress: ~35% (all services scaffolded)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Export</button>
          <button className="btn btn-primary">+ Create</button>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="kpi-grid">
        <KpiCard label="Total GGR" value="—" change={{ value: "Data pending", direction: "neutral" }} icon="💰" />
        <KpiCard label="Total NGR" value="—" change={{ value: "Data pending", direction: "neutral" }} icon="📈" />
        <KpiCard label="Active Operators" value="0" change={{ value: "Building", direction: "neutral" }} icon="🏢" />
        <KpiCard label="Active Providers" value="0" change={{ value: "Building", direction: "neutral" }} icon="🔌" />
        <KpiCard label="Active Players" value="0" change={{ value: "Building", direction: "neutral" }} icon="👥" />
        <KpiCard label="Total Deposits" value="—" change={{ value: "Data pending", direction: "neutral" }} icon="💳" />
        <KpiCard label="Route Success" value="—" change={{ value: "Data pending", direction: "neutral" }} icon="🛣" />
        <KpiCard label="System Health" value="OK" change={{ value: "All services up", direction: "up" }} icon="✅" />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: "20px" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-subtitle">GGR and NGR over time</div>
            </div>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📊</div>
              <div className="empty-state-title">Chart data not yet available</div>
              <div className="empty-state-description">Connect ClickHouse warehouse to render live charts</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Provider Performance</div>
              <div className="card-subtitle">Margin, health, and latency</div>
            </div>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔌</div>
              <div className="empty-state-title">No providers registered yet</div>
              <div className="empty-state-description">Add providers in the Aggregator section to see performance data</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Alerts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Build Progress</div>
          </div>
          <div className="card-body">
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Services</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Aggregator", "provider, vendor, routing, operator", "active"],
                  ["B2C", "player, wallet, payment, bonus, vip", "active"],
                  ["B2B", "crm, billing, affiliate, compliance", "active"],
                  ["Media & AI", "media, ai", "active"],
                  ["Analytics", "analytics, kpi, reporting, warehouse", "active"],
                  ["Identity", "identity, api-gateway", "active"],
                  ["Settlement", "settlement-service", "active"],
                  ["Database", "schema defined, migrations pending", "pending"],
                  ["Infrastructure", "K8s base, terraform stub", "partial"]
                ].map(([domain, desc, status]) => (
                  <tr key={domain}>
                    <td><strong>{domain}</strong></td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-neutral-500)" }}>{desc}</td>
                    <td>
                      <span className={`badge badge-${status === "active" ? "green" : status === "pending" ? "yellow" : "blue"}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">System Alerts</div>
            <div className="card-actions">
              <button className="btn btn-ghost btn-sm">View all</button>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {alerts.map((alert, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "var(--color-neutral-50)", borderRadius: "6px", border: "1px solid var(--color-neutral-200)" }}>
                  <span className={`badge badge-${severityColor[alert.severity]}`}>{alert.severity}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-neutral-700)" }}>{alert.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", marginTop: "2px" }}>{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
