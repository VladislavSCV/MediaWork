"use client";

import { useEffect, useState } from "react";


export default function InvoicesPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/portal/invoices`, {
      headers: { Authorization: localStorage.getItem("advertiser_token") || "" },
    })
      .then((r) => r.json())
      .then(setItems);
  }, []);

  async function pay(id: number) {
  const token = localStorage.getItem("advertiser_token") || "";

  await fetch(`/api/portal/invoices/${id}/pay`, {
    method: "POST",
    headers: { Authorization: token },
  });

  // обновляем таблицу
  const updated = await fetch("/api/portal/invoices", {
    headers: { Authorization: token },
  }).then((r) => r.json());

  setItems(updated);
}


  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Invoices</h1>

      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="opacity-60 text-sm">
          <tr>
            <th>#</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
        {items.map((inv) => (
            <tr
            key={inv.id}
            className="bg-[#11161d] hover:bg-[#141a22] border border-white/10 rounded-xl"
            >
            <td className="px-4 py-3">{inv.id}</td>
            <td className="px-4 py-3">{inv.amount} ₽</td>
            <td className="px-4 py-3">{inv.issued_at.slice(0, 10)}</td>

            <td className="px-4 py-3">
                {inv.status === "pending" ? (
                <button
                    onClick={() => pay(inv.id)}
                    className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
                >
                    Pay
                </button>
                ) : (
                <span className="text-green-400">Paid</span>
                )}
            </td>
            </tr>
        ))}
        </tbody>

      </table>
    </div>
  );
}
