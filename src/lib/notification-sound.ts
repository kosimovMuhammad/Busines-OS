/**
 * Plays a soft, pleasant notification "ding" using the Web Audio API.
 * No external files needed — the tone is generated programmatically.
 *
 * @param channel - The communication channel triggering the sound.
 *   WhatsApp / Instagram → higher pitched double-ping
 *   Telegram             → classic single ding
 */
export function playMessageSound(channel: "Whatsapp" | "Telegram" | "Instagram") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playTone = (freq: number, startAt: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + startAt);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);

      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration);
    };

    if (channel === "Telegram") {
      // Single soft ding — 880 Hz
      playTone(880, 0, 0.45, 0.25);
    } else if (channel === "Whatsapp") {
      // WhatsApp-style double ping
      playTone(1046, 0, 0.3, 0.2);
      playTone(1318, 0.18, 0.35, 0.2);
    } else if (channel === "Instagram") {
      // Slightly higher warm double ping
      playTone(1174, 0, 0.3, 0.18);
      playTone(1396, 0.2, 0.38, 0.18);
    }

    // Close the context shortly after — avoids leaking audio contexts
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Autoplay policy blocked or audio unavailable — silently ignore
  }
}
