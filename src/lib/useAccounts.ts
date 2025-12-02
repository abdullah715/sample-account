"use client";
import { useEffect, useState } from "react";
import { Party, Transaction } from "./types";

type State = {
  parties: Party[];
  transactions: Transaction[];
};

export default function useAccounts() {
  const [state, setState] = useState<State>({ parties: [], transactions: [] });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [pRes, tRes] = await Promise.all([fetch("/api/parties"), fetch("/api/transactions")]);
        // if (!pRes.ok || !tRes.ok) throw new Error("Failed to load data");
        const [parties, transactions] = await Promise.all([pRes.json(), tRes.json()]);
        if (!mounted) return;
        setState({ parties, transactions });
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const addParty = async (name: string) => {
    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create party");
      const party: Party = await res.json();
      setState((s) => ({ ...s, parties: [...s.parties, party] }));
      return party;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      const transaction: Transaction = await res.json();
      setState((s) => ({ ...s, transactions: [...s.transactions, transaction] }));
      return transaction;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateTransaction = async (id: string, patch: Partial<Transaction>) => {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      const updated: Transaction = await res.json();
      setState((s) => ({ ...s, transactions: s.transactions.map((t) => (t.id === id ? updated : t)) }));
      return updated;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const renameParty = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/parties?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename party");
      const updated: Party = await res.json();
      setState((s) => ({ ...s, parties: s.parties.map((p) => (p.id === id ? updated : p)) }));
      return updated;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const removeParty = async (id: string) => {
    try {
      const res = await fetch(`/api/parties?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove party");
      setState((s) => ({ ...s, parties: s.parties.filter((p) => p.id !== id), transactions: s.transactions.filter((t) => t.partyId !== id) }));
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const consolidated = () => {
    const map = new Map<string, number>();
    for (const p of state.parties) map.set(p.id, 0);
    for (const t of state.transactions) {
      const amount = t.kind === "owed" ? t.amount : -t.amount;
      map.set(t.partyId, (map.get(t.partyId) || 0) + amount);
    }
    return map;
  };

  return {
    parties: state.parties,
    transactions: state.transactions,
    addParty,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    renameParty,
    removeParty,
    consolidated,
  };
}
