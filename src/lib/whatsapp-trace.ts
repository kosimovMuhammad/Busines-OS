// Development-only [WA-ES] trace for the WhatsApp Embedded Signup flow. Logs to the browser
// console and forwards each step to the backend dev log (POST /whatsapp/embedded-signup/debug).
// A no-op in production builds. Never pass one-time codes, tokens or the signed state in here;
// the backend also redacts those keys defensively.

type Sink = (step: string, data?: Record<string, unknown>) => void;

const enabled = process.env.NODE_ENV === "development";
let sink: Sink | null = null;

export function setWaTraceSink(next: Sink | null) {
  sink = next;
}

export function waTrace(step: string, data?: Record<string, unknown>) {
  if (!enabled) return;
  if (data) console.info("[WA-ES]", step, data);
  else console.info("[WA-ES]", step);
  try {
    sink?.(step, data);
  } catch {
    // diagnostics must never break the flow
  }
}

// Keys of an object without its values, for payloads that may hold secrets.
export function waKeys(value: unknown): string[] {
  return value && typeof value === "object" ? Object.keys(value as object) : [];
}
