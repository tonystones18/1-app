import React from "react";
import { CrudPage, StatusBadge } from "../../components/CrudPage.js";

interface BonusInstance { id: string; type: string; playerId: string; amount: string; currency: string; wageringDone: string; wageringReq: string; status: string; expiresAt: string; }

const mockBonuses: BonusInstance[] = [
  { id: "b1", type: "deposit_match", playerId: "pl1", amount: "£100.00", currency: "GBP", wageringDone: "£1,250", wageringReq: "£3,500", status: "wagering", expiresAt: "2026-07-20" },
  { id: "b2", type: "free_spins", playerId: "pl2", amount: "€25.00", currency: "EUR", wageringDone: "€25", wageringReq: "€25", status: "completed", expiresAt: "2026-07-01" }
];

export function BonusesPage(): React.JSX.Element {
  return (
    <CrudPage
      title="Bonuses"
      subtitle="Bonus templates, active player instances, wagering progress, and cost analytics"
      columns={[
        { key: "type", header: "Bonus Type", render: (b) => <span className="badge badge-blue">{b.type.replace("_", " ")}</span> },
        { key: "player", header: "Player", render: (b) => b.playerId },
        { key: "amount", header: "Amount", render: (b) => <strong>{b.amount}</strong> },
        { key: "wagering", header: "Wagering", render: (b) => `${b.wageringDone} / ${b.wageringReq}` },
        { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
        { key: "expires", header: "Expires", render: (b) => b.expiresAt },
        { key: "actions", header: "", render: () => <button className="btn btn-ghost btn-sm">View</button> }
      ]}
      rows={mockBonuses}
      getRowKey={(b) => b.id}
      addLabel="Create Template"
      onAdd={() => alert("Create Bonus Template")}
    />
  );
}
