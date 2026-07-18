import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`
        rounded-2xl
        bg-gradient-to-r
        from-yellow-500
        to-yellow-400
        px-6
        py-3
        font-bold
        text-black
        shadow-lg
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-yellow-500/40
        active:scale-95
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}