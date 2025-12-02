export type Transaction = {
  id: string;
  partyId: string;
  date: string; // ISO date
  amount: number; // always positive
  kind: "owed" | "owe"; // "owed" = party owes user; "owe" = user owes party
  description?: string;
};

export type Party = {
  id: string;
  name: string;
};
