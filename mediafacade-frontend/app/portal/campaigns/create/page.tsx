"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [duration, setDuration] = useState(10);
  const [tariffId, setTariffId] = useState<number | null>(null);
  const [screenIDs, setScreenIDs] = useState<number[]>([]);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const [tariffs, setTariffs] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);

  // Upload states
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  //
  // LOAD TARIFFS + SCREENS
  //
  useEffect(() => {
    async function load() {
      const t = await fetch("http://localhost:8080/api/billing/tariffs").then((r) => r.json());
      const s = await fetch("http://localhost:8080/api/screens").then((r) => r.json());

      setTariffs(Array.isArray(t) ? t : []);
      setScreens(Array.isArray(s) ? s : []);
    }
    load();
  }, []);

  //
  // UPLOAD MEDIA FILE
  //
  async function uploadFile(e: any) {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  setUploadPreview("");
  setMediaInfo(null);

  const fd = new FormData();
  fd.append("file", file);

  const token = localStorage.getItem("advertiser_token") || "";

  const res = await fetch("http://localhost:8080/api/portal/upload", {
    method: "POST",
    headers: { Authorization: token },
    body: fd,
  });

  if (!res.ok) {
    alert("Upload failed");
    setUploading(false);
    return;
  }

  const json = await res.json();
  console.log(json.preview);

  setUploadPreview(json.preview);
  setMediaInfo(json);

  setMediaUrl(json.url);
  setDuration(json.duration);

  setUploading(false);
}

  //
  // SUBMIT CAMPAIGN
  //
  async function submit() {
    const token = localStorage.getItem("advertiser_token") || "";

    const body = {
      name,
      media_url: mediaUrl,
      duration_sec: duration,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      tariff_id: tariffId,
      screen_ids: screenIDs,
    };

    const res = await fetch("http://localhost:8080/api/portal/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      alert("Ошибка при создании кампании");
      return;
    }

    const json = await res.json();
    router.push("/portal/campaigns/" + json.campaign_id);
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold">Create Campaign</h1>

      <div className="space-y-6 bg-[#11161d] p-6 rounded-xl border border-white/10">

        {/* NAME */}
        <div>
          <label className="block mb-2 opacity-70">Name</label>
          <input
            className="w-full p-3 rounded bg-[#0d1117] border border-white/10"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* UPLOAD */}
        <div>
          <label className="block mb-2 opacity-70">Upload Media</label>
          <input
            type="file"
            accept="video/*,image/*"
            onChange={uploadFile}
            className="w-full"
          />
        </div>

        {uploading && <div className="opacity-60">Uploading...</div>}

        {/* Preview */}
        {uploadPreview && (
          <div className="mt-4">
            <img
              src={`http://localhost:8080${uploadPreview}`}
              className="rounded-lg w-64 border border-white/10"
            />

          </div>
        )}

        {/* Media info */}
        {mediaInfo && (
          <pre className="text-sm bg-black/20 p-4 rounded-xl border border-white/10 mt-4">
            {JSON.stringify(mediaInfo, null, 2)}
          </pre>
        )}

        {/* Media URL */}
        <div>
          <label className="block mb-2 opacity-70">Media URL</label>
          <input
            className="w-full p-3 rounded bg-[#0d1117] border border-white/10"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block mb-2 opacity-70">Duration (sec)</label>
          <input
            type="number"
            className="w-full p-3 rounded bg-[#0d1117] border border-white/10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        {/* TARIFF */}
        <div>
          <label className="block mb-2 opacity-70">Tariff</label>
          <select
            className="w-full p-3 rounded bg-[#0d1117] border border-white/10"
            value={tariffId ?? ""}
            onChange={(e) => setTariffId(Number(e.target.value))}
          >
            <option value="">Select tariff</option>
            {tariffs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.price_per_second} ₽/sec
              </option>
            ))}
          </select>
        </div>

        {/* SCREENS */}
        <div>
          <label className="block mb-2 opacity-70">Screens</label>
          <div className="space-y-2">
            {screens.map((s) => (
              <label key={s.id} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={screenIDs.includes(s.id)}
                  onChange={() => {
                    if (screenIDs.includes(s.id)) {
                      setScreenIDs(screenIDs.filter((i) => i !== s.id));
                    } else {
                      setScreenIDs([...screenIDs, s.id]);
                    }
                  }}
                />
                {s.name} (#{s.id})
              </label>
            ))}
          </div>
        </div>

        {/* DATES */}
        <div>
          <label className="block mb-2 opacity-70">Start at</label>
          <input
            type="datetime-local"
            className="w-full p-3 rounded bg-[#0d1117] border border-white/10"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 opacity-70">End at</label>
          <input
            type="datetime-local"
            className="w-full p-3 rounded bg-[#0d1117] border border-white/10"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>

        <button
          onClick={submit}
          className="px-5 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700"
        >
          Create
        </button>
      </div>
    </div>
  );
}
