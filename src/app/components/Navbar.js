"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  UserRound,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

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
    item?.todayPrice ??
      item?.today_price ??
      item?.today ??
      item?.price ??
      item?.currentPrice ??
      item?.current_price ??
      0
  );
}

function getChange(item) {
  const change = item?.change;

  if (change && typeof change === "object") {
    const percent = Number(change.pct ?? change.percent ?? 0);

    if (change.dir === "up") return Math.abs(percent);
    if (change.dir === "down") return -Math.abs(percent);

    return percent;
  }

  return Number(
    item?.changePercent ??
      item?.change_percent ??
      item?.priceChange ??
      item?.price_change ??
      change ??
      0
  );
}

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [date, setDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  async function handleSignOut() {
    try {
      const result = await authClient.signOut();

      if (result?.error) {
        toast.error(
          result.error.message || "সাইন আউট করা যায়নি।"
        );
        return;
      }

      setProfileOpen(false);
      toast.success("সফলভাবে সাইন আউট হয়েছে!");
      routerToHome();
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করো।");
    }
  }

  function routerToHome() {
    window.location.href = "/";
  }

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

          {/* Sign in or signed-in user */}
          <div className="relative">
            {isPending ? (
              <div className="flex items-center gap-1.5 px-2 py-1.5 text-[#26352b]">
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
                <span className="text-[11px]">লোড হচ্ছে</span>
              </div>
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-label="প্রোফাইল মেনু"
                  className="flex max-w-[190px] items-center gap-1.5 rounded-md px-2 py-1.5 text-[#26352b] transition hover:bg-gray-50"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7eee8]">
                    <UserRound size={15} />
                  </div>

                  <span className="max-w-[105px] truncate text-[11px] font-medium">
                    {user.name || user.email || "আমার অ্যাকাউন্ট"}
                  </span>

                  <ChevronDown
                    size={12}
                    className={`shrink-0 transition ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#e5ece5] bg-white p-2 shadow-lg">
                    <div className="border-b border-[#edf1ed] px-3 py-2">
                      <p className="truncate text-sm font-bold text-[#26352b]">
                        {user.name || "ব্যবহারকারী"}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>

                    {/* Profile link */}
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#26352b] transition hover:bg-[#f1f5ef]"
                    >
                      <UserRound size={15} />
                      আমার প্রোফাইল
                    </Link>

                    {/* Sign out */}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      সাইন আউট
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/signin"
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[#26352b] transition hover:bg-gray-50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7eee8]">
                    <UserRound size={15} />
                  </div>

                  <span className="text-[11px] font-medium">
                    সাইন ইন
                  </span>

                  <ChevronDown size={12} />
                </Link>

                <Link
                  href="/signup"
                  className="rounded-md bg-[#078641] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#066e35]"
                >
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>
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