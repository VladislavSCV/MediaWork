"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  facadeId: number;
};

export default function FacadeWall({ facadeId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);

  // 🟢 1️⃣ При загрузке страницы получаем текущее видео из БД
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/facades`);
        const data = await res.json();
        const facade = data.find((f: any) => f.id === facadeId);
        if (facade?.current_content_url) {
          console.log("🎞 Loaded current content:", facade.current_content_url);
          setSrc(facade.current_content_url);

          const v = videoRef.current;
          if (v) {
            v.src = facade.current_content_url;
            v.muted = true;
            v.autoplay = true;
            v.playsInline = true;
            v.loop = true;
            v.play().catch((err) => {
              console.warn("⚠️ Autoplay blocked on initial load:", err);
            });
          }
        }
      } catch (err) {
        console.error("❌ Failed to load current content:", err);
      }
    };

    loadInitial();
  }, [facadeId]);

  // 🟢 2️⃣ Подключаем WebSocket для обновлений
  useEffect(() => {
    console.log("🧠 Opening WS for facade:", facadeId);
    const ws = new WebSocket(`ws://localhost:8080/ws/facade/${facadeId}`);

    ws.onopen = () => console.log("✅ WS connected to facade", facadeId);
    ws.onclose = (e) => console.log("🔌 WS closed:", e.code, e.reason);
    ws.onerror = (e) => console.warn("⚠️ WS error", e);

    ws.onmessage = (event) => {
      console.log("📩 RAW message:", event.data);
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "content_update" && msg.src) {
          console.log("🎬 Updating to new content:", msg.src);
          const url = String(msg.src);
          setSrc(url);

          const v = videoRef.current;
          if (v) {
            v.src = url;
            v.muted = true;
            v.autoplay = true;
            v.playsInline = true;
            v.loop = true;

            if (msg.startAt) {
              const diff = (Date.now() - msg.startAt) / 1000;
              v.currentTime = diff > 0 ? diff : 0;
            }

            v.play().catch((err) => {
              console.error("🎧 video.play() blocked:", err);
            });
          }
        }
      } catch (e) {
        console.error("❌ Bad WS message:", e);
      }
    };

    return () => {
      console.log("🧹 Cleanup WS");
      ws.close();
    };
  }, [facadeId]);

  // 🟢 3️⃣ Обработка .gif как статичного изображения
  const isGif = src?.toLowerCase().endsWith(".gif") ?? false;

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative w-[1080px] h-[720px] border border-cyan-500 shadow-[0_0_40px_rgba(0,255,255,0.5)] overflow-hidden bg-black">
        {src ? (
          isGif ? (
            <img
              src={src}
              alt="facade content"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (
            <video
              ref={videoRef}
              src={src}
              muted
              autoPlay
              loop
              playsInline
              controls={false}
              className="w-full h-full object-cover animate-fade-in"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cyan-400 text-xl">
            Ожидание контента фасада #{facadeId}…
          </div>
        )}
      </div>
    </main>
  );
}
