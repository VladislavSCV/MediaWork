"use client";

import { useEffect, useState } from "react";
import PageGuard from "@/components/RoleGuard";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

export default function FacadeDetailsPage() {
  const router = useRouter();
  const { id } = useParams(); // <-- ВОТ ТАК ПРАВИЛЬНО
  const facadeId = Number(id); // теперь не NaN

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facadeId) return; // защиты от undefined

    apiFetch(`/facades/${facadeId}/status`)
      .then(setData)
      .catch((err) => console.error("Failed to load facade:", err))
      .finally(() => setLoading(false));
  }, [facadeId]);

  if (loading) {
    return <div className="p-8 text-slate-500 text-lg">Loading facade…</div>;
  }

  if (!data || !data.facade) {
    return <div className="p-8 text-red-600">Facade not found</div>;
  }

const f = data.facade;
const s = data.status || { is_online: false, status: "offline" };
const recent = data.recent_plays || [];

  const dot =
    s?.is_online
      ? "bg-emerald-500"
      : s?.status === "offline"
      ? "bg-red-500"
      : "bg-amber-500";


  return (
    <PageGuard allow="viewer">
      <div className="space-y-10 lg:space-y-12 select-none">

        {/* HEADER */}
        <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl relative">
          <div className="flex items-start justify-between gap-6">

            {/* LEFT */}
            <div>
              <button
                onClick={() => router.back()}
                className="text-[12px] text-slate-500 hover:text-slate-700 transition"
              >
                ← Back
              </button>

              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Facade
              </div>

              <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                {f.city || "Unknown"} · {f.address}
              </h1>

              <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] text-slate-600">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                {s.is_online ? "Online" : "Offline"}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white shadow-[0_12px_35px_rgba(15,23,42,0.6)] hover:bg-slate-800">
                Live view
              </button>

              <button className="rounded-xl bg-white/80 border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-white">
                Diagnostics
              </button>
            </div>
          </div>
        </section>

        {/* MAIN SHEET */}
        <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-7 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8">

          <div className="space-y-12">

            {/* OVERVIEW */}
            <div>
              <SectionHeader title="Overview" subtitle="General screen information" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <InfoTile label="Resolution" value={`${f.width_px} × ${f.height_px}`} />
                <InfoTile label="Uptime" value={s.avg_latency_ms ? "OK" : "—"} />
                <InfoTile label="Last seen" value={s.last_seen?.slice(0, 19) || "—"} />
                <InfoTile label="Location" value={`${f.latitude}, ${f.longitude}`} />
              </div>
            </div>

            {/* RECENT PLAY EVENTS */}
<div>
  <SectionHeader title="Recent play events" subtitle="Last campaigns displayed" />

  <div className="space-y-4">
    {recent.length === 0 && (
      <div className="text-[13px] text-slate-500">No play events yet.</div>
    )}

    {recent.map((p: any) => (
      <button
        key={p.id}
        onClick={() => router.push(`/portal/campaigns/${p.campaign_id}`)}
        className="w-full text-left rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)] hover:shadow-[0_22px_90px_rgba(15,23,42,0.25)] transition"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-slate-900">
              Campaign #{p.campaign_id}
            </div>
            <div className="text-[12px] text-slate-500">
              Played at {p.played_at}
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-700">
            {p.duration_sec}s
          </span>
        </div>
      </button>
    ))}
  </div>
</div>


            {/* TECH INFO */}
            <div>
              <SectionHeader title="Technical Info" subtitle="Device configuration" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoTile label="Screen ID" value={f.id} />
                <InfoTile label="Active" value={f.is_active ? "Yes" : "No"} />
                <InfoTile label="Status" value={s.is_online ? "Online" : "Offline"} />
              </div>
            </div>

          </div>
        </section>
      </div>
    </PageGuard>
  );
}

/* REUSABLE COMPONENTS */

function SectionHeader({ title, subtitle }: any) {
  return (
    <div className="mb-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className="text-[13px] text-slate-500">{subtitle}</div>
    </div>
  );
}

function InfoTile({ label, value }: any) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 inline-flex items-center rounded-xl px-3 py-1 text-[13px] font-semibold bg-slate-100 text-slate-700">
        {value}
      </div>
    </div>
  );
}
