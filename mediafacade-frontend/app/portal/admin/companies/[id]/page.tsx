"use client";

import { useParams } from "next/navigation";
import {
  UserGroupIcon,
  RectangleStackIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import PageGuard from "@/components/RoleGuard";

export default function CompanyPage() {
  const { id } = useParams();

  // В реальной версии - получаем по API GET /companies/:id
  const company = {
    id,
    name: id === "1" ? "MediaWork"
         : id === "2" ? "Shiftam"
         : id === "3" ? "AdSpace LTD"
         : "Company",
  };

  const [users, setUsers] = useState([
    { id: 1, name: "Vladislav", email: "vs@shiftam.com", role: "Admin" },
    { id: 2, name: "Kirill", email: "kirill@company.com", role: "Manager" },
    { id: 3, name: "Anna", email: "anna@company.com", role: "Viewer" },
  ]);

  const facades = [
    { id: 101, location: "Tverskaya 12", size: "12×6m", status: "Online" },
    { id: 102, location: "Arbat 44", size: "8×5m", status: "Offline" },
  ];

  const campaigns = [
    { id: 11, title: "Nike Summer 2025", status: "Running" },
    { id: 12, title: "Coca-Cola Holidays", status: "Scheduled" },
  ];

  return (
    <PageGuard allow="admin">
    <div className="space-y-10 lg:space-y-12">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <a
          href="/portal/admin"
          className="rounded-xl p-2 hover:bg-slate-100/70 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
        </a>

        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Company #{id}
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
            {company.name}
          </h1>
        </div>
      </div>

      {/* USERS */}
      <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_22px_90px_rgba(15,23,42,0.15)] backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-slate-700" />
          <h2 className="text-[18px] font-semibold">Users</h2>
        </div>

        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-slate-200 bg-white/70 p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-slate-800">{u.name}</div>
                <div className="text-[13px] text-slate-500">{u.email}</div>
              </div>

              <span className="text-[12px] px-3 py-1 rounded-lg bg-slate-800 text-white">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FACADES */}
      <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_22px_90px_rgba(15,23,42,0.15)] backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-2">
          <RectangleStackIcon className="h-5 w-5 text-slate-700" />
          <h2 className="text-[18px] font-semibold">Facades</h2>
        </div>

        <div className="space-y-3">
          {facades.map((f) => (
            <a
              key={f.id}
              href={`/portal/facades/${f.id}`}
              className="rounded-xl border border-slate-200 bg-white/70 p-4 flex justify-between items-center hover:bg-slate-100/60 transition"
            >
              <div>
                <div className="font-medium text-slate-800">{f.location}</div>
                <div className="text-[13px] text-slate-500">{f.size}</div>
              </div>

              <span
                className={`text-[12px] px-3 py-1 rounded-lg ${
                  f.status === "Online"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {f.status}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* CAMPAIGNS */}
      <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_22px_90px_rgba(15,23,42,0.15)] backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-slate-700" />
          <h2 className="text-[18px] font-semibold">Active Campaigns</h2>
        </div>

        <div className="space-y-3">
          {campaigns.map((c) => (
            <a
              key={c.id}
              href={`/portal/campaigns/${c.id}`}
              className="rounded-xl border border-slate-200 bg-white/70 p-4 flex justify-between items-center hover:bg-slate-100/60 transition"
            >
              <div className="font-medium text-slate-800">{c.title}</div>

              <span className="text-[12px] px-3 py-1 rounded-lg bg-blue-100 text-blue-600">
                {c.status}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
    </PageGuard>
  );
}
