/** V389.2: Load Ably's official pre-built browser SDK only when realtime push is enabled.
 * Keeping the SDK outside the Next/Webpack import graph avoids its unsupported transpilation.
 * The script is loaded from Ably's official CDN and exposes window.Ably.Realtime.
 */
const ABLY_BROWSER_SRC_V389 = "https://cdn.ably.com/lib/ably.min-2.js";

type AblyMessageV389 = {data?: unknown};
export type AblyRealtimeClientV389 = {
  channels: {get(name: string): {subscribe(event: string, listener: (message: AblyMessageV389) => void): Promise<unknown> | unknown}};
  close(): void;
};
type AblyBrowserNamespaceV389 = {Realtime: new (options: {authUrl: string; authMethod: "GET"}) => AblyRealtimeClientV389};
type AblyBrowserWindowV389 = Window & {Ably?: AblyBrowserNamespaceV389};
let loadingAblyV389: Promise<AblyBrowserNamespaceV389> | null = null;

export function loadAblyBrowserV389(): Promise<AblyBrowserNamespaceV389> {
  if (typeof window === "undefined") return Promise.reject(new Error("Ably browser SDK requires a browser"));
  const view = window as AblyBrowserWindowV389;
  if (view.Ably?.Realtime) return Promise.resolve(view.Ably);
  if (loadingAblyV389) return loadingAblyV389;
  loadingAblyV389 = new Promise<AblyBrowserNamespaceV389>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = ABLY_BROWSER_SRC_V389;
    script.async = true;
    script.crossOrigin = "anonymous";
    const timeout = window.setTimeout(() => fail(new Error("Ably SDK loading timed out")), 12000);
    const cleanup = () => {window.clearTimeout(timeout);script.onload = null;script.onerror = null;};
    const fail = (error: Error) => {cleanup();script.remove();reject(error);};
    script.onload = () => {
      cleanup();
      if (view.Ably?.Realtime) resolve(view.Ably);
      else fail(new Error("Ably SDK did not expose Realtime"));
    };
    script.onerror = () => fail(new Error("Ably browser SDK failed to load"));
    document.head.appendChild(script);
  }).catch(error => {loadingAblyV389 = null;throw error;});
  return loadingAblyV389;
}
