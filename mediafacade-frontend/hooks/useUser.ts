"use client";

import { useState, useEffect } from "react";
import type { Role } from "@/lib/roles";

export function useUser() {
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: Role;
  } | null>(null);

  useEffect(() => {
    // Решение предупреждения: ставим обновление state в microtask
    Promise.resolve().then(() => {
      setUser({
        id: 1,
        name: "Vladislav Scvorcov",
        email: "vs@mediawork.io",
        role: "admin", 
      });
    });
  }, []);

  return user;
}
