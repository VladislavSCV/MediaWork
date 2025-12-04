"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";

type ScreenId = "dashboard" | "campaigns" | "invoices" | "profile";

/* ───────────────────── Типы из бэка ───────────────────── */

type UserProfile = {
  id: number;
  email: string;
  full_name: string;
  name?: string;
  role: string;
  created_at: string;
};

type Facade = {
  id: number;
  code: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  width_px: number;
  height_px: number;
  rows: number;
  cols: number;
  status: string; // "online" | "offline" | "degraded" и т.п.
  last_seen?: string | null;
};

type Campaign = {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  start_time?: string | null;
  end_time?: string | null;
  status: string; // "draft" | "scheduled" | "live" | ...
  priority: number;
  created_at: string;
};

type Invoice = {
  id: number;
  company_id: number;
  invoice_number: string;
  period_start: string;
  period_end: string;
  amount_total: number;
  currency: string;
  status: string; // "pending" | "paid" | "failed"
  due_date?: string | null;
  issued_at: string;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
};

/* ───────────────────── Навигация ───────────────────── */

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

/* ───────────────────── Основной компонент ───────────────────── */

export default function PortalHomePage() {
  const [active, setActive] = useState<ScreenId>("dashboard");

  const [me, setMe] = useState<UserProfile | null>(null);
  const [facades, setFacades] = useState<Facade[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes, facadesRes, campaignsRes, invoicesRes] =
          await Promise.all([
            apiFetch("/me"),
            apiFetch("/facades"),
            apiFetch("/campaigns"),
            apiFetch("/invoices"),
          ]);

        if (cancelled) return;

        setMe(meRes || null);
        setFacades(facadesRes || []);
        setCampaigns(campaignsRes || []);
        setInvoices(invoicesRes || []);
      } catch (err) {
        console.error("Failed to load portal data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    me?.full_name || me?.name || "User";
  const roleLabel = me ? humanRole(me.role) : "—";

  const facadesCount = facades.length;
  const onlineFacades = facades.filter((f) => f.status === "online").length;
  const syncHealthPct =
    facadesCount > 0
      ? Math.round((onlineFacades / facadesCount) * 1000) / 10
      : 0;

  return (
    <PageGuard allow="viewer">
      <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-[#f5f7fa] to-[#e5edf5] text-slate-900">
        {/* Атмосферный фон */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.5) 1px, transparent 0)",
              backgroundSize: "44px 44px",
            }}
          />
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
                    {facadesCount} facades connected
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2.5 text-xs shadow-[0_10px_35px_rgba(15,23,42,0.12)]">
                  <span className="text-slate-500">Live sync</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {facadesCount > 0
                      ? `${syncHealthPct.toFixed(1)}%`
                      : "no data"}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Правая часть: topbar + main sheet */}
          <main className="flex flex-1 flex-col gap-4 lg:gap-6">
            {/* Topbar */}
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
                  <span>
                    Cluster: EU-1 · {facadesCount || 0} facades
                  </span>
                </div>

                <Link
                  href="/portal/profile"
                  className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-2.5 py-1.5 text-xs shadow-[0_10px_32px_rgba(15,23,42,0.15)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                    {initials(displayName)}
                  </div>
                  <div className="hidden flex-col text-left sm:flex">
                    <span className="text-[11px] font-semibold text-slate-900">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {roleLabel}
                    </span>
                  </div>
                </Link>
              </div>
            </header>

            {/* Main sheet */}
            <section className="relative flex-1 rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/80 via-white/60 to-slate-50/60" />

              <div className="relative flex h-full flex-col gap-6 px-6 pb-6 pt-5 lg:px-8 lg:pb-8 lg:pt-6">
                {/* Верхняя строка контента */}
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
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs text-slate-600 shadow-[0_10px_32px_rgba(15,23,42,0.12)]"
                    >
                      Today
                    </button>
                    <Link
                      href={primaryRouteFor(active)}
                      className="rounded-2xl border border-transparent bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-[0_12px_36px_rgba(15,23,42,0.55)]"
                    >
                      New {primaryActionFor(active)}
                    </Link>
                  </div>
                </div>

                {/* Контент */}
                {loading ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                    Loading workspace…
                  </div>
                ) : (
                  <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    {/* Левая часть */}
                    <div className="flex flex-col gap-4 lg:gap-5">
                      {active === "dashboard" && (
                        <DashboardScreen
                          facades={facades}
                          campaigns={campaigns}
                        />
                      )}
                      {active === "campaigns" && (
                        <CampaignsScreen campaigns={campaigns} />
                      )}
                      {active === "invoices" && (
                        <InvoicesScreen invoices={invoices} />
                      )}
                      {active === "profile" && (
                        <ProfileScreen me={me} />
                      )}
                    </div>

                    {/* Правая часть */}
                    <div className="flex flex-col gap-4 lg:gap-5">
                      {active === "dashboard" && (
                        <DashboardSecondary
                          campaigns={campaigns}
                          facades={facades}
                        />
                      )}
                      {active === "campaigns" && (
                        <CampaignsSecondary campaigns={campaigns} />
                      )}
                      {active === "invoices" && (
                        <InvoicesSecondary invoices={invoices} />
                      )}
                      {active === "profile" && (
                        <ProfileSecondary me={me} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </PageGuard>
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
      return "Real-time overview of all facades and campaigns in one place.";
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

function primaryRouteFor(id: ScreenId): string {
  switch (id) {
    case "dashboard":
      return "/portal/dashboard";
    case "campaigns":
      return "/portal/campaigns/create";
    case "invoices":
      return "/portal/invoices";
    case "profile":
      return "/portal/profile";
  }
}

/* ───────────────────── Экран: DASHBOARD ───────────────────── */

function DashboardScreen({
  facades,
  campaigns,
}: {
  facades: Facade[];
  campaigns: Campaign[];
}) {
  const primary = facades[0];
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "live" || c.status === "scheduled",
  ).length;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <Link
        href="/portal/dashboard"
        className="block rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.16)] transition hover:-translate-y-[1px] hover:shadow-[0_26px_90px_rgba(15,23,42,0.22)]"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Primary facade
            </span>
            <span className="text-sm font-medium text-slate-900">
              {primary
                ? `${primary.name} · ${primary.address || "No address"}`
                : "No facades connected yet"}
            </span>
          </div>
          {primary && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-mono text-emerald-600">
              {primary.status.toUpperCase()}
            </span>
          )}
        </div>

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
            {primary ? "LIVE PREVIEW" : "NO SIGNAL"}
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          label="Active facades"
          value={String(facades.length)}
          hint={`${facades.filter((f) => f.status === "online").length} online`}
        />
        <MetricCard
          label="Live / scheduled campaigns"
          value={String(activeCampaigns)}
          hint={`${campaigns.length} total campaigns`}
        />
        <MetricCard
          label="Recently added"
          value={
            campaigns.slice(0, 1)[0]?.name
              ? campaigns[0].name
              : "No campaigns yet"
          }
          hint={
            campaigns[0]?.created_at
              ? `Created at ${campaigns[0].created_at.slice(0, 10)}`
              : "—"
          }
        />
      </div>
    </div>
  );
}

function DashboardSecondary({
  campaigns,
  facades,
}: {
  campaigns: Campaign[];
  facades: Facade[];
}) {
  const now = new Date();
  const upcoming = campaigns
    .filter(
      (c) =>
        c.start_time &&
        new Date(c.start_time) > now &&
        (c.status === "scheduled" || c.status === "live"),
    )
    .sort(
      (a, b) =>
        new Date(a.start_time || "").getTime() -
        new Date(b.start_time || "").getTime(),
    )
    .slice(0, 3);

  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.16)]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Upcoming switchovers
          </span>
          <Link
            href="/portal/campaigns"
            className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
          >
            View campaigns
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          {upcoming.length === 0 && (
            <div className="rounded-2xl bg-slate-50/70 px-3 py-2.5 text-[11px] text-slate-500">
              No upcoming campaigns scheduled.
            </div>
          )}
          {upcoming.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between rounded-2xl bg-slate-50/70 px-3 py-2.5"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-slate-500">
                  {c.start_time
                    ? new Date(c.start_time).toLocaleString()
                    : "—"}
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {c.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  Status: {c.status}
                </span>
              </div>
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.16)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Facade statuses
        </span>
        <div className="mt-3 space-y-3 text-sm">
          {facades.slice(0, 4).map((f) => (
            <Link
              key={f.id}
              href="/portal/dashboard"
              className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-3 py-2.5 transition hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-[0_16px_55px_rgba(15,23,42,0.2)]"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {f.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {f.address || "No address"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-600">
                {f.status.toUpperCase()}
              </span>
            </Link>
          ))}
          {facades.length === 0 && (
            <div className="rounded-2xl bg-slate-50/80 px-3 py-2.5 text-[11px] text-slate-500">
              No facades yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Экран: CAMPAIGNS ───────────────────── */

function CampaignsScreen({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Campaign timeline
          </span>
          <Link
            href="/portal/campaigns"
            className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="h-32 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center text-[11px] text-slate-400">
          Timeline placeholder (attach chart later)
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Campaigns
          </span>
          <Link
            href="/portal/campaigns/create"
            className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
          >
            New campaign
          </Link>
        </div>
        <div className="space-y-2.5 text-sm">
          {campaigns.length === 0 && (
            <div className="rounded-2xl bg-slate-50/70 px-3 py-2.5 text-[11px] text-slate-500">
              No campaigns yet. Create your first one.
            </div>
          )}
          {campaigns.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              href={`/portal/campaigns`}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-[0_16px_55px_rgba(15,23,42,0.2)]"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {c.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {c.start_time
                    ? `${c.start_time.slice(0, 10)} → ${
                        c.end_time?.slice(0, 10) || "—"
                      }`
                    : "No schedule"}
                </span>
              </div>
              <span className={badgeClassForStatus(c.status)}>
                {c.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CampaignsSecondary({ campaigns }: { campaigns: Campaign[] }) {
  const grouped = campaigns.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(grouped);

  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Campaign status breakdown
        </span>
        <div className="mt-3 space-y-2.5 text-sm">
          {entries.length === 0 && (
            <div className="rounded-2xl bg-slate-50/80 px-3 py-2.5 text-[11px] text-slate-500">
              No campaigns to display.
            </div>
          )}
          {entries.map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-3 py-2.5"
            >
              <span className="w-24 text-[11px] font-mono text-slate-500">
                {status.toUpperCase()}
              </span>
              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-900"
                  style={{
                    width:
                      campaigns.length > 0
                        ? `${(count / campaigns.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <span className="w-8 text-right text-[11px] font-mono text-slate-600">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Recent campaigns
        </span>
        <div className="mt-3 space-y-2 text-[11px] text-slate-600">
          {campaigns.slice(0, 3).map((c) => (
            <p key={c.id}>
              {c.created_at.slice(0, 10)} — {c.name} ({c.status})
            </p>
          ))}
          {campaigns.length === 0 && <p>No campaigns yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Экран: INVOICES ───────────────────── */

function InvoicesScreen({ invoices }: { invoices: Invoice[] }) {
  const latest = invoices
    .slice()
    .sort(
      (a, b) =>
        new Date(b.issued_at).getTime() -
        new Date(a.issued_at).getTime(),
    )
    .slice(0, 5);

  const thisMonthTotal = calculateThisMonth(invoices);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Invoice list
          </span>
          <Link
            href="/portal/invoices"
            className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
          >
            Open billing
          </Link>
        </div>
        <div className="space-y-2.5 text-sm">
          {latest.length === 0 && (
            <div className="rounded-2xl bg-slate-50/70 px-3 py-2.5 text-[11px] text-slate-500">
              No invoices yet.
            </div>
          )}
          {latest.map((i) => (
            <Link
              key={i.id}
              href="/portal/invoices"
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left transition hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-[0_16px_55px_rgba(15,23,42,0.2)]"
            >
              <span className="font-mono text-[11px] text-slate-500">
                {i.invoice_number}
              </span>
              <span className="truncate text-sm text-slate-900">
                {i.period_start.slice(0, 10)} →{" "}
                {i.period_end.slice(0, 10)}
              </span>
              <span className="text-sm text-slate-900">
                {i.amount_total.toLocaleString()} {i.currency}
              </span>
              <span className="text-[11px] text-slate-500">
                {i.issued_at.slice(0, 10)}
              </span>
              <span className={badgeClassForStatus(i.status)}>
                {i.status}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          label="This month"
          value={
            thisMonthTotal > 0
              ? `${thisMonthTotal.toLocaleString()} ₽`
              : "—"
          }
          hint="Total issued"
        />
        <MetricCard
          label="Paid invoices"
          value={String(
            invoices.filter((i) => i.status === "paid").length,
          )}
          hint="All time"
        />
        <MetricCard
          label="Pending"
          value={String(
            invoices.filter((i) => i.status === "pending").length,
          )}
          hint="Awaiting payment"
        />
      </div>
    </div>
  );
}

function InvoicesSecondary({ invoices }: { invoices: Invoice[] }) {
  const overdue = invoices.filter(
    (i) =>
      i.status === "pending" &&
      i.due_date &&
      new Date(i.due_date) < new Date(),
  );

  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Reconciliation
        </span>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-[11px] text-slate-600">
            Invoices are generated from actual campaign activity and
            rate cards.
          </p>
          <div className="mt-3 space-y-2 text-[11px] text-slate-600">
            <p>
              · {invoices.length} total invoices in the system
            </p>
            <p>
              · {invoices.filter((i) => i.status === "paid").length}{" "}
              fully paid
            </p>
            <p>
              · {overdue.length} overdue invoices by due date
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Export
        </span>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-[11px] text-slate-600">
            Export billing data into external accounting tools (CSV,
            XLSX, etc.). Integrations can be added later.
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

function ProfileScreen({ me }: { me: UserProfile | null }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <Link
        href="/portal/profile"
        className="block rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)] transition hover:-translate-y-[1px] hover:shadow-[0_26px_90px_rgba(15,23,42,0.25)]"
      >
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.6)]">
            {initials(me?.full_name || me?.name || "User")}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              {me?.full_name || me?.name || "User"}
            </span>
            <span className="text-[11px] text-slate-500">
              {humanRole(me?.role || "user")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <DetailField label="Email" value={me?.email || "—"} />
          <DetailField
            label="Workspace"
            value="MediaWork / Facades"
          />
          <DetailField
            label="Role"
            value={humanRole(me?.role || "user")}
          />
          <DetailField
            label="Created at"
            value={me?.created_at?.slice(0, 10) || "—"}
          />
        </div>
      </Link>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Security
        </span>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <DetailField label="2FA" value="Enabled · TOTP (planned)" />
          <DetailField
            label="Last sign-in"
            value="Tracked on backend"
          />
          <DetailField
            label="Devices"
            value="Multi-device sessions"
          />
          <DetailField
            label="API tokens"
            value="Managed in profile"
          />
        </div>
      </div>
    </div>
  );
}

function ProfileSecondary({ me }: { me: UserProfile | null }) {
  return (
    <div className="flex h-full flex-col gap-4 lg:gap-5">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace preferences
        </span>
        <div className="mt-3 space-y-2 text-sm">
          <DetailField
            label="Language"
            value="Based on backend locale (default: en)"
          />
          <DetailField label="Units" value="Metric · 24h time" />
          <DetailField
            label="Theme"
            value="Light · Glass surfaces"
          />
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.18)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Quiet mode
        </span>
        <p className="mt-3 text-[11px] text-slate-600">
          Keep notifications minimal while you are adjusting campaigns.
          Only important alerts will appear.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────── Общие компоненты / utils ───────────────────── */

function MetricCard(props: {
  label: string;
  value: string;
  hint: string;
}) {
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
  const normalized = status.toLowerCase();

  if (normalized === "live" || normalized === "paid")
    return base + " bg-emerald-50 text-emerald-600";
  if (normalized === "scheduled" || normalized === "pending")
    return base + " bg-slate-100 text-slate-700";
  if (normalized === "draft")
    return base + " bg-slate-50 text-slate-500";
  if (normalized === "failed" || normalized === "cancelled")
    return base + " bg-red-50 text-red-600";

  return base + " bg-slate-100 text-slate-700";
}

function initials(name: string | undefined | null) {
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function humanRole(role: string) {
  const r = role.toLowerCase();
  if (r === "admin") return "Admin · Studio";
  if (r === "owner") return "Owner · Studio";
  if (r === "user") return "Member";
  return role;
}

function calculateThisMonth(invoices: Invoice[]): number {
  if (invoices.length === 0) return 0;
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  return invoices
    .filter((i) => i.period_start.startsWith(ym))
    .reduce((sum, i) => sum + (i.amount_total || 0), 0);
}
