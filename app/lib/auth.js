export function hasJwtToken() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return Boolean(localStorage.getItem("jwt"));
  } catch {
    return false;
  }
}

export function getJwtToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("jwt");
  } catch {
    return null;
  }
}

export function clearJwtToken() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("jwt");
  } catch {
    return;
  }
}