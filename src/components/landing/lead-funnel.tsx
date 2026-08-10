import { CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";

const scattered = [
  { icon: MessageSquare, rotate: -10, top: 0, left: 0, opacity: 0.5 },
  { icon: Mail, rotate: 6, top: 24, left: 20, opacity: 0.75 },
  { icon: Phone, rotate: -6, top: 48, left: 6, opacity: 1 },
];

export function LeadFunnel() {
  return (
    <div className="mt-6 flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-6">
      <div className="relative h-20 w-20 shrink-0">
        {scattered.map(({ icon: Icon, rotate, top, left, opacity }, i) => (
          <div
            key={i}
            className="orbit-float absolute flex size-9 items-center justify-center rounded-lg border border-white/10 bg-surface-elevated text-text-tertiary"
            style={{
              transform: `rotate(${rotate}deg)`,
              top,
              left,
              opacity,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <Icon className="size-4" />
          </div>
        ))}
      </div>

      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
        <span
          className="funnel-flow-dot absolute size-2 rounded-full bg-accent-gradient"
          style={{ top: "50%", marginTop: "-4px" }}
        />
        <span
          className="funnel-flow-dot absolute size-2 rounded-full bg-accent-gradient"
          style={{ top: "50%", marginTop: "-4px", animationDelay: "1.2s" }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-success">
        <CheckCircle2 className="size-5 shrink-0" />
        <span className="text-xs font-semibold whitespace-nowrap">Qualified Lead</span>
      </div>
    </div>
  );
}
