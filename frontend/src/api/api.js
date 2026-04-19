import axios from "axios";

function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL || "").trim();

  if (!configured) {
    return "/api";
  }

  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured.replace(/\/+$/, "");
  }

  return `/${configured.replace(/^\/+|\/+$/g, "")}`;
}

export const API = axios.create({
  baseURL: resolveApiBaseUrl()
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallbackMessage;
}

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}
