"use client";
import React, { useState } from "react";
import { Party } from "../lib/types";
import { UserPlus, User, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrencyShort } from "@/lib/utils";

type Props = {
  parties: Party[];
  consolidated: Map<string, number>;
  onSelect: (id: string | null) => void;
  onAdd: (name: string) => void;
  onDelete?: (id: string) => void;
};

export default function PartyList({ parties, consolidated, onSelect, onAdd, onDelete }: Props) {
  const [name, setName] = useState("");

  // compute totals for the summary
  const totalOwed = parties.reduce((sum, p) => sum + Math.max(0, consolidated.get(p.id) || 0), 0);
  const totalOwe = parties.reduce((sum, p) => sum + Math.max(0, -(consolidated.get(p.id) || 0)), 0);
  const net = totalOwed - totalOwe;
  const router = useRouter();

  const navigateToParty = (id: string | null) => {
    router.push(id ? `/transactions/?party=${id}` : "/");
  }

  return (
    <aside className="w-full p-2">

      {/* Totals summary */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="p-3 bg-dark rounded shadow text-center">
          <div className="text-sm small-muted">Total Owed</div>
          <div className="font-semibold">{formatCurrencyShort(totalOwed)}</div>
        </div>
        <div className="p-3 bg-dark rounded shadow text-center">
          <div className="text-sm small-muted">Total Owe</div>
          <div className="font-semibold">{formatCurrencyShort(totalOwe)}</div>
        </div>
        <div className={`p-3 rounded shadow text-center ${net >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}>
          <div className="text-sm ">Net</div>
          <div className="font-semibold">{formatCurrencyShort(net)}</div>
        </div>
      </div>

      <div className="card">
        <ul className="space-y-2">
          {parties.length === 0 && <li className="small-muted">No parties yet — add one below.</li>}

          {parties.map((p) => {
            const bal = consolidated.get(p.id) || 0;
            return (
              <li key={p.id} className="flex items-center justify-between py-2">
                <button className="flex items-center gap-3 text-left w-full" onClick={() => navigateToParty(p.id)}>
                  <div className="rounded-full bg-zinc-100 p-2">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className={`font-medium ${bal >= 0 ? "text-green-600" : "text-red-600"}`}>{bal >= 0 ? `+${formatCurrencyShort(bal)}` : `${formatCurrencyShort(bal)}`}</div>
                  </div>
                  <ChevronRight size={18} className="small-muted" />
                </button>

                {/* Delete button: only enabled when balance is exactly zero and onDelete is provided */}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (bal !== 0) return;
                      if (!confirm(`Delete party "${p.name}"? This action cannot be undone.`)) return;
                      onDelete(p.id);
                    }}
                    title={bal === 0 ? "Delete party" : "Cannot delete: non-zero balance"}
                    className={`ml-2 btn btn-ghost btn-sm ${bal !== 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={bal !== 0}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New party"
            className="input flex-1"
          />
          <button
            onClick={() => {
              if (!name.trim()) return;
              onAdd(name.trim());
              setName("");
            }}
            className="btn btn-primary"
          >
            Add
          </button>
        </div>
      </div>
    </aside>
  );
}
