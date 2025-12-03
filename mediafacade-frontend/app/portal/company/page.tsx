"use client";

import {
  UserGroupIcon,
  BuildingOffice2Icon,
  RectangleStackIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function CompanyPage() {
  // В реальной версии — загружаем по токену текущего пользователя
  const company = {
    id: 1,
    name: "MediaWork",
    domain: "mediawork.io",
    created: "2024-11-12",
    plan: "Business",
  };

  const users = [
    { id: 1, name: "Vladislav", email: "vs@mediawork.io", role: "Admin" },
    { id: 2, name: "Kirill", email: "kirill@mediawork.io", role: "Manager" },
    { id: 3, name: "Anna", email: "anna@mediawork.io", role: "Viewer" },
  ];

  const facades = [
    { id: 101, name: "Tverskaya 12", size: "12×6m", status: "Online" },
    { id: 102, name: "Arbat 44", size: "8×5m", status: "Online" },
  ];

  const campaigns = [
    { id: 1, title: "Nike Summer 2025", status: "Running" },
    { id: 2, title: "Adidas Winter 2025", status: "Scheduled" },
  ];

  return (
    <div className="space-y-10 lg:space-y-12 select-none">

      {/* HEADER */}
      <section className="rounded-[32px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Your Company
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
            {company.name}
          </h1>

          <p className="mt-1 text-[13px] text-slate-500">
            View company details, users, active campaigns and facades.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* COMPANY CARD */}
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <BuildingOffice2Icon className="h-6 w-6 text-slate-700" />
            <h2 className="text-[18px] font-semibold">Company Info</h2>
          </div>

          <div className="space-y-2 text-[14px] text-slate-600">
            <div><span className="font-medium text-slate-800">Domain:</span> {company.domain}</div>
            <div><span className="font-medium text-slate-800">Created:</span> {company.created}</div>
            <div><span className="font-medium text-slate-800">Plan:</span> {company.plan}</div>
          </div>
        </div>

        {/* USERS */}
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-slate-700" />
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

                <span className="text-[12px] px-3 py-1 rounded-lg bg-slate-900 text-white">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FACADES */}
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <RectangleStackIcon className="h-6 w-6 text-slate-700" />
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
                  <div className="font-medium text-slate-800">{f.name}</div>
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
        </div>

        {/* CAMPAIGNS */}
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-6 w-6 text-slate-700" />
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
        </div>

      </section>
    </div>
  );
}
