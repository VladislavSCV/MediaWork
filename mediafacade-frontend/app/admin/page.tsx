"use client";
import { useEffect, useState } from "react";

type Facade = {
  id: number;
  name: string;
  description?: string;
  current_content_url?: string;
};

export default function AdminFacades() {
  const [facades, setFacades] = useState<Facade[]>([]);
  const [form, setForm] = useState<Partial<Facade>>({});

  // 🔹 загрузить фасады
  async function loadFacades() {
    const res = await fetch("http://localhost:8080/api/facades");
    const data = await res.json();
    setFacades(data);
  }

  useEffect(() => {
    loadFacades();
  }, []);

  // 🔹 создать фасад
  async function createFacade(e: React.FormEvent) {
    e.preventDefault();
    await fetch("http://localhost:8080/api/facades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({});
    loadFacades();
  }

  // 🔹 сменить видео (триггер WS)
  async function updateVideo(id: number, src: string) {
    await fetch(`http://localhost:8080/api/facades/${id}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    });
    loadFacades();
  }

  // 🔹 удалить фасад
  async function deleteFacade(id: number) {
    await fetch(`http://localhost:8080/api/facades/${id}`, { method: "DELETE" });
    loadFacades();
  }

  return (
    <main className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">🎛 Управление фасадами</h1>

      {/* === Добавление фасада === */}
      <form onSubmit={createFacade} className="grid gap-3 bg-gray-900 p-4 rounded-lg mb-8">
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Название фасада"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Описание (необязательно)"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="bg-blue-600 hover:bg-blue-700 transition p-2 rounded">
          ➕ Добавить фасад
        </button>
      </form>

      {/* === Таблица фасадов === */}
      <table className="w-full text-sm border border-gray-800">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Название</th>
            <th className="p-2 text-left">Описание</th>
            <th className="p-2 text-left">Контент</th>
            <th className="p-2 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {facades.map((f) => (
            <tr key={f.id} className="border-t border-gray-800">
              <td className="p-2">{f.id}</td>
              <td className="p-2 font-semibold">{f.name}</td>
              <td className="p-2">{f.description || "—"}</td>
              <td className="p-2 text-cyan-400 break-all">
                {f.current_content_url || "Нет видео"}
              </td>
              <td className="p-2 flex gap-2">
                <input
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                  placeholder="URL видео"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateVideo(f.id, (e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <button
                  onClick={() => deleteFacade(f.id)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
