export const API_URL = "http://localhost:5000/api";

export async function getFacades() {
  const res = await fetch("http://localhost:8080/api/facades");
  return res.json();
}

export async function getFacade(id: number) {
  const res = await fetch(`http://localhost:8080/api/facades/${id}`);
  return res.json();
}

export async function getScreens() {
  const res = await fetch(`${API_URL}/screens`, { cache: "no-store" });
  return res.json();
}

export async function getScreen(id: number) {
  const res = await fetch(`${API_URL}/screens/${id}`, { cache: "no-store" });
  return res.json();
}

export async function getFormats() {
  const res = await fetch(`${API_URL}/formats`);
  return res.json();
}

export async function getOperators() {
  const res = await fetch(`${API_URL}/operators`);
  return res.json();
}

export async function createScreen(data: any) {
  const res = await fetch(`${API_URL}/screens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteScreen(id: number) {
  await fetch(`${API_URL}/screens/${id}`, { method: "DELETE" });
}
