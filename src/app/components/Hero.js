
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [date, setDate] = useState("");

  useEffect(() => {
    
const currentDate = new Intl.DateTimeFormat("bn-BD", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());


    setDate(currentDate);
  }, []);

  return (
    <section className="bg-[#f0f5ef] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto grid max-w-6xl items-center gap-3 overflow-hidden rounded-[18px] border border-[#e1e9e0] bg-[#fbfdfb] px-5 py-5 sm:grid-cols-[1.5fr_0.8fr] sm:px-8 sm:py-7 lg:px-10">
        <div className="order-2 sm:order-1">
          <span className="inline-flex rounded-full bg-[#e0f2e5] px-3 py-1 text-[11px] font-semibold text-[#078b48]">
            {date}
          </span>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[#26352b] sm:text-3xl lg:text-[38px]">
            আজকের বাজারের দাম এক নজরে
          </h1>

          <p className="mt-3 max-w-[520px] text-xs leading-6 text-[#69736b] sm:text-sm">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
            বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন ও সর্বোচ্চ
            দাম এবং বাজারের পরিবর্তন এক জায়গায়।
          </p>

          <Link
            href="/#সব-পণ্য"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-[#078b48] px-5 py-3 text-xs font-bold text-white shadow-[0_3px_0_#056b37] transition hover:bg-[#06753e] active:translate-y-0.5 active:shadow-none sm:text-sm"
          >
            সব পণ্য দেখুন →
          </Link>
        </div>

        <div className="order-1 flex items-center justify-center sm:order-2">
          <Image
            src="/bazar-hero.png"
            alt="বাজারের পণ্যের ঝুড়ি"
            width={500}
            height={400}
            priority
            className="h-[145px] w-full max-w-[250px] object-contain sm:h-[190px] lg:h-[210px]"
          />
        </div>
      </div>
    </section>
  );
}
