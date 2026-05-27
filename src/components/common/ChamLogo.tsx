import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChamLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200", className)} aria-label="Logo CHẠM">
      <span className="absolute inset-1 rounded-full border border-white/35" />
      <Hand className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}
