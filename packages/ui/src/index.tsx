import React from "react";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

// ─── Button ────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps): React.JSX.Element {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${loading ? "btn-loading" : ""} ${className}`}
      disabled={disabled ?? loading}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────

export type BadgeColor = "green" | "yellow" | "red" | "blue" | "neutral";

export interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
}

export function Badge({ color = "neutral", children }: BadgeProps): React.JSX.Element {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

// ─── Input ────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = "", ...rest }: InputProps): React.JSX.Element {
  return (
    <div className="field">
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <input
        id={id}
        className={`input ${error ? "input-error" : ""} ${className}`}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, id, className = "", ...rest }: SelectProps): React.JSX.Element {
  return (
    <div className="field">
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <select
        id={id}
        className={`select ${error ? "select-error" : ""} ${className}`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────

export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, actions, children, className = "" }: CardProps): React.JSX.Element {
  return (
    <div className={`card ${className}`}>
      {(title ?? actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string;
  value: string | number;
  change?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: ReactNode;
}

export function KpiCard({ label, value, change, icon }: KpiCardProps): React.JSX.Element {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-label">{label}</span>
        {icon && <span className="kpi-icon">{icon}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change kpi-change-${change.direction}`}>
          {change.direction === "up" ? "↑" : change.direction === "down" ? "↓" : "—"} {change.value}
        </div>
      )}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

export interface TableProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  getRowKey: (row: T) => string;
}

export function Table<T>({
  columns,
  rows,
  loading = false,
  emptyMessage = "No records found.",
  getRowKey,
  className = "",
  ...rest
}: TableProps<T>): React.JSX.Element {
  return (
    <div className="table-wrapper">
      <table className={`table ${className}`} {...rest}>
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
              <td colSpan={columns.length} className="table-empty">{emptyMessage}</td>
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
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps): React.JSX.Element | null {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal modal-${size}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = "info", title, children, onClose }: AlertProps): React.JSX.Element {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <div className="alert-content">
        {title && <strong className="alert-title">{title}: </strong>}
        {children}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">✕</button>
      )}
    </div>
  );
}

// ─── Spinner ────────────────────────────────────────────────────────────────

export function Spinner({ size = "md", label = "Loading…" }: { size?: "sm" | "md" | "lg"; label?: string }): React.JSX.Element {
  return <span className={`spinner spinner-${size}`} aria-label={label} role="status" />;
}

// ─── Empty State ────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps): React.JSX.Element {
  const totalPages = Math.ceil(totalCount / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {from}–{to} of {totalCount}
      </span>
      <div className="pagination-controls">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ← Prev
        </button>
        <span className="pagination-page">{page} / {totalPages}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Status Badge helpers ────────────────────────────────────────────────────

export function statusToBadgeColor(status: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    active: "green",
    approved: "green",
    completed: "green",
    ok: "green",
    published: "green",
    draft: "neutral",
    pending: "yellow",
    pending_approval: "yellow",
    processing: "yellow",
    suspended: "yellow",
    degraded: "yellow",
    archived: "neutral",
    rejected: "red",
    failed: "red",
    down: "red",
    locked: "red"
  };
  return map[status.toLowerCase()] ?? "neutral";
}
