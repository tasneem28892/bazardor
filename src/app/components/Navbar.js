
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";

const BASE_URL = "https://api.abcz.workers.dev/api/bazardor";

function bn(value) {
  return Number(value || 0).toLocaleString("bn-BD");
}

function getName(item) {
  if (typeof item === "string") return item;

  return (
    item?.nameBn ||
    item?.name_bn ||
    item?.name ||
    item?.title ||
    item?.slug ||
    "পণ্য"
  );
}

function getSlug(item) {
  if (typeof item === "string") return item;

  return item?.slug || item?.id || item?.nameBn || "";
}

function getPrice(item) {
  return Number(
    item?.price ??
      item?.currentPrice ??
      item?.current_price ??
      0
  );
}

function getChange(item) {
  return Number(
    item?.changePercent ??
      item?.change_percent ??
      item?.priceChange ??
      item?.price_change ??
      item?.change ??
      0
  );
}

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [date, setDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    setDate(
      new Intl.DateTimeFormat("bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );

    async function loadData() {
      try {
        const [categoryResponse, productResponse] =
          await Promise.all([
            fetch(`${BASE_URL}/categories`),
            fetch(`${BASE_URL}/products`),
          ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error("বাজারের তথ্য লোড করা যায়নি");
        }

        const categoryData = await categoryResponse.json();
        const productData = await productResponse.json();

        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : categoryData.categories || categoryData.data || [];

        const productList = Array.isArray(productData)
          ? productData
          : productData.products || productData.data || [];

        setCategories(categoryList);
        setProducts(productList);
      } catch (error) {
        console.error("বাজারের তথ্য লোড করতে সমস্যা:", error);
      }
    }

    loadData();
  }, []);

  return (
    <header className="relative z-40 border-t-[3px] border-[#202a23] bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Logo and profile */}
        <div className="flex h-[58px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-icon.png"
              alt="বাজার দর লোগো"
              width={36}
              height={36}
              priority
              className="h-9 w-9 shrink-0 rounded-lg object-contain"
            />

            <div>
              <h1 className="text-[16px] font-extrabold leading-5 text-[#26352b]">
                বাজার দর
              </h1>

              <p className="text-[10px] text-gray-500">
                {date || "আজকের বাজার"}
              </p>
            </div>
          </Link>

          <Link
            href="/signin"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[#26352b] hover:bg-gray-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7eee8]">
              <UserRound size={15} />
            </div>

            <span className="text-[11px] font-medium">
              সাইন ইন
            </span>

            <ChevronDown size={12} />
          </Link>
        </div>

        {/* Category navigation */}
        <nav className="flex items-center justify-start gap-5 overflow-x-auto border-t border-[#f0f2ef] py-3 sm:justify-center sm:gap-7">
          <Link
            href="/#সব-পণ্য"
            onClick={() => setActiveCategory("")}
            className={`shrink-0 text-[11px] font-semibold ${
              activeCategory === ""
                ? "text-[#078b48]"
                : "text-[#344138]"
            }`}
          >
            🛒 সব
          </Link>

          {categories.map((category, index) => {
            const name = getName(category);
            const slug = getSlug(category);

            return (
              <Link
                key={slug || index}
                href={`/category/${encodeURIComponent(slug)}`}
                onClick={() => setActiveCategory(name)}
                className={`shrink-0 text-[11px] font-semibold transition ${
                  activeCategory === name
                    ? "text-[#078b48]"
                    : "text-[#344138] hover:text-[#078b48]"
                }`}
              >
                <span className="mr-1">
                  {category.icon || "🛒"}
                </span>
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile category navigation */}
        <div className="border-t border-gray-100 py-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full py-1 text-xs font-semibold text-[#078b48]"
          >
            {menuOpen ? "বিভাগ বন্ধ করুন ×" : "সব বিভাগ দেখুন ☰"}
          </button>

          {menuOpen && (
            <nav className="flex flex-wrap gap-2 pt-3">
              {categories.map((category, index) => {
                const name = getName(category);
                const slug = getSlug(category);

                return (
                  <Link
                    key={slug || index}
                    href={`/category/${encodeURIComponent(slug)}`}
                    onClick={() => {
                      setActiveCategory(name);
                      setMenuOpen(false);
                    }}
                    className="rounded-full border border-[#dce9df] px-3 py-2 text-xs text-[#344138]"
                  >
                    {category.icon || "🛒"} {name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Scrolling price ticker */}
      <div className="overflow-hidden border-y border-[#e9eee9] bg-[#fafcf9]">
        <div className="flex h-[35px] items-center overflow-hidden">
          <div className="ticker-track flex w-max shrink-0 items-center">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-center"
              >
                {products.length > 0 ? (
                  products.map((product, index) => {
                    const change = getChange(product);

                    return (
                      <span
                        key={`${copy}-${product.id || index}`}
                        className="mx-3 flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] sm:text-[11px]"
                      >
                        <span>{product.emoji || "🛒"}</span>

                        <span className="text-[#344138]">
                          {getName(product)}
                        </span>

                        <span className="text-gray-500">
                          {bn(getPrice(product))} টাকা/একক
                        </span>

                        <span
                          className={
                            change > 0
                              ? "font-bold text-red-500"
                              : change < 0
                              ? "font-bold text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {change > 0
                            ? "▲ "
                            : change < 0
                            ? "▼ "
                            : "—"}
                          {bn(Math.abs(change))}%
                        </span>
                      </span>
                    );
                  })
                ) : (
                  <span className="mx-4 whitespace-nowrap text-[11px] text-gray-500">
                    🛒 নিত্যপ্রয়োজনীয় পণ্যের আজকের বাজারদর
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          animation: market-ticker 45s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes market-ticker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
}
