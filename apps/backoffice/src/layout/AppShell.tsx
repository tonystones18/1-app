import React from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";

interface NavSection {
  label: string;
  items: { label: string; path: string; icon: string }[];
}

const navSections: NavSection[] = [
  {
    label: "Aggregator",
    items: [
      { label: "Dashboard", path: "/", icon: "⊞" },
      { label: "Providers", path: "/aggregator/providers", icon: "🔌" },
      { label: "Vendors", path: "/aggregator/vendors", icon: "🏢" },
      { label: "Games", path: "/aggregator/games", icon: "🎮" },
      { label: "Operators", path: "/aggregator/operators", icon: "👤" },
      { label: "Agents", path: "/aggregator/agents", icon: "🤝" },
      { label: "Routes", path: "/aggregator/routes", icon: "🛣" }
    ]
  },
  {
    label: "Player Operations",
    items: [
      { label: "Players", path: "/b2c/players", icon: "👥" },
      { label: "Payments", path: "/b2c/payments", icon: "💳" },
      { label: "Bonuses", path: "/b2c/bonuses", icon: "🎁" }
    ]
  },
  {
    label: "B2B Operations",
    items: [
      { label: "White Labels", path: "/b2b/white-labels", icon: "🏷" },
      { label: "CRM", path: "/b2b/crm", icon: "📊" },
      { label: "Invoices", path: "/b2b/invoices", icon: "🧾" }
    ]
  },
  {
    label: "Media & AI",
    items: [
      { label: "Media Center", path: "/media", icon: "🖼" },
      { label: "AI Copilot", path: "/ai", icon: "🤖" }
    ]
  },
  {
    label: "Platform",
    items: [
      { label: "Reports", path: "/reports", icon: "📈" },
      { label: "Audit Log", path: "/audit", icon: "📋" },
      { label: "Settings", path: "/settings", icon: "⚙" }
    ]
  }
];

export function AppShell({ children }: { children: ReactNode }): React.JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (): void => {
    logout();
    void navigate("/login");
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar" aria-label="Navigation">
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">VisioneSoft</span>
          <span className="sidebar-brand-badge">Admin</span>
        </div>

        <nav aria-label="Primary navigation">
          {navSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              <span className="sidebar-section-label">{section.label}</span>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" aria-hidden="true">
              {user?.displayName.slice(0, 1).toUpperCase() ?? "A"}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.displayName ?? "Admin"}</div>
              <div className="sidebar-user-role">{user?.roleId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Role"}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              style={{ marginLeft: "auto" }}
            >
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-breadcrumb">
          <strong>{pageTitle}</strong>
        </div>
        <div className="topbar-actions">
          <div className="topbar-search" role="search" aria-label="Global search">
            <span>Search anything…</span>
            <kbd className="topbar-kbd">Ctrl K</kbd>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="content" id="main-content">
        {children}
      </main>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/aggregator/providers": "Providers",
    "/aggregator/vendors": "Vendors",
    "/aggregator/games": "Games",
    "/aggregator/operators": "Operators",
    "/aggregator/agents": "Agents",
    "/aggregator/routes": "Route Center",
    "/b2c/players": "Players",
    "/b2c/payments": "Payments",
    "/b2c/bonuses": "Bonuses",
    "/b2b/white-labels": "White Labels",
    "/b2b/crm": "CRM Accounts",
    "/b2b/invoices": "Invoices",
    "/media": "Media Center",
    "/ai": "AI Copilot",
    "/reports": "Reports",
    "/audit": "Audit Log",
    "/settings": "Settings"
  };
  return titles[pathname] ?? "VisioneSoft Admin";
}
