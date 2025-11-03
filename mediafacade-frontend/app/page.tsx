"use client";

import { useEffect, useRef, useState } from "react";

const ROWS = 20;
const COLS = 10;

// дефолтный ролик
const DEFAULT_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
// заменишь на свой CDN / S3 / что угодно

export default function FacadeWall() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(DEFAULT_VIDEO);

  useEffect(() => {
    // Подключаемся к Go-бэку по WebSocket
    const ws = new WebSocket("ws://localhost:4000/ws/facade");

    ws.onopen = () => {
      console.log("WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // ожидаем формата:
        // { "type": "content_update", "src": "https://...", "startAt": 1730650000000 }
        if (msg.type === "content_update" && typeof msg.src === "string") {
          setVideoSrc(msg.src);

          const v = videoRef.current;
          if (v) {
            v.src = msg.src;

            if (msg.startAt) {
              const now = Date.now();
              const diffSec = (now - msg.startAt) / 1000;
              v.currentTime = diffSec > 0 ? diffSec : 0;
            }

            v.play().catch(() => {
              // браузер может блокнуть автоплей, это нормально
              console.warn("Autoplay blocked, user interaction needed");
            });
          }
        }
      } catch (e) {
        console.error("WS message error", e);
      }
    };

    ws.onclose = () => {
      console.log("WS closed");
    };

    return () => ws.close();
  }, []);

  // если меняем src руками (например, первое подключение)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.src = videoSrc;
    v.play().catch(() => {});
  }, [videoSrc]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050814]">
      <div
        className="relative shadow-[0_0_60px_rgba(0,0,0,0.9)]"
        style={{
          width: "1080px",
          height: "720px",
          overflow: "hidden",
        }}
      >
        {/* один общий видеопоток */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
        />

        {/* сетка панелей поверх видео */}
        <div
          className="relative grid pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            width: "100%",
            height: "100%",
          }}
        >
          {Array.from({ length: ROWS * COLS }).map((_, i) => (
            <div
              key={i}
              className="border border-[rgba(0,0,0,0.7)]"
              // можно добавить подсветку при желании
            />
          ))}
        </div>
      </div>
    </main>
  );
}
