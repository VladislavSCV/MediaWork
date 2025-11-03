"use client";
export default function ScreenModal({ screen, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-2">{screen.format_name}</h2>
        <p><strong>Оператор:</strong> {screen.operator_name}</p>
        <p><strong>Хронометраж:</strong> {screen.duration}s</p>
        <p><strong>Размер:</strong> {screen.width}×{screen.height}px</p>
        <p><strong>Шрифт:</strong> {screen.font_size || "—"}px</p>
        <p><strong>Комментарий:</strong> {screen.comment || "—"}</p>
        <a
          href={screen.tt_link}
          target="_blank"
          className="text-blue-600 hover:underline mt-2 block"
        >
          📄 Технические требования
        </a>
      </div>
    </div>
  );
}
