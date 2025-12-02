"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import PartyList from "../components/PartyList";
import useAccounts from "../lib/useAccounts";

export default function Home() {
  const acc = useAccounts();
  const [selected, setSelected] = useState<string | null>(null);

  const consolidated = useMemo(() => acc.consolidated(), [acc.parties, acc.transactions]);

  const selectedParty = acc.parties.find((p) => p.id === selected) || null;

  return (
    <div className="app-shell">
      <div className="max-w-full mx-auto flex flex-wrap gap-6">
        <div className="w-full">
          <PartyList
            parties={acc.parties}
            consolidated={consolidated}
            onSelect={(id) => setSelected(id)}
            onAdd={(name) => acc.addParty(name)}
            onDelete={(id) => acc.removeParty(id)}
          />
        </div>
      </div>
    </div>
  );
}
