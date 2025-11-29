"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  async function doLogin() {
    console.log("doLogin called with", email, pass);
    const res = await fetch("http://localhost:8080/api/portal/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
      headers: { "Content-Type": "application/json" },
    });

    console.log("response", res);

    if (!res.ok) {
      console.log("invalid login");
      alert("Invalid login");
      return;
    }

    const data = await res.json();
    console.log("data", data);
    localStorage.setItem("advertiser_token", data.token);
    router.push("/portal/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f14] text-white">
      <div className="bg-[#11161d] border border-white/10 p-10 rounded-2xl w-[360px]">
        <h1 className="text-2xl mb-6 font-semibold text-center">Advertiser Login</h1>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Email"
            className="bg-[#0d1117] border border-white/10 px-4 py-2 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            className="bg-[#0d1117] border border-white/10 px-4 py-2 rounded-md"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            onClick={doLogin}
            className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
