export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.info("[event]", event, props ?? {});
  window.dispatchEvent(new CustomEvent("app:track", { detail: { event, props } }));
}
