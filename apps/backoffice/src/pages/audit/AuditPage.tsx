import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface AuditEntry { id: string; actor: string; action: string; entity: string; entityId: string; reason: string; ip: string; createdAt: string; }

const mockAuditLog: AuditEntry[] = [
  { id: "al1", actor: "admin@visionesoft.com", action: "create", entity: "Provider", entityId: "pragmatic", reason: "Provider onboarding", ip: "192.168.1.1", createdAt: "2026-06-21T09:00:00Z" },
  { id: "al2", actor: "admin@visionesoft.com", action: "approve", entity: "Invoice", entityId: "INV-202606-00123", reason: "Monthly billing approved", ip: "192.168.1.1", createdAt: "2026-06-20T15:30:00Z" },
  { id: "al3", actor: "admin@visionesoft.com", action: "update", entity: "Player", entityId: "pl3", reason: "Account suspended per compliance review", ip: "192.168.1.2", createdAt: "2026-06-19T11:15:00Z" }
];

export function AuditPage(): React.JSX.Element {
  return (
    <CrudPage
      title="Audit Log"
      subtitle="Immutable audit trail for all administrative, financial, and compliance actions"
      columns={[
        { key: "actor", header: "Actor", render: (a) => <code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{a.actor}</code> },
        { key: "action", header: "Action", render: (a) => <StatusBadge status={a.action} /> },
        { key: "entity", header: "Entity", render: (a) => <><strong>{a.entity}</strong> <span style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>({a.entityId})</span></> },
        { key: "reason", header: "Reason", render: (a) => <span style={{ fontSize: "0.8125rem" }}>{a.reason}</span> },
        { key: "ip", header: "IP", render: (a) => a.ip },
        { key: "time", header: "Time", render: (a) => new Date(a.createdAt).toLocaleString() }
      ]}
      rows={mockAuditLog}
      getRowKey={(a) => a.id}
      emptyTitle="No audit events"
    />
  );
}
