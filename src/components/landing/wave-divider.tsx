/**
 * WaveDivider — sectionlar orasida SVG to'lqin bo'luvchi
 * direction: "down" (tepadan pastga) | "up" (pastdan tepaga)
 */
export function WaveDivider({
  direction = "down",
  fillColor = "var(--background)",
  className = "",
}: {
  direction?: "down" | "up";
  fillColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none overflow-hidden leading-none ${className}`}
      aria-hidden
      style={direction === "up" ? { transform: "rotate(180deg)" } : undefined}
    >
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
        style={{ display: "block", height: "72px" }}
      >
        {/* Ikki to'lqin qatlami — gradient effekt */}
        <path
          d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1350,20 1440,40 L1440,80 L0,80 Z"
          fill={fillColor}
          opacity="0.4"
        />
        <path
          d="M0,55 C240,10 480,90 720,55 C960,20 1200,90 1440,55 L1440,80 L0,80 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}
