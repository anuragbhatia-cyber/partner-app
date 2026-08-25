"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { getValidSession } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function SplashPage() {
  const [checked, setChecked] = useState(false);
  const homeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (getValidSession()) {
      homeLinkRef.current?.click();
    } else {
      setChecked(true);
    }
  }, []);

  return (
    <PhoneFrame label="Splash" statusBarClassName="bg-black text-white">
      <a
        ref={homeLinkRef}
        href="/home"
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        Home
      </a>
      {checked ? (
        <Link
          href="/otp"
          className="flex-1 flex flex-col items-center justify-between py-16 bg-black text-white active:opacity-90 transition-opacity"
        >
          <div />
          <Image
            src="/lawyered-logo.png"
            alt="Lawyered"
            width={841}
            height={259}
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
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between py-16 bg-black text-white">
          <div />
          <Image
            src="/lawyered-logo.png"
            alt="Lawyered"
            width={841}
            height={259}
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
        </div>
      )}
    </PhoneFrame>
  );
}
