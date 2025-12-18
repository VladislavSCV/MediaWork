"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

export default function BootstrapPage() {
  const router = useRouter();

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("advertiser_token");

      // 1. Нет токена → регистрация
      if (!token) {
        router.replace("/portal/login");
        return;
      }

      try {
        // 2. Пробуем получить профиль
        const me = await apiFetch<any>("/me");

        if (!me || !me.id) {
          router.replace("/portal/login");
          return;
        }

        // 4. Всё ок
        router.replace("/portal");
      } catch (e) {
        // токен битый / 401 / 500
        router.replace("/portal/login");
      }
    }

    bootstrap();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      Initializing workspace…
    </div>
  );
}
