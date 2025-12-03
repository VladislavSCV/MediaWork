"use client";

import PageGuard from "@/components/RoleGuard";
import { useRouter } from "next/navigation";

export default function FacadeDetailsPage({ params }: any) {
  const router = useRouter();
  const id = params.id;

  // TODO заменить на реальные данные из Go API
  const facade = {
    id,
    city: "Berlin",
    address: "Alexanderplatz Tower",
    status: "Online",
    resolution: "1920 × 1080",
    uptime: 98,
    campaigns: [
      {
        id: "cmp1",
        name: "Morning calm preset",
        time: "08:00–11:00",
      },
      {
        id: "cmp2",
        name: "Brand Loop #324",
        time: "11:00–18:00",
      },
      {
        id: "cmp3",
        name: "Evening skyline",
        time: "18:00–23:00",
      },
    ],
    activeCount: 3,
    lastSync: "32s ago",
    firmware: "v1.4.2",
    location: "52.5219° N, 13.4132° E",
  };

  const dot =
    facade.status === "Online"
      ? "bg-emerald-500"
      : facade.status === "Offline"
      ? "bg-red-500"
      : "bg-amber-500";

  return (
    <PageGuard allow="manager">
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
              {facade.city} · {facade.address}
            </h1>

            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] text-slate-600">
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              {facade.status}
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
              <InfoTile label="Resolution" value={facade.resolution} />
              <InfoTile label="Uptime" value={facade.uptime + "%"} tone="ok" />
              <InfoTile label="Active campaigns" value={facade.activeCount} />
              <InfoTile label="Last sync" value={facade.lastSync} />
            </div>
          </div>

          {/* TODAY SCHEDULE */}
          <div>
            <SectionHeader title="Today's Schedule" subtitle="Campaign lineup for today" />

            <div className="space-y-4">
              {facade.campaigns.map((cmp) => (
                <button
                  key={cmp.id}
                  onClick={() => router.push(`/portal/campaigns/${cmp.id}`)}
                  className="w-full text-left rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)] hover:shadow-[0_22px_90px_rgba(15,23,42,0.25)] transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-semibold text-slate-900">
                        {cmp.name}
                      </div>
                      <div className="text-[12px] text-slate-500">{cmp.time}</div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-700">
                      #{cmp.id}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* UPTIME CHART */}
          <div>
            <SectionHeader title="Uptime (7 days)" subtitle="Screen reliability overview" />
            <ChartSkeleton />
          </div>

          {/* TECH INFO */}
          <div>
            <SectionHeader title="Technical Info" subtitle="Device configuration" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Firmware" value={facade.firmware} />
              <InfoTile label="Location" value={facade.location} />
              <InfoTile label="Screen ID" value={facade.id} />
            </div>
          </div>

        </div>
      </section>
    </div>
    </PageGuard>
  );
}

/* ————————————— COMPONENTS ————————————— */

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

function InfoTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: any;
  tone?: "ok" | "warn" | "bad";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700"
      : tone === "bad"
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>

      <div
        className={[
          "mt-2 inline-flex items-center rounded-xl px-3 py-1 text-[13px] font-semibold",
          toneClass,
        ].join(" ")}
      >
        {value}
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
        {[82, 60, 94, 72, 98, 85, 91].map((h, i) => (
          <div key={i} className="flex-1 rounded-full bg-slate-200 relative" style={{ height: "90px" }}>
            <div
              className="absolute bottom-0 inset-x-0 rounded-full bg-slate-900 shadow-[0_8px_25px_rgba(15,23,42,0.5)]"
              style={{ height: `${h}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
