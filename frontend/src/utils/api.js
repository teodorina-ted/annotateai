const API = process.env.REACT_APP_API_URL || "https://annotateai.onrender.com";

function getToken() { return localStorage.getItem("token"); }
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: "Bearer " + token } : {};
}

export async function login(username, password) {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Login failed");
  return res.json();
}

export async function register(username, password, email = "", role = "user") {
  const res = await fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Register failed");
  return res.json();
}

export async function detect(imageUrl) {
  const res = await fetch(API + "/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ image_url: imageUrl }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Detection failed");
  return res.json();
}

export async function getImages() {
  const res = await fetch(API + "/images", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export function isLoggedIn() { return !!getToken(); }
export function getUsername() { return localStorage.getItem("username") || "Guest"; }
export function getRole() { return localStorage.getItem("role") || "guest"; }
export function logout() { localStorage.clear(); window.location.href = "/auth"; }

export async function deleteImage(id) {
  const res = await fetch(API + "/images/" + id, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function bulkDelete(ids) {
  const res = await fetch(API + "/images/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Bulk delete failed");
  return res.json();
}

export async function getPendingImages() {
  const res = await fetch(API + "/images", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return (data.images || []).filter(i => !i.status || i.status === "pending");
}

export async function getImageById(id) {
  const res = await fetch(API + "/images/" + id, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}
