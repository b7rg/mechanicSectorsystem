import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: Props) {
  return (
    <input
      {...props}
      className={`
        w-full
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-5
        py-4
        text-white
        backdrop-blur-xl
        outline-none
        transition
        focus:border-yellow-500
        focus:ring-2
        focus:ring-yellow-500/30
        ${className}
      `}
    />
  );
}