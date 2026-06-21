import React, { useState } from "react";

// ─── Generic CRUD Page Component ─────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface CrudPageProps<T> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowKey: (row: T) => string;
  filters?: React.ReactNode;
}

export function CrudPage<T>({
  title,
  subtitle,
  columns,
  rows,
  loading = false,
  onAdd,
  addLabel = "Add New",
  emptyTitle = "No records found",
  emptyDescription = "Add your first record to get started",
  getRowKey,
  filters
}: CrudPageProps<T>): React.JSX.Element {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Export</button>
          {onAdd && (
            <button className="btn btn-primary" onClick={onAdd}>
              + {addLabel}
            </button>
          )}
        </div>
      </div>

      {filters && (
        <div style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {filters}
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="table-loading">
                    <span className="spinner" aria-label="Loading" /> Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="empty-state">
                      <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📭</div>
                      <div className="empty-state-title">{emptyTitle}</div>
                      <div className="empty-state-description">{emptyDescription}</div>
                      {onAdd && (
                        <button className="btn btn-primary" onClick={onAdd}>+ {addLabel}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={getRowKey(row)}>
                    {columns.map((col) => (
                      <td key={col.key}>{col.render(row)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 0 && (
          <div className="pagination">
            <span>1–{rows.length} of {rows.length} records</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm" disabled>← Prev</button>
              <span className="pagination-page">1 / 1</span>
              <button className="btn btn-ghost btn-sm" disabled>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Badge helper ──────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const colorMap: Record<string, string> = {
    active: "green", approved: "green", completed: "green", ok: "green", published: "green",
    draft: "neutral", pending: "yellow", processing: "yellow", suspended: "yellow", degraded: "yellow",
    archived: "neutral", rejected: "red", failed: "red", down: "red", locked: "red",
    sandbox: "blue", certification: "blue"
  };
  const color = colorMap[status.toLowerCase()] ?? "neutral";
  return <span className={`badge badge-${color}`}>{status.replace(/_/g, " ")}</span>;
}

// ─── Inline search ────────────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder = "Search…" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}): React.JSX.Element {
  return (
    <input
      type="search"
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ maxWidth: "260px" }}
    />
  );
}
