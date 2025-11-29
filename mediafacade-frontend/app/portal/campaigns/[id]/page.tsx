"use client";

import { use, useEffect, useState } from "react";

export default function CampaignDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // распаковываем async params (Next.js 16)
  const { id } = use(params);

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("advertiser_token") || "";

      const res = await fetch(`http://localhost:8080/api/portal/campaigns/${id}`, {
        headers: { Authorization: token },
      });

      const json = await res.json();
      setData(json);
    }

    load();
  }, [id]);

  if (!data) return <div className="opacity-60">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">{data.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MEDIA BLOCK */}
        <div className="bg-[#11161d] p-6 rounded-xl border border-white/10">
          <h2 className="text-xl mb-3">Media Content</h2>

          {data.media_url?.endsWith(".gif") ? (
            <img className="rounded-lg" src={data.media_url} />
          ) : (
            <video
              className="rounded-lg w-full"
              src={data.media_url}
              autoPlay
              loop
              muted
              controls
            />
          )}
        </div>

        {/* INFO BLOCK */}
        <div className="bg-[#11161d] p-6 rounded-xl border border-white/10">
          <h2 className="text-xl mb-3">Info</h2>

          <div className="space-y-2 text-sm opacity-90">
            <div>Status: {data.status}</div>
            <div>Duration: {data.duration_sec} sec</div>
            <div>
              Period: {data.start_at?.slice(0, 10)} → {data.end_at?.slice(0, 10)}
            </div>
            <div>Total price: {data.total_price ?? "-"} ₽</div>
          </div>
        </div>
      </div>
    </div>
  );
}
