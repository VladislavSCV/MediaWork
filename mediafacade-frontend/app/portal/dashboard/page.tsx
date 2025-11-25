"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [chart, setChart] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("advertiser_token") || "";

      const s = await fetch("/api/portal/stats", {
        headers: { Authorization: token },
      }).then((r) => r.json());

      const c = await fetch("/api/portal/stats/chart", {
        headers: { Authorization: token },
      }).then((r) => r.json());

      setStats(s);
      setChart(c);
    }
    load();
  }, []);

  if (!stats) return <div className="opacity-60">Loading...</div>;

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#11161d] border border-white/10 rounded-xl">
          <div className="text-sm opacity-70">Active Campaigns</div>
          <div className="text-3xl mt-2">{stats.active_campaigns}</div>
        </div>

        <div className="p-6 bg-[#11161d] border border-white/10 rounded-xl">
          <div className="text-sm opacity-70">Pending Invoices</div>
          <div className="text-3xl mt-2">{stats.pending_invoices}</div>
        </div>

        <div className="p-6 bg-[#11161d] border border-white/10 rounded-xl">
          <div className="text-sm opacity-70">Total Spent</div>
          <div className="text-3xl mt-2">{stats.total_spent} ₽</div>
        </div>
      </div>

      {/* GRAPH: PLAYBACK EVENTS */}
      <div className="bg-[#11161d] border border-white/10 p-6 rounded-xl">
        <h2 className="text-xl mb-4">Playbacks (last 7 days)</h2>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <Line type="monotone" dataKey="events" stroke="#00eaff" strokeWidth={2} />
              <CartesianGrid stroke="#333" strokeDasharray="5 5" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRAPH: MONEY SPENT */}
      <div className="bg-[#11161d] border border-white/10 p-6 rounded-xl">
        <h2 className="text-xl mb-4">Money Spent</h2>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid stroke="#333" strokeDasharray="5 5" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="spent" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
