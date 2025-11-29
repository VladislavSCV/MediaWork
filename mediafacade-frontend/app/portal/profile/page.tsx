"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/portal/me`, {
      headers: { Authorization: localStorage.getItem("advertiser_token") || "" },
    })
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="opacity-60">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Profile</h1>

      <div className="bg-[#11161d] p-6 rounded-xl border border-white/10 w-[360px]">
        <div className="mb-2 text-sm opacity-60">Company</div>
        <div className="mb-6 text-lg">{data.name}</div>

        <div className="mb-2 text-sm opacity-60">Contact Person</div>
        <div className="mb-6">{data.contact_person}</div>

        <div className="mb-2 text-sm opacity-60">Email</div>
        <div>{data.email}</div>
      </div>
    </div>
  );
}
