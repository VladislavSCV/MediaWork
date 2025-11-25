"use client";

import { useEffect, useState } from "react";

export default function CampaignDetails({ params }: { params: any }) {
  const id = params.id;

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/portal/campaigns/${id}`, {
      headers: { Authorization: localStorage.getItem("advertiser_token") || "" },
    })
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <div className="opacity-60">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">{data.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#11161d] p-6 rounded-xl border border-white/10">
          <h2 className="text-xl mb-3">Media Content</h2>
          {data.media_url.endsWith(".gif") ? (
            <img className="rounded-lg" src={data.media_url} />
          ) : (
            <video className="rounded-lg w-full" src={data.media_url} autoPlay loop muted />
          )}
        </div>

        <div className="bg-[#11161d] p-6 rounded-xl border border-white/10">
          <h2 className="text-xl mb-3">Info</h2>

          <div className="space-y-2 text-sm opacity-90">
            <div>Status: {data.status}</div>
            <div>Duration: {data.duration_sec} sec</div>
            <div>Period: {data.start_at.slice(0, 10)} → {data.end_at.slice(0, 10)}</div>
            <div>Total price: {data.total_price ?? "-"} ₽</div>
          </div>
        </div>
      </div>
    </div>
  );
}
