"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import Image from "next/image";
import Link from "next/link";

export default function SplashPage() {
  return (
    <PhoneFrame label="Splash">
      <Link
        href="/otp"
        className="absolute inset-0 z-50 flex flex-col items-center justify-between py-16 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black text-white active:opacity-90 transition-opacity"
      >
        <div />
        <Image
          src="/lawyered-logo.png"
          alt="Lawyered"
          width={640}
          height={160}
          priority
          className="w-[70%] max-w-[280px] h-auto"
        />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-white/40 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </Link>
    </PhoneFrame>
  );
}
