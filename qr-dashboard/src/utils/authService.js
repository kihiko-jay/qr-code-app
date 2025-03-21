// src/utils/authService.js
const API_URL = "http://localhost:5000/api/auth";

export const signup = async (userData) => {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const login = async (userData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
  });
  return res.json();
};

export const logout = async () => {
  await fetch(`${API_URL}/logout`, { credentials: "include" });
};

export const verifyToken = async () => {
  const res = await fetch(`${API_URL}/verify`, { credentials: "include" });
  return res.json();
};
