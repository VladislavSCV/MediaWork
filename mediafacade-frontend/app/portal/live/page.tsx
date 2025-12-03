"use client";

import { useState } from "react";
import RealFacadeWall from "@/components/RealFacadeWall";
import PageGuard from "@/components/RoleGuard";

export default function LivePage() {
  const [facadeId, setFacadeId] = useState(1);

  const facades = [
    { id: 1, name: "Berlin · Alexanderplatz", src: "/video.mp4" },
    { id: 2, name: "Berlin · Friedrichstrasse", src: "/video2.mp4" },
    { id: 3, name: "Moscow · Tverskaya Plaza", src: "/video3.mp4" },
    { id: 4, name: "London · Waterloo Station", src: "/video4.mp4" },
  ];

  const facade = facades.find((f) => f.id === facadeId)!;

  return (
    <PageGuard allow="manager">
    <div className="space-y-10 lg:space-y-12 select-none">

      {/* HEADER */}
      <section className="rounded-[32px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Live Monitor
            </div>
            <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
              Real-time facade view
            </h1>
            <p className="text-[13px] text-slate-500">
              True-to-life LED panel simulation with realtime playback.
            </p>
          </div>

          <select
            value={facadeId}
            onChange={(e) => setFacadeId(Number(e.target.value))}
            className="rounded-xl border border-slate-300 bg-white/80 px-4 py-2 text-[13px] shadow focus:outline-none"
          >
            {facades.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* MAIN BLOCK */}
      <section className="rounded-[36px] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_32px_120px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:px-8">

        {/* GRID: facade left, stats right */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* LED WALL */}
          <div className="relative w-full">
            <div className="rounded-[32px] bg-slate-900 shadow-[0_40px_160px_rgba(0,0,0,0.35)] overflow-hidden p-4">
              <div className="rounded-[24px] overflow-hidden border border-black/40 shadow-[0_10px_60px_rgba(0,0,0,0.4)]">
                <RealFacadeWall src={facade.src} rows={6} cols={12} />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            <StatTile label="Status" value="Online" tone="ok" />
            <StatTile label="FPS" value="60" />
            <StatTile label="Sync Delay" value="41 ms" />
            <StatTile label="Last Update" value="9s ago" />
            <StatTile label="Temperature" value="46°C" />
          </div>
        </div>

        {/* LIVE EVENTS */}
        <div className="mt-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">
            Events
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white/90 shadow-[0_16px_70px_rgba(15,23,42,0.18)] h-56 overflow-y-auto text-[12px] font-mono text-slate-700 p-4 space-y-1">
            <Event time="19:36" text="Content sync OK" />
            <Event time="19:35" text="Reconnected to WS" />
            <Event time="19:35" text="FPS stabilized: 59.97" />
            <Event time="19:34" text="Loaded creative brand_loop_v3.mp4" />
            <Event time="19:33" text="Sync delay normalized" />
          </div>
        </div>
      </section>
    </div>
    </PageGuard>
  );
}

/* ------------- COMPONENTS ------------- */

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700"
      : tone === "bad"
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-3 shadow-[0_16px_70px_rgba(15,23,42,0.18)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className={`mt-2 px-3 py-1 rounded-xl text-[13px] font-semibold inline-flex ${cls}`}>
        {value}
      </div>
    </div>
  );
}

function Event({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-slate-400">{time}</span>
      <span>{text}</span>
    </div>
  );
}
