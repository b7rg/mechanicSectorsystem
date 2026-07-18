import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-yellow-500/10
        bg-white/5
        backdrop-blur-2xl
        shadow-[0_10px_40px_rgba(0,0,0,0.45)]
        transition-all
        duration-300
        hover:border-yellow-400/30
        hover:shadow-[0_0_35px_rgba(234,179,8,0.15)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}