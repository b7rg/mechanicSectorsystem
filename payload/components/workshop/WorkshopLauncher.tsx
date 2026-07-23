import Link from "next/link";

export default function WorkshopLauncher() {
  return (
    <Link
      href="/workshop"
      aria-label="فتح ورشة علي حنش"
      className="group fixed bottom-5 left-5 z-[9999] flex items-center gap-3 rounded-2xl border border-white/15 bg-black/90 px-4 py-3 text-white shadow-2xl shadow-black/60 backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/50"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-500 font-black text-black">
        AH
      </span>

      <span className="text-right">
        <span className="block text-[10px] font-bold tracking-[0.16em] text-zinc-500">
          MSS WORKSHOP
        </span>
        <span className="block text-sm font-black text-white group-hover:text-yellow-300">
          ورشة علي حنش
        </span>
      </span>
    </Link>
  );
}
