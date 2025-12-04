"use client";

import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CampaignDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const campaignId = Number(id);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ========================
  // LOAD REAL DATA
  // ========================
  useEffect(() => {
    if (!campaignId) return;

    apiFetch(`/campaigns/${campaignId}`)
      .then(setData)
      .catch((err) => console.error("Failed to load campaign:", err))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return <div className="p-8 text-slate-500 text-lg">Loading campaign…</div>;
  }

  if (!data || !data.campaign) {
    return <div className="p-8 text-red-600">Campaign not found</div>;
  }

  const c = data.campaign;
  const facades = c.facades || [];
  const slots = data.slots || [];

  const isActive = c.status === "active";
  const isScheduled = c.status === "scheduled";
  const isFinished = c.status === "finished";

  const dateRange =
    c.start_time && c.end_time
      ? `${c.start_time.slice(0, 10)} → ${c.end_time.slice(0, 10)}`
      : "—";

  return (
    <PageGuard allow="viewer">
      <div className="space-y-8 lg:space-y-10 select-none">

        {/* HEADER */}
        <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgба(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 lg:py-7 relative">
          <div className="pointer-events-auto relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <button
                onClick={() => router.back()}
                className="text-[12px] text-slate-500 hover:text-slate-700 transition"
              >
                ← Back
              </button>

              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Campaign
              </div>

              <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                {c.name}
              </h1>

              <p className="text-[13px] text-slate-500">
                Showing performance, facades, scheduling & spend.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-3 pointer-events-auto z-20">
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white shadow-[0_12px_35px_rgба(15,23,42,0.6)] hover:bg-slate-800">
                Edit campaign
              </button>

              {isActive && (
                <button className="rounded-xl bg-red-600 px-4 py-2 text-[12px] font-semibold text-white shadow-[0_12px_35px_rgба(220,20,60,0.5)] hover:bg-red-500">
                  Stop
                </button>
              )}

              {isScheduled && (
                <button className="rounded-xl bg-amber-500 px-4 py-2 text-[12px] font-semibold text-white shadow-[0_12px_35px_rgба(255,200,0,0.5)] hover:bg-amber-400">
                  Start now
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MAIN */}
        <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-7 shadow-[0_30px_110px_rgба(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 pointer-events-auto">

          <div className="space-y-8">

            {/* STATUS BLOCKS */}
            <div className="grid gap-6 md:grid-cols-3">
              <InfoCard
                label="Status"
                value={
                  isActive
                    ? "Active"
                    : isFinished
                    ? "Finished"
                    : isScheduled
                    ? "Scheduled"
                    : c.status
                }
                tone={
                  isActive ? "ok" : isFinished ? "off" : isScheduled ? "warn" : undefined
                }
              />

              <InfoCard label="Date range" value={dateRange} />
              <InfoCard label="Priority" value={String(c.priority)} />
            </div>

            {/* PERFORMANCE GRAPH */}
            <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/70 p-4 shadow-[0_22px_80px_rgба(15,23,42,0.18)]">
              <div className="mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Performance (mock)
                </div>
                <div className="text-[13px] text-slate-500">
                  Impressions · playtime
                </div>
              </div>

              <ChartSkeleton />
            </div>

            {/* FACADES */}
            <div>
              <div className="mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Facades
                </div>
                <div className="text-[13px] text-slate-500">
                  Campaign runs on {facades.length} facade(s)
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {facades.map((f: any, i: number) => (
                  <FacadeCard
                    key={i}
                    city={f.city || "—"}
                    spot={f.address || "—"}
                    status={f.status === "online" ? "Online" : "Offline"}
                  />
                ))}
              </div>
            </div>

            {/* SLOTS */}
            <div>
              <div className="mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Schedule slots
                </div>
                <div className="text-[13px] text-slate-500">
                  {slots.length} time slots configured
                </div>
              </div>

              <div className="space-y-3">
                {slots.map((s: any) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-200 bg-white/80 p-3 text-[13px] shadow"
                  >
                    <b>Day:</b> {s.day_of_week} ·{" "}
                    <b>{s.start_time}</b> → <b>{s.end_time}</b>
                  </div>
                ))}

                {slots.length === 0 && (
                  <div className="text-[13px] text-slate-500">
                    No scheduling configured.
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

      </div>
    </PageGuard>
  );
}

/* ————— COMPONENTS ————— */

function InfoCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "off";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "bg-amber-50 text-amber-600"
      : tone === "off"
      ? "bg-slate-200 text-slate-600"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-4 py-4 shadow-[0_18px_70px_rgба(15,23,42,0.18)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div
        className={`mt-2 inline-flex items-center rounded-xl px-3 py-1 text-[13px] font-semibold ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function FacadeCard({
  city,
  spot,
  status,
}: {
  city: string;
  spot: string;
  status: string;
}) {
  const dot = status === "Online" ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/85 p-4 shadow-[0_20px_70px_rgба(15,23,42,0.18)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14px] font-semibold text-slate-900">
            {city} · {spot}
          </div>
          <div className="text-[11px] text-slate-500">LED facade</div>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] text-slate-600">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {status}
        </span>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-3 pointer-events-none">
        {[62, 44, 78, 52, 91, 67, 58].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-slate-200 relative"
            style={{ height: "90px" }}
          >
            <div
              className="absolute bottom-0 inset-x-0 rounded-full bg-slate-900 shadow-[0_8px_25px_rgба(15,23,42,0.5)]"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
