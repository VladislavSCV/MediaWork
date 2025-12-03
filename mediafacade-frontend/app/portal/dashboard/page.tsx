// app/portal/dashboard/page.tsx

import PageGuard from "@/components/RoleGuard";

type UserRole =
  | "superadmin"
  | "orgadmin"
  | "manager"
  | "buyer"
  | "analyst"
  | "tech"
  | "viewer";

export default function DashboardPage() {
  // TODO: сюда потом подтянешь реальную роль из JWT / /me
  const role: UserRole = "orgadmin";
  const canSeeBilling =
    role === "superadmin" || role === "orgadmin" || role === "analyst";

  return (
    <PageGuard allow="viewer">
    <div className="space-y-8 lg:space-y-10">
      {/* Заголовок дашборда */}
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
              High-level view of your rented facades, active campaigns and media
              spend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-[0_10px_35px_rgba(15,23,42,0.18)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live delivery&nbsp;·&nbsp;<span className="font-mono">99.4%</span>
            </div>
            <button className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[0_10px_32px_rgba(15,23,42,0.16)]">
              Export report
            </button>
          </div>
        </div>
      </section>

      {/* Основной sheet дашборда */}
      <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-6 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 lg:py-7">
        <div className="space-y-7 lg:space-y-8">
          {/* Верх: summary карточки */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Active campaigns"
              value="7"
              hint="+2 vs last week"
            />
            <SummaryCard
              label="Rented facades"
              value="5"
              hint="3 cities · 2 countries"
            />
            <SummaryCard
              label="Playtime delivered"
              value="42h 18m"
              hint="Last 7 days"
            />
            <SummaryCard
              label="Spend this month"
              value="₽ 1.84M"
              hint="Forecast: ₽ 2.10M"
              highlighted={canSeeBilling}
              locked={!canSeeBilling}
            />
          </div>

          {/* Средний блок: график + биллинг */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* График производительности */}
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

              {/* Имитация графика (статический, но выглядит как real chart) */}
              <div className="relative h-52 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100">
                {/* сетка */}
                <div
                  className="absolute inset-0 opacity-[0.28]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* area-подложка */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/80 via-slate-50 to-transparent" />
                {/* линии-спагетти */}
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
                {/* подписи по оси X */}
                <div className="absolute inset-x-6 bottom-2 flex justify-between text-[10px] font-mono text-slate-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span key={d}>{d}</span>
                    )
                  )}
                </div>

                {/* легенда */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-3 text-[11px]">
                  <LegendPill dotClass="bg-slate-900" label="Impressions" />
                  <LegendPill dotClass="bg-sky-500" label="Playtime" />
                  {canSeeBilling && (
                    <LegendPill
                      dotClass="bg-emerald-500"
                      label="Spend (₽)"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Биллинг и бюджет */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_20px_75px_rgba(15,23,42,0.18)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Spend overview
                    </div>
                    <div className="text-[13px] text-slate-500">
                      Month-to-date media spend
                    </div>
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
                        ₽ 1.84M
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Budget: ₽ 2.50M
                      </div>
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
                  <div className="flex flex-col items-start gap-3 rounded-2xl bg-slate-50/80 px-3 py-3 text-[12px] text-slate-500">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Restricted
                    </span>
                    <p>
                      Your role cannot view detailed billing. Ask your
                      organization admin for access.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_20px_75px_rgba(15,23,42,0.18)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Upcoming invoices
                    </div>
                    <div className="text-[13px] text-slate-500">
                      Next 30 days
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[12px]">
                  <InvoiceRow
                    date="15 Dec"
                    label="November delivery"
                    amount="₽ 720 000"
                    status="Scheduled"
                  />
                  <InvoiceRow
                    date="01 Jan"
                    label="Q4 package settlement"
                    amount="₽ 1 120 000"
                    status="Draft"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Нижний блок: кампании + фасады + расписание */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Активные кампании */}
            <div className="xl:col-span-1 rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Active campaigns
                  </div>
                  <div className="text-[13px] text-slate-500">
                    Running across your rented facades
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-[13px]">
                <CampaignRow
                  name="Evening brand loop"
                  facades="3 facades"
                  status="Live"
                  today="12 430 impressions"
                />
                <CampaignRow
                  name="Night skyline animation"
                  facades="2 facades"
                  status="Live"
                  today="8 912 impressions"
                />
                <CampaignRow
                  name="Morning calm preset"
                  facades="4 facades"
                  status="Scheduled"
                  today="Starts tomorrow"
                />
              </div>
            </div>

            {/* Фасады */}
            <div className="xl:col-span-1 rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Rented facades
                  </div>
                  <div className="text-[13px] text-slate-500">
                    Screens included in your contracts
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-[13px]">
                <FacadeRow
                  city="Moscow"
                  spot="Tverskaya 21"
                  status="Online"
                  metric="14h playtime · today"
                />
                <FacadeRow
                  city="Berlin"
                  spot="Alexanderplatz"
                  status="Online"
                  metric="9h playtime · today"
                />
                <FacadeRow
                  city="London"
                  spot="Piccadilly"
                  status="Maintenance"
                  metric="Back at 02:00"
                />
              </div>
            </div>

            {/* Расписание показов */}
            <div className="xl:col-span-1 rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.18)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Upcoming plays
                  </div>
                  <div className="text-[13px] text-slate-500">
                    Next scheduled campaign switchovers
                  </div>
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
        </div>
      </section>
    </div>
    </PageGuard>
  );
}

/* ───────────────────── Вспомогательные компоненты ───────────────────── */

const chartHeights = [42, 65, 52, 78, 60, 88, 55];

function SummaryCard(props: {
  label: string;
  value: string;
  hint: string;
  highlighted?: boolean;
  locked?: boolean;
}) {
  const { label, value, hint, highlighted, locked } = props;

  return (
    <div
      className={[
        "rounded-[22px] border px-4 py-3 shadow-[0_18px_65px_rgba(15,23,42,0.18)]",
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

function RangePill(props: { children: string; active?: boolean }) {
  return (
    <button
      className={[
        "px-2.5 py-1 rounded-2xl",
        "transition-colors",
        props.active
          ? "bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.7)]"
          : "bg-transparent text-slate-500",
      ].join(" ")}
      type="button"
    >
      {props.children}
    </button>
  );
}

function LegendPill(props: { dotClass?: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl bg-white/80 px-2.5 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.3)]">
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          props.dotClass ?? "bg-slate-900",
        ].join(" ")}
      />
      <span className="text-[10px] font-medium text-slate-700">
        {props.label}
      </span>
    </div>
  );
}

function InvoiceRow(props: {
  date: string;
  label: string;
  amount: string;
  status: "Scheduled" | "Draft";
}) {
  const tone =
    props.status === "Scheduled"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-[11px] font-mono text-slate-500">
          {props.date}
        </span>
        <span className="text-[12px] text-slate-800">{props.label}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[12px] font-medium text-slate-900">
          {props.amount}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tone}`}
        >
          {props.status}
        </span>
      </div>
    </div>
  );
}

function CampaignRow(props: {
  name: string;
  facades: string;
  status: "Live" | "Scheduled";
  today: string;
}) {
  const pillClass =
    props.status === "Live"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-slate-900">
          {props.name}
        </span>
        <span className="text-[11px] text-slate-500">
          {props.facades} · {props.today}
        </span>
      </div>
      <span
        className={`ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${pillClass}`}
      >
        {props.status}
      </span>
    </div>
  );
}

function FacadeRow(props: {
  city: string;
  spot: string;
  status: "Online" | "Maintenance";
  metric: string;
}) {
  const dotClass =
    props.status === "Online" ? "bg-emerald-500" : "bg-amber-400";

  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-slate-900">
          {props.city} · {props.spot}
        </span>
        <span className="text-[11px] text-slate-500">{props.metric}</span>
      </div>
      <div className="ml-3 mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] text-slate-600">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        <span>{props.status}</span>
      </div>
    </div>
  );
}

function ScheduleRow(props: {
  time: string;
  title: string;
  place: string;
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl bg-slate-50/80 px-3 py-2.5">
      <div className="flex flex-col">
        <span className="text-[11px] font-mono text-slate-500">
          {props.time}
        </span>
        <span className="text-[13px] font-medium text-slate-900">
          {props.title}
        </span>
        <span className="text-[11px] text-slate-500">{props.place}</span>
      </div>
      <span className="ml-3 mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </div>
  );
}
