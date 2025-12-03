"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageGuard from "@/components/RoleGuard";

type Facade = {
  id: number;
  city: string;
  address: string;
  status: "Online" | "Offline" | "Maintenance";
  resolution: string;
  campaigns: number;
  uptime: number;
};

export default function FacadesPage() {
  const router = useRouter();

  // TODO: заменить на данные из Go API
  const facades: Facade[] = [
    {
      id: 1,
      city: "Berlin",
      address: "Alexanderplatz Tower",
      status: "Online",
      resolution: "1920 × 1080",
      campaigns: 3,
      uptime: 99,
    },
    {
      id: 2,
      city: "Berlin",
      address: "Friedrichstrasse Center",
      status: "Maintenance",
      resolution: "1440 × 720",
      campaigns: 2,
      uptime: 87,
    },
    {
      id: 3,
      city: "Moscow",
      address: "Tverskaya Plaza",
      status: "Online",
      resolution: "2560 × 1440",
      campaigns: 4,
      uptime: 98,
    },
    {
      id: 4,
      city: "London",
      address: "Waterloo Station",
      status: "Offline",
      resolution: "1920 × 1080",
      campaigns: 0,
      uptime: 0,
    },
  ];

  const [filter, setFilter] = useState<
    "all" | "online" | "offline" | "maintenance" | "issues"
  >("all");

  const filtered = facades.filter((f) => {
    if (filter === "all") return true;
    if (filter === "online") return f.status === "Online";
    if (filter === "offline") return f.status === "Offline";
    if (filter === "maintenance") return f.status === "Maintenance";
    if (filter === "issues") return f.uptime < 90;
    return true;
  });

  return (
    <PageGuard allow="viewer">
    <div className="space-y-10 lg:space-y-12">
      {/* HEADER */}
      <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Facades
            </div>

            <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
              Your rented facades
            </h1>

            <p className="text-[13px] text-slate-500">
              All screens where your campaigns can run.
            </p>
          </div>

          <button className="rounded-xl bg-white/80 border border-slate-200 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow hover:bg-white">
            View map
          </button>
        </div>

        {/* FILTERS */}
        <div className="mt-6 inline-flex items-center rounded-2xl border border-slate-200/70 bg-white/80 p-1 shadow-[0_12px_40px_rgba(15,23,42,0.18)] text-[11px] pointer-events-auto">
          {[
            ["all", "All"],
            ["online", "Online"],
            ["offline", "Offline"],
            ["maintenance", "Maintenance"],
            ["issues", "Issues"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                filter === key
                  ? "bg-slate-900 text-white shadow-[0_10px_22px_rgba(15,23,42,0.5)]"
                  : "text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* LIST */}
      <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-7 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl pointer-events-auto">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <FacadeCard key={f.id} facade={f} onOpen={() => router.push(`/portal/facades/${f.id}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16 text-slate-500">
            No facades found for this filter.
          </div>
        )}
      </section>
    </div>
    </PageGuard>
  );
}

/* ———————————————————————————————————— COMPONENT ———————————————————————————————————— */

function FacadeCard({
  facade,
  onOpen,
}: {
  facade: {
    id: number;
    city: string;
    address: string;
    status: "Online" | "Offline" | "Maintenance";
    resolution: string;
    campaigns: number;
    uptime: number;
  };
  onOpen: () => void;
}) {
  const dot =
    facade.status === "Online"
      ? "bg-emerald-500"
      : facade.status === "Offline"
      ? "bg-red-500"
      : "bg-amber-500";

  const uptimeColor =
    facade.uptime >= 95
      ? "text-emerald-600"
      : facade.uptime >= 80
      ? "text-amber-600"
      : "text-red-600";

  return (
    <button
      onClick={onOpen}
      className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 text-left shadow-[0_20px_70px_rgba(15,23,42,0.2)] hover:shadow-[0_28px_95px_rgba(15,23,42,0.28)] transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14px] font-semibold text-slate-900">
            {facade.city} · {facade.address}
          </div>
          <div className="text-[11px] text-slate-500">LED Facade</div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] text-slate-600`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {facade.status}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <div className="text-[12px] font-mono text-slate-700">
          Resolution: {facade.resolution}
        </div>
        <div className="text-[12px] font-mono text-slate-700">
          Campaigns: {facade.campaigns}
        </div>
        <div className={`text-[12px] font-mono ${uptimeColor}`}>
          Uptime: {facade.uptime}%
        </div>
      </div>
    </button>
  );
}
