export function getStoredValue(key) {
  return sessionStorage.getItem(key);
}

export function setStoredValue(key, value) {
  sessionStorage.setItem(key, value);
}

export function removeStoredValue(key) {
  sessionStorage.removeItem(key);
}

export function clearStoredSession() {
  sessionStorage.clear();
}
