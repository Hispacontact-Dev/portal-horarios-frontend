import { LOGOUT_BROADCAST_KEY } from "@/lib/session/constants";

export function writeBroadcastSignal(): void {
  localStorage.setItem(LOGOUT_BROADCAST_KEY, Date.now().toString());
}

export function onBroadcastLogout(callback: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === LOGOUT_BROADCAST_KEY) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
