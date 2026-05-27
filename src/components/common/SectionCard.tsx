import { cn } from "@/lib/utils";

export function SectionCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-7", className)} {...props} />;
}
