"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CampaignsPage() {
  const [items, setItems] = useState<any[]>([]); // ✨ важное исправление: [] вместо null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log("CampaignsPage: loading campaigns...");
        const token = localStorage.getItem("advertiser_token") || "";

        const data = await fetch("http://localhost:8080/api/portal/campaigns", {
          headers: { Authorization: token },
        }).then((r) => r.json());

        console.log("CampaignsPage: received campaigns:", data);

        setItems(Array.isArray(data) ? data : []); // защита
      } catch (err) {
        console.error("CampaignsPage: failed to load campaigns:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="opacity-60">Loading...</div>;

  console.log("CampaignsPage: rendering campaigns:", items);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Campaigns</h1>
        <Link
          href="/portal/campaigns/create"
          className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700"
        >
          + Create Campaign
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-sm opacity-60 border-b border-white/10">
            <th className="p-3">Name</th>
            <th className="p-3">Status</th>
            <th className="p-3">Price</th>
            <th className="p-3">Dates</th>
            <th className="p-3 w-20"></th>
          </tr>
        </thead>

        <tbody>
          {/* если пусто */}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 opacity-60">
                No campaigns yet
              </td>
            </tr>
          )}

          {/* рендер списка */}
          {items.map((c) => (
            <tr
              key={c.id}
              className="bg-[#11161d] hover:bg-[#141a22] border border-white/10 rounded-xl"
            >
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.status}</td>
              <td className="p-3">{c.total_price} ₽</td>
              <td className="p-3">
                {c.start_at?.slice(0, 10)} → {c.end_at?.slice(0, 10)}
              </td>
              <td className="p-3 text-right">
                <Link
                  href={`/portal/campaigns/${c.id}`}
                  className="text-cyan-400 hover:underline"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
