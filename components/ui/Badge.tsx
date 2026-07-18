import { ReactNode } from "react";

export default function Badge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-sm font-semibold text-yellow-400">
      {children}
    </span>
  );
}