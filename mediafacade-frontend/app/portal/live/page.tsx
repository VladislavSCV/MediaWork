"use client";

import { useEffect, useState } from "react";

export default function LiveMonitor() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws/monitor");

    ws.onmessage = (msg) => {
      const evt = JSON.parse(msg.data);
      setEvents((prev) => [evt, ...prev].slice(0, 100));
    };

    return () => ws.close();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Live Playback Monitor</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-sm opacity-60 border-b border-white/20">
            <th className="p-3">Screen</th>
            <th className="p-3">Campaign</th>
            <th className="p-3">Time</th>
            <th className="p-3">Duration</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="p-3">#{e.screen_id}</td>
              <td className="p-3">#{e.campaign_id}</td>
              <td className="p-3">{e.played_at}</td>
              <td className="p-3">{e.duration}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
