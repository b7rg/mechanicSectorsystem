import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";

import AgreementContent from "@/components/agreement/AgreementContent";

export const metadata: Metadata = {
  title: "اتفاقية القيادات | قطاع الميكانيك",
  description:
    "المعادلات المعتمدة للقيادات بين الأمن العام وأمن المنشآت والهلال الأحمر وكراج الميكانيك.",
};

export default function PublicAgreementPage() {
  return (
    <div className="min-h-screen bg-black">
      <div
        dir="rtl"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-5 md:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400"
        >
          <ArrowRight size={18} />
          الرئيسية
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-2.5 font-black text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
        >
          <LogIn size={18} />
          دخول لوحة الإدارة
        </Link>
      </div>

      <AgreementContent />
    </div>
  );
}
