import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_COLORS = [
  "bg-accent-primary/15 text-accent-primary",
  "bg-accent-secondary/15 text-accent-secondary",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
];

/**
 * Central glowing hub with icon "satellites" connected by animated flow-lines.
 * Positions are computed with trig at render time (deterministic, no client JS)
 * so this renders identically on server and client.
 */
export function OrbitGraphic({
  centerIcon: CenterIcon,
  nodes,
  size = 260,
  className,
}: {
  centerIcon: LucideIcon;
  nodes: LucideIcon[];
  size?: number;
  className?: string;
}) {
  const center = size / 2;
  const radius = center - 34;
  const hub = 64;
  const node = 44;

  const positions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  return (
    <div className={cn("relative mx-auto", className)} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-[18%] rounded-full border border-white/5" />

      <svg className="absolute inset-0" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="orbit-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {positions.map((p, i) => (
          <line
            key={`line-${i}`}
            x1={p.x}
            y1={p.y}
            x2={center}
            y2={center}
            stroke="url(#orbit-line)"
            strokeWidth={1.5}
          />
        ))}
        {positions.map((p, i) => (
          <circle key={`dot-${i}`} r={2.5} fill="var(--accent-primary)">
            <animateMotion
              dur="3s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
              path={`M ${p.x} ${p.y} L ${center} ${center}`}
            />
          </circle>
        ))}
      </svg>

      <div
        className="bg-accent-gradient glow-accent orbit-pulse absolute flex items-center justify-center rounded-2xl text-white"
        style={{
          left: center,
          top: center,
          width: hub,
          height: hub,
          transform: "translate(-50%, -50%)",
        }}
      >
        <CenterIcon className="size-7" />
      </div>

      {nodes.map((Icon, i) => {
        const p = positions[i];
        return (
          <div
            key={i}
            className="orbit-float absolute"
            style={{
              left: p.x,
              top: p.y,
              width: node,
              height: node,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <div
              className={cn(
                "flex size-full items-center justify-center rounded-xl border border-white/10 backdrop-blur-md",
                NODE_COLORS[i % NODE_COLORS.length]
              )}
            >
              <Icon className="size-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
