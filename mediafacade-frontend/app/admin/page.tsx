"use client";
import { useEffect, useState } from "react";
import {
  getScreens,
  getFormats,
  getOperators,
  createScreen,
  deleteScreen,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [formats, setFormats] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [showForm, setShowForm] = useState(false);

  async function reload() {
    const [s, f, o] = await Promise.all([
      getScreens(),
      getFormats(),
      getOperators(),
    ]);
    setScreens(s);
    setFormats(f);
    setOperators(o);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    await createScreen(form);
    setForm({});
    setShowForm(false);
    reload();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#040711] via-[#0b1222] to-[#01030a] text-gray-100 p-10">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-wide text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            ⚙️ Панель управления медиафасадами
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition text-white shadow-[0_0_10px_rgba(0,255,255,0.3)]"
          >
            ➕ Добавить экран
          </button>
        </header>

        {/* GRID ЭКРАНОВ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {screens.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative group bg-[#0e172a] rounded-xl border border-cyan-700/30 hover:border-cyan-400/50 transition overflow-hidden shadow-lg hover:shadow-cyan-400/30"
              >
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.4),transparent_60%)]" />
                <div className="p-5 space-y-3">
                  <h2 className="text-lg font-semibold text-cyan-300">
                    #{s.id} — {s.format_name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Оператор: <span className="text-gray-200">{s.operator_name}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Размер: <span className="text-gray-200">{s.width}×{s.height}px</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Хронометраж: <span className="text-gray-200">{s.duration}s</span>
                  </p>
                  {s.comment && (
                    <p className="text-xs text-gray-500 italic">
                      “{s.comment}”
                    </p>
                  )}
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={async () => {
                        await deleteScreen(s.id);
                        reload();
                      }}
                      className="px-3 py-1 text-sm text-red-400 border border-red-500/40 rounded hover:bg-red-500/20 active:scale-95 transition"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>

      {/* МОДАЛКА ДОБАВЛЕНИЯ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0c1424] border border-cyan-600/30 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.15)] p-8 w-[400px] space-y-4 relative"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                ➕ Добавить новый экран
              </h2>

              <select
                className="w-full bg-transparent border border-cyan-600/40 p-2 rounded-md text-sm outline-none focus:border-cyan-400"
                onChange={(e) => setForm({ ...form, format_id: +e.target.value })}
              >
                <option>Выбери формат</option>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <select
                className="w-full bg-transparent border border-cyan-600/40 p-2 rounded-md text-sm outline-none focus:border-cyan-400"
                onChange={(e) => setForm({ ...form, operator_id: +e.target.value })}
              >
                <option>Выбери оператора</option>
                {operators.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Ширина"
                  className="bg-transparent border border-cyan-600/40 p-2 rounded text-sm"
                  onChange={(e) => setForm({ ...form, width: +e.target.value })} />
                <input type="number" placeholder="Высота"
                  className="bg-transparent border border-cyan-600/40 p-2 rounded text-sm"
                  onChange={(e) => setForm({ ...form, height: +e.target.value })} />
              </div>

              <input type="number" placeholder="Хронометраж (сек)"
                className="w-full bg-transparent border border-cyan-600/40 p-2 rounded text-sm"
                onChange={(e) => setForm({ ...form, duration: +e.target.value })} />

              <input type="number" placeholder="Размер шрифта (px)"
                className="w-full bg-transparent border border-cyan-600/40 p-2 rounded text-sm"
                onChange={(e) => setForm({ ...form, font_size: +e.target.value })} />

              <input placeholder="Комментарий"
                className="w-full bg-transparent border border-cyan-600/40 p-2 rounded text-sm"
                onChange={(e) => setForm({ ...form, comment: e.target.value })} />

              <input placeholder="Ссылка на ТТ"
                className="w-full bg-transparent border border-cyan-600/40 p-2 rounded text-sm"
                onChange={(e) => setForm({ ...form, tt_link: e.target.value })} />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 text-gray-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 rounded-md hover:bg-cyan-500 text-white font-medium"
                >
                  Сохранить
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
