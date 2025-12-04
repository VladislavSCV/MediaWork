"use client";

import PageGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

type Campaign = {
  id: number;
  name: string;
  status: string;
  start_time?: string;
  end_time?: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [filter, setFilter] = useState<
    "all" | "active" | "scheduled" | "finished"
  >("all");

  useEffect(() => {
    apiFetch("/campaigns")
      .then((data) => setCampaigns(data || []))
      .catch((err) => console.error("Failed to load campaigns:", err))
      .finally(() => setLoading(false));
  }, []);

  const visibleCampaigns =
    filter === "all"
      ? campaigns
      : campaigns.filter((cmp) => cmp.status === filter);

  if (loading) {
    return <div className="p-8 text-slate-500 text-lg">Loading campaigns…</div>;
  }

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

            {/* FIXED WORKING BUTTON */}
            <button
              onClick={() => router.push("/portal/campaigns/create")}
              className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.22)] hover:bg-white"
            >
              New campaign
            </button>
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
              <CampaignCard
                key={cmp.id}
                id={String(cmp.id)}
                name={cmp.name}
                status={cmp.status}
                preview="/window.svg"
                facades={3}
                city="—"
                impressions={cmp.status}
                date={
                  cmp.start_time
                    ? `${cmp.start_time.slice(0, 10)} → ${cmp.end_time?.slice(
                        0,
                        10
                      )}`
                    : "—"
                }
              />
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

/* FULLY CLICKABLE CAMPAIGN CARD */
function CampaignCard(props: {
  id: string;
  name: string;
  facades: number;
  city: string;
  status: string;
  impressions: string;
  date: string;
  preview: string;
}) {
  const router = useRouter();

  const open = () => router.push(`/portal/campaigns/${props.id}`);

  const statusColor =
    props.status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : props.status === "scheduled"
      ? "bg-blue-100 text-blue-700"
      : props.status === "finished"
      ? "bg-slate-300 text-slate-700"
      : "bg-slate-200 text-slate-700";

  return (
    <div
      onClick={open}
      className="group cursor-pointer rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.2)] hover:shadow-[0_28px_95px_rgba(15,23,42,0.28)] transition"
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor}`}
        >
          {props.status}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="rounded-xl bg-white/70 px-2 py-1 text-[11px] text-slate-600 shadow"
        >
          Details
        </button>
      </div>

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
        <div className="text-[12px] font-mono text-slate-700">
          {props.impressions}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        className="mt-3 w-full rounded-xl bg-slate-900 py-1.5 text-[12px] font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)] group-hover:bg-slate-800"
      >
        Manage
      </button>
    </div>
  );
}
