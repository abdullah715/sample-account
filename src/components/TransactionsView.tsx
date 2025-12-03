"use client";
import React, { useRef, useState } from "react";
import { Transaction, Party } from "../lib/types";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import useAccounts from "@/lib/useAccounts";
import { formatCurrencyShort } from "@/lib/utils";

type Props = {
  party?: Party | null;
  transactions: Transaction[];
  onAdd: (tx: Omit<Transaction, "id">) => void;
  onUpdate: (id: string, patch: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
};

export default function TransactionsView({ party, transactions, onAdd, onUpdate, onDelete,onRename }: Props) {
  const relevant = transactions.filter((t) => t.partyId === party?.id);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", kind: "owed", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [name, setName] = useState(party?.name || "");

  const handleAddSave = (vals: { date: string; amount: number; kind: string; description?: string }) => {
    const amount = vals.amount || 0;
    if (!party || amount <= 0) return;
    onAdd({ partyId: party.id, date: vals.date, amount, kind: vals.kind as any, description: vals.description || undefined });
    setForm({ date: new Date().toISOString().slice(0, 10), amount: "", kind: "owed", description: "" });
    setShowAddModal(false);
  };

  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleRename = (e: React.FormEvent<HTMLHeadingElement>) => {
    const newName = e.currentTarget.innerHTML;
    // setName(newName);
    if (party && newName && newName !== party.name) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onRename(party.id, newName);
      }, 500);
    }
  };

  const total = relevant.reduce((s, t) => s + (t.kind === "owed" ? t.amount : -t.amount), 0);
  return (
    <section className="flex-1">
      {!party ? (
        <div className="card small-muted">Select a party to view transactions</div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold" contentEditable={true} onBlur={handleRename} suppressContentEditableWarning>{party?.name}</h2>
            <div className="small-muted">Total: <span className="badge">{formatCurrencyShort(total)}</span></div>
          </div>

          <div className="card">
            <div className="flex gap-2 items-center">
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2"><PlusCircle size={18} /> Add</button>
            </div>

            <ul className="mt-4 space-y-3">
              {relevant.length === 0 && <li className="small-muted">No transactions yet.</li>}
              {relevant.sort((a, b) => -new Date(a.date).getTime() + new Date(b.date).getTime()).map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <div>
                    <div className="small-muted">{t.date}</div>
                    <div className={`font-medium ${t.kind === "owed" ? "text-green-600" : "text-red-600"}`}>{t.kind === "owed" ? `+${formatCurrencyShort(t.amount)}` : `-${formatCurrencyShort(t.amount)}`}</div>
                    <div className="small-muted">{t.description}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(t.id)} className="btn btn-ghost"><Edit size={16} /> </button>
                    <button onClick={() => onDelete(t.id)} className="btn btn-ghost text-red-600"><Trash2 size={16} /> </button>
                  </div>
                </li>
              ))}
            </ul>

            {editingId && (
              <EditTransaction
                tx={relevant.find((r) => r.id === editingId)!}
                onCancel={() => setEditingId(null)}
                onSave={(patch) => {
                  onUpdate(editingId, patch);
                  setEditingId(null);
                }}
              />
            )}

            {showAddModal && (
              <AddTransactionModal
                initial={form}
                onClose={() => setShowAddModal(false)}
                onSave={(vals) => handleAddSave(vals)}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function AddTransactionModal({
  initial,
  onClose,
  onSave,
}: {
  initial: { date: string; amount: string; kind: string; description: string };
  onClose: () => void;
  onSave: (vals: { date: string; amount: number; kind: string; description?: string }) => void;
}) {
  const [form, setForm] = useState(initial);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="card w-full max-w-md z-10 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add transaction</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost"><X size={16} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
          <input placeholder="amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input w-32" />
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="input w-44">
            <option value="owed">Given</option>
            <option value="owe">Taken</option>
          </select>
          <input placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input flex-1" />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button
            onClick={() => {
              const amount = parseFloat(form.amount || "0") || 0;
              onSave({ date: form.date, amount, kind: form.kind as any, description: form.description || undefined });
            }}
            className="btn btn-primary"
          >
            <Save size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTransaction({ tx, onCancel, onSave }: { tx: Transaction; onCancel: () => void; onSave: (patch: Partial<Transaction>) => void }) {
  const [form, setForm] = useState({ date: tx.date, amount: String(tx.amount), kind: tx.kind, description: tx.description || "" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="card w-full max-w-md z-10 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Edit transaction</h3>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn btn-ghost"><X size={16} /></button>
            <button onClick={() => onSave({ date: form.date, amount: parseFloat(form.amount || "0") || 0, kind: form.kind as any, description: form.description || undefined })} className="btn btn-primary"><Save size={16} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
          <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input w-32" />
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as any })} className="input w-44">
            <option value="owed">Given</option>
            <option value="owe">Taken</option>
          </select>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input flex-1" />
        </div>
      </div>
    </div>
  );
}
