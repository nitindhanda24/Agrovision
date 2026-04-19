import axios from "axios";
import { getStoredValue } from "../utils/storage";

function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL || "").trim();

  if (!configured) {
    return "/api";
  }

  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    const normalized = configured.replace(/\/+$/, "");

    try {
      const url = new URL(normalized);
      const pathname = url.pathname.replace(/\/+$/, "");

      if (!pathname || pathname === "/") {
        return `${url.origin}/api`;
      }

      return normalized;
    } catch {
      return normalized;
    }
  }

  return `/${configured.replace(/^\/+|\/+$/g, "")}`;
}

function getApiOrigin() {
  const baseUrl = resolveApiBaseUrl();

  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    try {
      return new URL(baseUrl).origin;
    } catch {
      return "";
    }
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export const API = axios.create({
  baseURL: resolveApiBaseUrl()
});

API.interceptors.request.use((config) => {
  const token = getStoredValue("token");
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

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  const apiOrigin = getApiOrigin();

  if (!apiOrigin) {
    return normalizedPath;
  }

  return `${apiOrigin}${normalizedPath}`;
}
