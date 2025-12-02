"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TransactionsView from "../../components/TransactionsView";
import useAccounts from "../../lib/useAccounts";

function TransactionsInner() {
  const acc = useAccounts();
  const searchParams = useSearchParams();
  const queryParty = searchParams?.get("party") || null;
  const [selected, setSelected] = useState<string | null>(queryParty);

  useEffect(() => {
    setSelected(searchParams?.get("party") || null);
  }, [searchParams]);

  const consolidated = useMemo(() => acc.consolidated(), [acc.parties, acc.transactions]);

  const selectedParty = acc.parties.find((p) => p.id === selected) || null;

  return (
    <div className="app-shell">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Transactions</h1>
          <Link href="/" className="text-sky-600">Back</Link>
        </div>

        <TransactionsView
          party={selectedParty}
          transactions={acc.transactions}
          onAdd={(tx) => acc.addTransaction(tx)}
          onUpdate={(id, patch) => acc.updateTransaction(id, patch)}
          onDelete={(id) => acc.deleteTransaction(id)}
        />
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <TransactionsInner />
    </Suspense>
  );
}
