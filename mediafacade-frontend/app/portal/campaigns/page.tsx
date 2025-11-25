"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CampaignsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState(10);
  const [newTariff, setNewTariff] = useState(1);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newScreens, setNewScreens] = useState<number[]>([]);


  async function uploadFile(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const token = localStorage.getItem("advertiser_token") || "";

    const res = await fetch("/api/portal/upload", {
      method: "POST",
      headers: { Authorization: token },
      body: form,
    });

    const data = await res.json();
    setUploadUrl(data.url);
    setUploading(false);
  }

  useEffect(() => {
    fetch("/api/portal/campaigns", {
      headers: { Authorization: localStorage.getItem("advertiser_token") || "" },
    })
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <div>
      {/* UPLOAD BOX */}
      <div className="mb-6 p-4 bg-[#11161d] rounded-xl border border-white/10">
        <div className="font-semibold mb-2">Upload new media</div>

        <input
          type="file"
          onChange={uploadFile}
          className="text-sm opacity-80"
        />

        {uploading && <div className="text-cyan-400 mt-2">Uploading...</div>}
        {uploadUrl && (
          <div className="mt-2 text-green-400">
            Uploaded: <a href={uploadUrl}>{uploadUrl}</a>
          </div>
        )}
      </div>
      <button
      onClick={() => setShowModal(true)}
      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white mb-6"
    >
      + Create Campaign
    </button>


      {/* CAMPAIGNS TABLE */}
      <h1 className="text-3xl font-semibold mb-6">Your Campaigns</h1>

      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="opacity-60 text-sm">
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Dates</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {items.map((c) => (
            <tr
              key={c.id}
              className="bg-[#11161d] hover:bg-[#141a22] border border-white/10 rounded-xl"
            >
              <td className="px-4 py-3">
                <Link className="hover:text-cyan-400" href={`/portal/campaigns/${c.id}`}>
                  {c.name}
                </Link>
              </td>
              <td className="px-4 py-3">{c.status}</td>
              <td className="px-4 py-3">
                {c.start_at.slice(0, 10)} → {c.end_at.slice(0, 10)}
              </td>
              <td className="px-4 py-3">{c.total_price ?? "-"} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
