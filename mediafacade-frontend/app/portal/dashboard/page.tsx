"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";

/* ============================================================================================
   TYPES
   ============================================================================================ */

type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
};

type UserRole =
  | "superadmin"
  | "orgadmin"
  | "manager"
  | "buyer"
  | "analyst"
  | "tech"
  | "viewer";

type Campaign = {
  id: number;
  company_id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  priority: number;
};

type Facade = {
  id: number;
  name: string;
  city: string;
  address: string;
  status: string;
};

type Invoice = {
  id: number;
  company_id: number;
  amount: number;
  period: string;
  status: string;
  created_at: string;
};

/* ============================================================================================
   ROLE MAP
   ============================================================================================ */

function mapBackendRole(role: string): UserRole {
  switch (role) {
    case "admin":
    case "owner":
      return "orgadmin";
    case "viewer":
      return "viewer";
    case "tech":
      return "tech";
    default:
      return "viewer";
  }
}

/* ============================================================================================
   PAGE COMPONENT
   ============================================================================================ */

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>("viewer");
  const [loadingUser, setLoadingUser] = useState(true);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [facades, setFacades] = useState<Facade[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  /* ============================== LOAD USER ============================== */
  useEffect(() => {
    apiFetch<User>("/me")
      .then((u) => setRole(mapBackendRole(u.role)))
      .catch((e) => console.error("/me failed:", e))
      .finally(() => setLoadingUser(false));
  }, []);

  /* ============================== LOAD DASHBOARD DATA ============================== */
  useEffect(() => {
    if (loadingUser) return;

    Promise.all([
      apiFetch<Campaign[]>("/campaigns").catch(() => []),
      apiFetch<Facade[]>("/facades").catch(() => []),
      apiFetch<Invoice[]>("/invoices").catch(() => []),
    ])
      .then(([camps, facs, invs]) => {
        setCampaigns(camps);
        setFacades(facs);
        setInvoices(invs);
      })
      .finally(() => setLoadingData(false));
  }, [loadingUser]);

  if (loadingUser || loadingData) {
    return <div className="p-8 text-slate-500 text-lg">Loading dashboard…</div>;
  }

  const canSeeBilling =
    role === "superadmin" || role === "orgadmin" || role === "analyst";

  /* ============================================================================================
     PAGE JSX
     ============================================================================================ */

  return (
    <PageGuard allow="viewer">
      <div className="space-y-8 lg:space-y-10">

        {/* ======================================================================================
            HEADER
           ====================================================================================== */}
        <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 lg:py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">

            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Dashboard
              </div>
              <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-slate-900 lg:text-[24px]">
                Advertising analytics
              </h1>
              <p className="text-[13px] text-slate-500">
                High-level view of your rented facades, active campaigns and media spend.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-[0_10px_35px_rgba(15,23,42,0.18)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live delivery · <span className="font-mono">99.4%</span>
              </div>

              <button
                type="button"
                onClick={() => console.log("Export clicked")}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-1.5 cursor-pointer shadow-[0_10px_32px_rgba(15,23,42,0.16)] text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600"
              >
                Export report
              </button>
            </div>

          </div>
        </section>

        {/* ======================================================================================
            MAIN BLOCK
           ====================================================================================== */}

        <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-6 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 lg:py-7">
          <div className="space-y-7 lg:space-y-8">

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Active campaigns"
                value={campaigns.length}
                hint="+2 vs last week"
              />

              <SummaryCard
                label="Rented facades"
                value={facades.length}
                hint="Total active locations"
              />

              <SummaryCard
                label="Playtime delivered"
                value="42h 18m"
                hint="Last 7 days"
              />

              <SummaryCard
                label="Spend this month"
                value={`₽ ${invoices.reduce((acc, x) => acc + x.amount, 0).toLocaleString()}`}
                hint="Forecast: ₽ 2.10M"
                highlighted={canSeeBilling}
                locked={!canSeeBilling}
              />
            </div>

            {/* CHART + BILLING */}
            <DashboardChartAndBilling canSeeBilling={canSeeBilling} invoices={invoices} />

            {/* CAMPAIGNS + FACADES + SCHEDULE */}
            <DashboardLists campaigns={campaigns} facades={facades} />
          </div>
        </section>
      </div>
    </PageGuard>
  );
}

/* ============================================================================================
   COMPONENTS
   ============================================================================================ */

function DashboardChartAndBilling({
  canSeeBilling,
  invoices,
}: {
  canSeeBilling: boolean;
  invoices: Invoice[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">

      {/* CHART */}
      <div className="lg:col-span-3 rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-50/90 via-white to-slate-50/90 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.2)]">
        
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Performance
            </div>
            <div className="text-[13px] text-slate-500">
              Impressions · playtime · spend
            </div>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-slate-200/80 bg-white/80 p-1 text-[11px] text-slate-500 shadow-[0_10px_35px_rgba(15,23,42,0.18)]">
            <RangePill active>7d</RangePill>
            <RangePill>30d</RangePill>
            <RangePill>90d</RangePill>
          </div>
        </div>

        <DashboardChart />
      </div>

      {/* BILLING */}
      <DashboardBilling invoices={invoices} canSeeBilling={canSeeBilling} />
    </div>
  );
}

function DashboardBilling({
  invoices,
  canSeeBilling,
}: {
  invoices: Invoice[];
  canSeeBilling: boolean;
}) {
  return (
    <div className="lg:col-span-2 space-y-4">

      {/* SPEND OVERVIEW */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_20px_75px_rgba(15,23,42,0.18)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Spend overview
            </div>
            <div className="text-[13px] text-slate-500">Month-to-date media spend</div>
          </div>

          {canSeeBilling && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-mono text-emerald-600">
              On track
            </span>
          )}
        </div>

        {canSeeBilling ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-[26px] font-semibold tracking-[-0.04em] text-slate-900">
                ₽ {invoices.reduce((acc, x) => acc + x.amount, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Budget: ₽ 2.50M</div>
            </div>

            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 w-[72%] rounded-full bg-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.7)]" />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>72% used</span>
              <span>Est. completion · 26 days</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl px-3 py-3 bg-slate-50/80 text-[12px] text-slate-500">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Restricted
            </div>
            <p>Your role cannot view detailed billing.</p>
          </div>
        )}
      </div>

      {/* INVOICES */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_20px_75px_rgba(15,23,42,0.18)]">
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Upcoming invoices
          </div>
          <div className="text-[13px] text-slate-500">Next 30 days</div>
        </div>

        <div className="space-y-2 text-[12px]">
          {invoices.slice(0, 5).map((inv) => (
            <InvoiceRow
              key={inv.id}
              id={inv.id}
              date={inv.created_at.slice(0, 10)}
              label={`Invoice #${inv.id}`}
              amount={`₽ ${inv.amount_total.toLocaleString()}`}
              status={inv.status === "paid" ? "Scheduled" : "Draft"}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

function DashboardLists({
  campaigns,
  facades,
}: {
  campaigns: Campaign[];
  facades: Facade[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">

      {/* ACTIVE CAMPAIGNS */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Active campaigns
          </div>
          <div className="text-[13px] text-slate-500">
            Running across your rented facades
          </div>
        </div>

        <div className="space-y-2 text-[13px]">
          {campaigns.map((c) => (
            <CampaignRow
              key={c.id}
              id={c.id}
              name={c.name}
              facades="Various"
              status={c.status === "running" ? "Live" : "Scheduled"}
              today="—"
            />
          ))}
        </div>
      </div>

      {/* FACADES */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Rented facades
          </div>
          <div className="text-[13px] text-slate-500">
            Screens included in your contracts
          </div>
        </div>

        <div className="space-y-2 text-[13px]">
          {facades.map((f) => (
            <FacadeRow
              key={f.id}
              id={f.id}
              city={f.city}
              spot={f.address}
              status={f.status === "online" ? "Online" : "Maintenance"}
              metric="—"
            />
          ))}
        </div>
      </div>

      {/* SCHEDULE (STATIC FOR NOW) */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_70px_rgrgba(15,23,42,0.18)]">
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Upcoming plays
          </div>
          <div className="text-[13px] text-slate-500">
            Next scheduled campaign switchovers
          </div>
        </div>

        <div className="space-y-2 text-[12px]">
          <ScheduleRow
            time="Today · 18:00"
            title="Evening brand loop"
            place="Berlin · Alexanderplatz"
          />
          <ScheduleRow
            time="Today · 21:30"
            title="Night skyline animation"
            place="Moscow · City Towers"
          />
          <ScheduleRow
            time="Tomorrow · 07:00"
            title="Morning calm preset"
            place="London · Piccadilly"
          />
        </div>
      </div>

    </div>
  );
}

/* ============================================================================================
   SIMPLE COMPONENTS
   ============================================================================================ */

const chartHeights = [42, 65, 52, 78, 60, 88, 55];

function DashboardChart() {
  return (
    <div className="relative h-52 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100">

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/80 via-slate-50 to-transparent" />

      {/* VALUES */}
      <div className="absolute inset-x-6 bottom-8 flex items-end justify-between gap-3">
        {chartHeights.map((h, i) => (
          <div
            key={i}
            className="relative flex-1 rounded-full bg-slate-200/60"
            style={{ height: "96px" }}
          >
            <div
              className="absolute bottom-0 inset-x-0 rounded-full bg-slate-900 shadow-[0_8px_26px_rgba(15,23,42,0.5)]"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>

      {/* X AXIS */}
      <div className="absolute inset-x-6 bottom-2 flex justify-between text-[10px] font-mono text-slate-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* LEGEND */}
      <div className="absolute left-4 top-4 flex flex-wrap gap-3 text-[11px]">
        <LegendPill dotClass="bg-slate-900" label="Impressions" />
        <LegendPill dotClass="bg-sky-500" label="Playtime" />
        <LegendPill dotClass="bg-emerald-500" label="Spend (₽)" />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  highlighted,
  locked,
}: {
  label: string;
  value: string | number;
  hint: string;
  highlighted?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[22px] transition cursor-pointer hover:scale-[1.02] border px-4 py-3 shadow-[0_18px_65px_rgba(15,23,42,0.18)]",
        highlighted
          ? "border-slate-900/10 bg-gradient-to-br from-slate-900/95 via-slate-900 to-slate-800 text-white"
          : "border-slate-200/80 bg-slate-50/80 text-slate-900",
      ].join(" ")}
    >
      <div
        className={[
          "text-[11px] font-semibold uppercase tracking-[0.18em]",
          highlighted ? "text-slate-200/80" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </div>

      <div className="mt-1 text-[22px] font-semibold tracking-[-0.04em]">
        {locked ? "••••••" : value}
      </div>

      <div
        className={[
          "mt-0.5 text-[11px]",
          highlighted ? "text-slate-200/80" : "text-slate-500",
        ].join(" ")}
      >
        {hint}
      </div>
    </div>
  );
}

function RangePill({ children, active }: { children: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={[
        "px-2.5 py-1 rounded-2xl cursor-pointer",
        active
          ? "bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.7)]"
          : "bg-transparent text-slate-500",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function LegendPill({ dotClass, label }: { dotClass?: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl bg-white/80 px-2.5 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.3)]">
      <span className={["h-1.5 w-1.5 rounded-full", dotClass ?? "bg-slate-900"].join(" ")} />
      <span className="text-[10px] font-medium text-slate-700">{label}</span>
    </div>
  );
}

function InvoiceRow({
  id,
  date,
  label,
  amount,
  status,
}: {
  id: number;
  date: string;
  label: string;
  amount: string;
  status: "Scheduled" | "Draft";
}) {
  const tone =
    status === "Scheduled"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-slate-100 text-slate-600";

  return (
    <Link
      href={`/portal/invoices/${id}`}
      className="flex items-center justify-between cursor-pointer rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition px-3 py-2"
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-mono text-slate-500">{date}</span>
        <span className="text-[12px] text-slate-800">{label}</span>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-[12px] font-medium text-slate-900">
          {amount}
        </span>

        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
            tone,
          ].join(" ")}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}

function CampaignRow({
  id,
  name,
  facades,
  status,
  today,
}: {
  id: number;
  name: string;
  facades: string;
  status: "Live" | "Scheduled";
  today: string;
}) {
  const pill =
    status === "Live"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-slate-100 text-slate-600";

  return (
    <Link
      href={`/portal/campaigns/${id}`}
      className="flex items-start justify-between cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-100 transition px-3 py-2.5"
    >
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-slate-900">
          {name}
        </span>
        <span className="text-[11px] text-slate-500">
          {facades} · {today}
        </span>
      </div>

      <span
        className={[
          "ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
          pill,
        ].join(" ")}
      >
        {status}
      </span>
    </Link>
  );
}

function FacadeRow({
  id,
  city,
  spot,
  status,
  metric,
}: {
  id: number;
  city: string;
  spot: string;
  status: "Online" | "Maintenance";
  metric: string;
}) {
  const dot = status === "Online" ? "bg-emerald-500" : "bg-amber-400";

  return (
    <Link
      href={`/portal/facades/${id}`}
      className="flex items-start justify-between cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-100 transition px-3 py-2.5"
    >
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-slate-900">
          {city} · {spot}
        </span>
        <span className="text-[11px] text-slate-500">{metric}</span>
      </div>

      <div className="ml-3 mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] text-slate-600">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span>{status}</span>
      </div>
    </Link>
  );
}

function ScheduleRow({
  time,
  title,
  place,
}: {
  time: string;
  title: string;
  place: string;
}) {
  return (
    <div
      className="cursor-pointer rounded-2xl hover:bg-slate-100 transition bg-slate-50/80 px-3 py-2.5 flex justify-between items-start"
      onClick={() => console.log("Schedule clicked:", title)}
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-mono text-slate-500">{time}</span>
        <span className="text-[13px] font-medium text-slate-900">{title}</span>
        <span className="text-[11px] text-slate-500">{place}</span>
      </div>

      <span className="ml-3 mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </div>
  );
}
