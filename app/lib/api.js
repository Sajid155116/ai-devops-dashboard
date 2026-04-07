import { clearJwtToken, getJwtToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function isAbsoluteUrl(path) {
  return /^https?:\/\//i.test(path);
}

function buildUrl(path) {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}${normalizedPath}`;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    data,
    headers = {},
    auth = true,
    redirectOn401 = true
  } = options;

  const requestHeaders = { ...headers };

  if (auth) {
    const token = getJwtToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const requestOptions = {
    method,
    headers: requestHeaders
  };

  if (typeof data !== "undefined") {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    if (isFormData) {
      requestOptions.body = data;
    } else {
      requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
      requestOptions.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(buildUrl(path), requestOptions);
    const payload = await parseResponseBody(response);

    if (response.status === 401 && redirectOn401 && typeof window !== "undefined") {
      clearJwtToken();
      window.location.href = "/login";
    }

    if (!response.ok) {
      const message =
        (payload && typeof payload === "object" && payload.message) ||
        (typeof payload === "string" && payload) ||
        "Request failed.";

      throw new ApiError(message, response.status, payload);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Network error. Please try again.", 0, null);
  }
}