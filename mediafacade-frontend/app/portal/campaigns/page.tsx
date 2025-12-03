// app/portal/campaigns/page.tsx
"use client";

import PageGuard from "@/components/RoleGuard";
import { useState } from "react";

type UserRole =
  | "superadmin"
  | "orgadmin"
  | "manager"
  | "buyer"
  | "analyst"
  | "tech"
  | "viewer";

export default function CampaignsPage() {
  const role: UserRole = "orgadmin"; // TODO: заменить на реальную роль

  const [filter, setFilter] = useState<"all" | "active" | "scheduled" | "finished">("all");

  const campaigns = [
    {
      id: "cmp1",
      name: "Evening brand loop",
      facades: 3,
      city: "Berlin",
      status: "active",
      impressions: "12 430 today",
      date: "1–12 Dec",
      preview: "/window.svg",
    },
    {
      id: "cmp2",
      name: "Night skyline animation",
      facades: 2,
      city: "Moscow",
      status: "active",
      impressions: "8 912 today",
      date: "5–20 Dec",
      preview: "/next.svg",
    },
    {
      id: "cmp3",
      name: "Morning calm preset",
      facades: 4,
      city: "London",
      status: "scheduled",
      impressions: "Starts tomorrow",
      date: "7–14 Dec",
      preview: "/globe.svg",
    },
    {
      id: "cmp4",
      name: "Summer event drop",
      facades: 5,
      city: "Tokyo",
      status: "finished",
      impressions: "Completed",
      date: "22–28 Nov",
      preview: "/vercel.svg",
    },
  ];

  const visibleCampaigns =
    filter === "all"
      ? campaigns
      : campaigns.filter((cmp) => cmp.status === filter);

  const canCreate = ["superadmin", "orgadmin", "manager", "buyer"].includes(role);

  return (
    <PageGuard allow="viewer">
    <div className="space-y-8 lg:space-y-10">
      {/* HEADER */}
      <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 lg:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Campaigns
            </div>
            <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-slate-900 lg:text-[24px]">
              Manage your media campaigns
            </h1>
            <p className="text-[13px] text-slate-500">
              All advertising loops running on your rented facades.
            </p>
          </div>

          {canCreate && (
            <button className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.22)] hover:bg-white">
              New campaign
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="mt-6 inline-flex items-center rounded-2xl border border-slate-200/70 bg-white/80 p-1 shadow-[0_12px_40px_rgba(15,23,42,0.18)] text-[11px]">
          {["all", "active", "scheduled", "finished"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                filter === key
                  ? "bg-slate-900 text-white shadow-[0_10px_22px_rgba(15,23,42,0.5)]"
                  : "text-slate-600"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      {/* CAMPAIGN LIST */}
      <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-6 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 lg:py-7">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCampaigns.map((cmp) => (
            <CampaignCard key={cmp.id} {...cmp} canOpenDetails />
          ))}
        </div>

        {visibleCampaigns.length === 0 && (
          <div className="flex items-center justify-center py-16 text-slate-500">
            No campaigns in this category.
          </div>
        )}
      </section>
    </div>
    </PageGuard>
  );
}

/* COMPONENT: CAMPAIGN CARD */
function CampaignCard(props: {
  id: string;
  name: string;
  facades: number;
  city: string;
  status: string;
  impressions: string;
  date: string;
  preview: string;
  canOpenDetails?: boolean;
}) {
  const statusColor =
    props.status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : props.status === "scheduled"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-200 text-slate-700";

  return (
    <div className="group rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.2)] hover:shadow-[0_28px_95px_rgba(15,23,42,0.28)] transition">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor}`}
        >
          {props.status}
        </span>

        {props.canOpenDetails && (
          <button className="rounded-xl bg-white/70 px-2 py-1 text-[11px] text-slate-600 shadow">
            Details
          </button>
        )}
      </div>

      {/* Preview */}
      <div className="relative mb-3 h-32 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100">
        <img
          src={props.preview}
          className="h-full w-full object-contain opacity-70"
        />
      </div>

      <div className="space-y-1.5">
        <div className="text-[14px] font-semibold text-slate-900">
          {props.name}
        </div>
        <div className="text-[12px] text-slate-600">
          {props.facades} facades · {props.city}
        </div>
        <div className="text-[11px] text-slate-500">{props.date}</div>
        <div className="text-[12px] font-mono text-slate-700">{props.impressions}</div>
      </div>

      <button className="mt-3 w-full rounded-xl bg-slate-900 py-1.5 text-[12px] font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)] group-hover:bg-slate-800">
        Manage
      </button>
    </div>
  );
}
