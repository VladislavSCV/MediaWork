"use client";

import { useState } from "react";
// Подстрой путь импорта под свой проект
// import FacadeWall from "./FacadeWall";

type ScreenId = "dashboard" | "campaigns" | "invoices" | "profile";

const NAV_ITEMS: { id: ScreenId; label: string; icon: JSX.Element }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        <rect x="2" y="2" width="7" height="7" rx="2" />
        <rect x="11" y="2" width="7" height="5" rx="2" />
        <rect x="11" y="9" width="7" height="9" rx="2" />
        <rect x="2" y="11" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        <path d="M3 4h14v3H3z" />
        <path d="M3 9h10v3H3z" />
        <path d="M3 14h7v3H3z" />
      </svg>
    ),
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        <path d="M5 2h8l4 4v12H5z" />
        <path d="M9 8h4M9 11h4M9 14h2" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 16c1.2-2.4 3.3-3.8 6-3.8s4.8 1.4 6 3.8" />
      </svg>
    ),
  },
];

export default function MediaFacadeLayout() {
  const [active, setActive] = useState<ScreenId>("dashboard");

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-[#f5f7fa] to-[#e5edf5] text-slate-900">
      {/* Атмосферный фон: сетка + блюры */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Мягкая сетка */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.5) 1px, transparent 0)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Размытые пятна */}
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute top-24 -right-10 h-80 w-80 rounded-full bg-slate-200/80 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-sky-100/80 blur-3xl" />
      </div>

      {/* Основная сетка */}
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-8 lg:py-8">
        {/* Sidebar */}
        <aside className="flex w-64 flex-col gap-6">
          <div className="rounded-[30px] border border-white/70 bg-white/70 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.35)]">
                MF
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Media facade
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  Control Studio
                </span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                      "hover:bg-white/80 hover:shadow-[0_14px_40px_rgba(15,23,42,0.18)] hover:-translate-y-[1px]",
                      isActive
                        ? "bg-white shadow-[0_18px_55px_rgba(15,23,42,0.22)] text-slate-900"
                        : "bg-white/40 text-slate-500",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-xl border text-[11px] transition-all",
                        isActive
                          ? "border-slate-900/10 bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.5)]"
                          : "border-slate-300/60 bg-white/80 text-slate-500 group-hover:border-slate-400/80",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Facade Cluster
                </span>
                <span className="text-xs text-slate-500">
                  12 facades · 4 cities
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2.5 text-xs shadow-[0_10px_35px_rgba(15,23,42,0.12)]">
                <span className="text-slate-500">Live sync</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  OK
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Правая часть: topbar + main sheet */}
        <main className="flex flex-1 flex-col gap-4 lg:gap-6">
          {/* Topbar — стекло */}
          <header className="flex items-center justify-between rounded-[26px] border border-white/70 bg-white/70 px-5 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {activeLabel(active)}
                </span>
                <span className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
                  {titleFor(active)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-3 py-1.5 text-[11px] font-mono text-slate-500 shadow-[0_14px_40px_rgba(15,23,42,0.12)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Cluster: EU-1 · 16:9 · 60fps</span>
              </div>

              <button className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-2.5 py-1.5 text-xs shadow-[0_10px_32px_rgba(15,23,42,0.15)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                  VS
                </div>
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-[11px] font-semibold text-slate-900">
                    Vladislav
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Admin · Studio
                  </span>
                </div>
              </button>
            </div>
          </header>

          {/* Main sheet */}
          <section className="relative flex-1 rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl">
            {/* Внутренний мягкий градиент */}
            <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/80 via-white/60 to-slate-50/60" />

            <div className="relative flex h-full flex-col gap-6 px-6 pb-6 pt-5 lg:px-8 lg:pb-8 lg:pt-6">
              {/* Верхняя строка контента: контекст + быстрые фильтры */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {subtitleFor(active)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {descriptionFor(active)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs text-slate-600 shadow-[0_10px_32px_rgba(15,23,42,0.12)]">
                    Today
                  </button>
                  <button className="rounded-2xl border border-transparent bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-[0_12px_36px_rgba(15,23,42,0.55)]">
                    New {primaryActionFor(active)}
                  </button>
                </div>
              </div>

              {/* Основной контент по экрану */}
              <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                {/* Левая часть */}
                <div className="flex flex-col gap-4 lg:gap-5">
                  {active === "dashboard" && <DashboardScreen />}
                  {active === "campaigns" && <CampaignsScreen />}
                  {active === "invoices" && <InvoicesScreen />}
                  {active === "profile" && <ProfileScreen />}
                </div>

                {/* Правая колонка: контекстная / secondary */}
                <div className="flex flex-col gap-4 lg:gap-5">
                  {active === "dashboard" && <DashboardSecondary />}
                  {active === "campaigns" && <CampaignsSecondary />}
                  {active === "invoices" && <InvoicesSecondary />}
                  {active === "profile" && <ProfileSecondary />}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ───────────────────── Тексты для topbar/лейблов ───────────────────── */

function activeLabel(id: ScreenId) {
  switch (id) {
    case "dashboard":
      return "Overview";
    case "campaigns":
      return "Campaigns";
    case "invoices":
      return "Billing";
    case "profile":
      return "Account";
  }
}

function titleFor(id: ScreenId) {
  switch (id) {
    case "dashboard":
      return "Media facade control";
    case "campaigns":
      return "Campaign orchestration";
    case "invoices":
      return "Invoices & settlement";
    case "profile":
      return "Profile & workspace";
  }
}

function subtitleFor(id: ScreenId) {
  switch (id) {
    case "dashboard":
      return "Live status · Sync · Health";
    case "campaigns":
      return "Schedules · Playlists · Slots";
    case "invoices":
      return "Documents · Status · Payment";
    case "profile":
      return "Identity · Security · Workspace";
  }
}

function descriptionFor(id: ScreenId) {
  switch (id) {
    case "dashboard":
      return "Quiet, real-time overview of all facades and campaigns in one place.";
    case "campaigns":
      return "Design, schedule and sync media-facade campaigns with minute-level precision.";
    case "invoices":
      return "Track invoices, match playtime to billing and keep everything reconciled.";
    case "profile":
      return "Control who you are in the system, how you sign in and what you see.";
  }
}

function primaryActionFor(id: ScreenId) {
  switch (id) {
    case "dashboard":
      return "facade";
    case "campaigns":
      return "campaign";
    case "invoices":
      return "invoice";
    case "profile":
      return "member";
  }
}

/* ───────────────────── Экран: DASHBOARD ───────────────────── */

function DashboardScreen() {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* Здесь можно вставить твой FacadeWall */}
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.16)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Primary facade
            </span>
            <span className="text-sm font-medium text-slate-900">
              Moscow · Tverskaya 21 · 16:9
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-mono text-emerald-600">
            ONLINE · 14.2 ms
          </span>
        </div>

        {/* В реальном проекте раскомментируй: */}
        {/* <FacadeWall facadeId={101} /> */}

        {/* Пока заглушка, чтобы не ломалось без FacadeWall */}
        <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="absolute inset-6 rounded-[20px] border border-white/70 bg-white/40 shadow-[0_18px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl" />
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-70">
            {Array.from({ length: 72 }).map((_, i) => (
              <div
                key={i}
                className="border border-white/40 bg-gradient-to-br from-white/10 to-slate-100/40"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/12 via-transparent to-white/40" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-1.5 text-[11px] font-mono text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.4)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            STREAM · 00:14:32
          </div>
        </div>
      </div>

      {/* Быстрые метрики */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard label="Active facades" value="12" hint="+2 this week" />
        <MetricCard label="Live campaigns" value="27" hint="4 finishing today" />
        <MetricCard
          label="Sync health"
          value="99.4%"
          hint="Across all clusters"
        />
      </div>
    </div>
  );
}

function DashboardSecondary() {
  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.16)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Upcoming switchovers
        </span>
        <div className="mt-3 space-y-3 text-sm">
          {[
            {
              time: "Today · 18:00",
              title: "Evening brand loop",
              place: "Berlin · Alexanderplatz",
            },
            {
              time: "Today · 21:30",
              title: "Night skyline animation",
              place: "Moscow · City Towers",
            },
            {
              time: "Tomorrow · 07:00",
              title: "Morning calm preset",
              place: "London · Piccadilly",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start justify-between rounded-2xl bg-slate-50/70 px-3 py-2.5"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-slate-500">
                  {item.time}
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-500">{item.place}</span>
              </div>
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.16)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Cluster load
        </span>
        <div className="mt-3 space-y-3 text-sm">
          {[
            { cluster: "EU-1", load: "64%" },
            { cluster: "EU-2", load: "41%" },
            { cluster: "APAC-1", load: "78%" },
          ].map((c) => (
            <div key={c.cluster} className="flex items-center gap-3">
              <div className="w-16 text-[11px] font-mono text-slate-500">
                {c.cluster}
              </div>
              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-900"
                  style={{ width: c.load }}
                />
              </div>
              <div className="w-10 text-right text-[11px] font-mono text-slate-600">
                {c.load}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Экран: CAMPAIGNS ───────────────────── */

function CampaignsScreen() {
  const campaigns = [
    {
      name: "Morning calm preset",
      status: "Scheduled",
      period: "Mon–Fri · 06:00–09:00",
      facades: "7 facades",
    },
    {
      name: "City lights brand loop",
      status: "Live",
      period: "Daily · 18:00–23:30",
      facades: "9 facades",
    },
    {
      name: "Weekend art takeover",
      status: "Draft",
      period: "Sat–Sun · 12:00–22:00",
      facades: "4 facades",
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Campaign timeline
          </span>
          <span className="text-[11px] text-slate-500">Local time</span>
        </div>
        <div className="h-32 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50">
          {/* Тут можно нарисовать настоящий timeline позже */}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Campaigns
          </span>
          <span className="text-[11px] text-slate-500">
            27 total · 3 highlighted
          </span>
        </div>
        <div className="space-y-2.5 text-sm">
          {campaigns.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {c.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {c.period} · {c.facades}
                </span>
              </div>
              <span className={badgeClassForStatus(c.status)}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CampaignsSecondary() {
  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Target facades
        </span>
        <div className="mt-3 space-y-2.5 text-sm">
          {[
            { name: "Moscow · City Towers", slots: "5 slots", fill: "92%" },
            { name: "Berlin · Alexanderplatz", slots: "3 slots", fill: "76%" },
            { name: "London · Piccadilly", slots: "4 slots", fill: "81%" },
          ].map((f) => (
            <div
              key={f.name}
              className="flex flex-col rounded-2xl bg-slate-50/80 px-3 py-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {f.name}
                </span>
                <span className="text-[11px] text-slate-500">{f.slots}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-900"
                  style={{ width: f.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Recent edits
        </span>
        <div className="mt-3 space-y-2 text-[11px] text-slate-600">
          <p>09:14 — “Evening art loop” brightness adjusted · +8%</p>
          <p>08:52 — “Night skyline” color temperature set to 6800K</p>
          <p>Yesterday — “Brand takeover” logo safe-area updated</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Экран: INVOICES ───────────────────── */

function InvoicesScreen() {
  const invoices = [
    {
      id: "#MF-2043",
      client: "Aurora Retail Group",
      amount: "₽ 1 240 000",
      period: "Oct 2025",
      status: "Pending",
    },
    {
      id: "#MF-2042",
      client: "Skyline Media",
      amount: "₽ 890 000",
      period: "Oct 2025",
      status: "Paid",
    },
    {
      id: "#MF-2041",
      client: "Nordic Brand Studio",
      amount: "₽ 620 000",
      period: "Sep 2025",
      status: "Paid",
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Invoice list
          </span>
          <span className="text-[11px] text-slate-500">
            Reconciled with playtime logs
          </span>
        </div>
        <div className="space-y-2.5 text-sm">
          {invoices.map((i) => (
            <div
              key={i.id}
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <span className="font-mono text-[11px] text-slate-500">
                {i.id}
              </span>
              <span className="truncate text-sm font-medium text-slate-900">
                {i.client}
              </span>
              <span className="text-sm text-slate-900">{i.amount}</span>
              <span className="text-[11px] text-slate-500">{i.period}</span>
              <span className={badgeClassForStatus(i.status)}>{i.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard label="This month" value="₽ 3.4M" hint="Projected" />
        <MetricCard label="Collected" value="₽ 2.7M" hint="79% paid" />
        <MetricCard label="Overdue" value="₽ 0.18M" hint="2 clients" />
      </div>
    </div>
  );
}

function InvoicesSecondary() {
  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Reconciliation
        </span>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-[11px] text-slate-600">
            Campaign playtime · spot count · CPM rates are already matched to
            invoices.
          </p>
          <div className="mt-3 space-y-2 text-[11px] text-slate-600">
            <p>· 98.7% of spots matched automatically</p>
            <p>· 3 unresolved playtime anomalies</p>
            <p>· 1 manual adjustment awaiting approval</p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Export
        </span>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-[11px] text-slate-600">
            Export clean billing data directly into your accounting stack.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {["CSV", "XLSX", "XML", "API"].map((fmt) => (
              <span
                key={fmt}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Экран: PROFILE ───────────────────── */

function ProfileScreen() {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.6)]">
            VS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              Vladislav
            </span>
            <span className="text-[11px] text-slate-500">
              Owner · Media facade studio
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <DetailField label="Email" value="vs@shiftam.com" />
          <DetailField label="Workspace" value="MediaWork / Facades" />
          <DetailField label="Role" value="Administrator" />
          <DetailField label="Time zone" value="Europe/Moscow" />
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Security
        </span>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <DetailField label="2FA" value="Enabled · TOTP" />
          <DetailField label="Last sign-in" value="Today · 09:14 · Moscow" />
          <DetailField label="Devices" value="3 trusted devices" />
          <DetailField label="API tokens" value="2 active tokens" />
        </div>
      </div>
    </div>
  );
}

function ProfileSecondary() {
  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace preferences
        </span>
        <div className="mt-3 space-y-2 text-sm">
          <DetailField label="Language" value="English · Russian" />
          <DetailField label="Units" value="Metric · 24h time" />
          <DetailField label="Theme" value="Light · Glass surfaces" />
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Quiet mode
        </span>
        <p className="mt-3 text-[11px] text-slate-600">
          Keep notifications and surface noise minimal while you are adjusting
          campaigns. Only important alerts will appear.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────── Общие мелкие компоненты ───────────────────── */

function MetricCard(props: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-[0_14px_45px_rgba(15,23,42,0.14)]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {props.label}
      </span>
      <div className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-slate-900">
        {props.value}
      </div>
      <div className="text-[11px] text-slate-500">{props.hint}</div>
    </div>
  );
}

function DetailField(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {props.label}
      </span>
      <span className="text-sm text-slate-900">{props.value}</span>
    </div>
  );
}

function badgeClassForStatus(status: string) {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold";
  if (status === "Live" || status === "Paid")
    return base + " bg-emerald-50 text-emerald-600";
  if (status === "Scheduled" || status === "Pending")
    return base + " bg-slate-100 text-slate-700";
  if (status === "Draft") return base + " bg-slate-50 text-slate-500";
  return base + " bg-slate-100 text-slate-700";
}
