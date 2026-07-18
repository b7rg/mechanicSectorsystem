"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ExternalLink,
  LogIn,
} from "lucide-react";

import VideoBackground from "./VideoBackground";

type HeroProps = {
  sectorName: string;
  englishName: string;
  description: string;
  discordUrl?: string;
};

export default function Hero({
  sectorName,
  englishName,
  description,
  discordUrl = "",
}: HeroProps) {
  const validDiscordUrl =
    discordUrl.startsWith("https://") ||
    discordUrl.startsWith("http://");

  return (
    <section
      dir="rtl"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-28"
    >
      <VideoBackground />

      {/* طبقة تعتيم خفيفة لإظهار النص */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" />

      {/* تدرج أسفل الخلفية */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/10 via-black/20 to-[#080808]" />

      {/* إضاءة ذهبية خلف النص */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.07] blur-[150px]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
        <motion.p
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="text-sm font-black tracking-[8px] text-yellow-400 sm:text-lg sm:tracking-[12px]"
        >
          MSS
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.7,
          }}
          className="mx-auto mt-6 max-w-5xl break-words text-5xl font-black leading-[1.15] text-white sm:text-6xl lg:text-8xl"
        >
          {englishName}
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
            duration: 0.6,
          }}
          className="mt-5 text-2xl font-black text-yellow-400 sm:text-3xl"
        >
          {sectorName}
        </motion.p>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
            duration: 0.7,
          }}
          className="mx-auto mt-8 max-w-3xl text-base leading-9 text-zinc-300 sm:text-lg lg:text-xl lg:leading-10"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.75,
            duration: 0.7,
          }}
          className="mt-11 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full bg-yellow-500 px-8 py-4 font-black text-black shadow-lg shadow-yellow-500/10 transition hover:scale-105 hover:bg-yellow-400"
          >
            <LogIn size={19} />
            دخول النظام
          </Link>

          {validDiscordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-500/10 px-8 py-4 font-bold text-yellow-400 backdrop-blur-xl transition hover:scale-105 hover:border-yellow-500/50 hover:bg-yellow-500/15"
            >
              <ExternalLink size={19} />
              ديسكورد القطاع
            </a>
          )}

          <a
            href="#about"
            className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-xl transition hover:scale-105 hover:border-yellow-500/50 hover:text-yellow-400"
          >
            تعرف على القطاع
          </a>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1.2,
        }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 animate-bounce items-center justify-center rounded-full border border-white/10 bg-black/30 p-4 text-yellow-400 backdrop-blur-xl transition hover:border-yellow-500/40"
        aria-label="الانتقال إلى قسم التعريف"
      >
        <ArrowDown size={21} />
      </motion.a>
    </section>
  );
}