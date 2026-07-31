import { Layers } from "lucide-react";

export function FullScreenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="bg-accent-gradient glow-accent flex size-14 animate-pulse items-center justify-center rounded-2xl text-white">
        <Layers className="size-7" />
      </div>
    </div>
  );
}
