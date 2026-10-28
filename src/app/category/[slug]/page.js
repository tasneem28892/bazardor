"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpDown, ChevronDown } from "lucide-react";

const BASE_URL = "https://api.abcz.workers.dev/api/bazardor";

const categoryNames = {
  chal: "চাল",
  dal: "ডাল",
  tel: "তেল",
  sobji: "সবজি",
  mach: "মাছ",
  mangsho: "মাংস",
  "dim-dui": "ডিম ও দুধ",
  mosla: "মসলা",
};

const categoryIcons = {
  chal: "🍚",
  dal: "🫘",
  tel: "🫙",
  sobji: "🥬",
  mach: "🐟",
  mangsho: "🍗",
  "dim-dui": "🥚",
  mosla: "🌶️",
};

const formatBn = (value) =>
  Number(value || 0).toLocaleString("bn-BD");

function parsePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? "")
    .replace(/[০-৯]/g, (digit) => "০১২৩৪৫৬৭৮৯".indexOf(digit))
    .replace(/,/g, "")
    .trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

function getProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;

  return [];
}

function getPrice(product) {
  const value =
    product?.today ??
    product?.price ??
    product?.currentPrice ??
    product?.current_price ??
    product?.averagePrice ??
    product?.average_price ??
    0;

  if (typeof value === "object" && value !== null) {
    return parsePrice(value.amount ?? value.price ?? 0);
  }

  return parsePrice(value);
}

function getChange(product) {
  const change =
    product?.change ??
    product?.changePercent ??
    product?.change_percent ??
    product?.priceChange ??
    product?.price_change ??
    0;

  if (typeof change === "object" && change !== null) {
    const percent = parsePrice(
      change.pct ?? change.percent ?? change.value ?? 0
    );

    if (change.dir === "up") return Math.abs(percent);
    if (change.dir === "down") return -Math.abs(percent);

    return percent;
  }

  return parsePrice(change);
}

function getCategorySlug(product) {
  const category =
    product?.categorySlug ??
    product?.category_slug ??
    product?.category;

  if (typeof category === "string") {
    return category.toLowerCase();
  }

  if (typeof category === "object" && category !== null) {
    return String(
      category.slug ??
        category.categorySlug ??
        category.category_slug ??
        category.id ??
        ""
    ).toLowerCase();
  }

  return "";
}

function getUnit(product) {
  const unit = product?.unitBn ?? product?.unit_bn ?? product?.unit;

  const units = {
    kg: "প্রতি কেজি",
    kilogram: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    l: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
    pcs: "প্রতি পিস",
  };

  if (!unit) return "একক উল্লেখ নেই";

  return units[String(unit).toLowerCase()] || unit;
}

function getProductName(product) {
  return (
    product?.nameBn ??
    product?.name_bn ??
    product?.name ??
    product?.title ??
    "নাম পাওয়া যায়নি"
  );
}

function getProductEmoji(product, categoryIcon) {
  return (
    product?.emoji ??
    product?.imageEmoji ??
    product?.categoryIcon ??
    categoryIcon
  );
}

function CategoryPageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 animate-pulse">
          <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
          <div className="mt-4 h-9 w-64 max-w-full rounded bg-gray-200" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="mb-4 h-16 w-16 rounded-xl bg-gray-200" />
              <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mb-3 h-6 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm text-gray-500">
          পণ্যের তথ্য লোড হচ্ছে...
        </p>
      </div>
    </main>
  );
}

function CategoryPageContent() {
  const params = useParams();

  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const normalizedSlug = String(slug ?? "").toLowerCase();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [retryCount, setRetryCount] = useState(0);

  const categoryName = categoryNames[normalizedSlug] || "";
  const categoryIcon = categoryIcons[normalizedSlug] || "🛒";
  const invalidCategory = !categoryName;

  useEffect(() => {
    let cancelled = false;

    if (!slug || !categoryNames[normalizedSlug]) {
      setLoading(false);
      setProducts([]);
      setError("");

      return () => {
        cancelled = true;
      };
    }

    async function loadProducts() {
      setLoading(true);
      setError("");
      setProducts([]);

      try {
        const response = await fetch(
          `${BASE_URL}/products?category=${encodeURIComponent(normalizedSlug)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি।");
        }

        const data = await response.json();
        let list = getProductList(data);

        if (list.length === 0) {
          const allResponse = await fetch(`${BASE_URL}/products`, {
            cache: "no-store",
          });

          if (!allResponse.ok) {
            throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
          }

          const allData = await allResponse.json();
          const allProducts = getProductList(allData);

          list = allProducts.filter(
            (product) =>
              getCategorySlug(product) === normalizedSlug
          );
        } else {
          const hasCategoryInfo = list.some(
            (product) => getCategorySlug(product) !== ""
          );

          if (hasCategoryInfo) {
            list = list.filter(
              (product) =>
                getCategorySlug(product) === normalizedSlug
            );
          }
        }

        if (!cancelled) {
          setProducts(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "পণ্য লোড করতে সমস্যা হয়েছে।"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [slug, normalizedSlug, retryCount]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "low-to-high") {
      return getPrice(a) - getPrice(b);
    }

    if (sortBy === "high-to-low") {
      return getPrice(b) - getPrice(a);
    }

    return 0;
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
        >
          ← হোম পেজে ফিরে যাও
        </Link>

        {loading ? (
          <CategoryPageSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-4xl">⚠️</p>

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              পণ্যের তথ্য লোড করা যায়নি
            </h1>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-5 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800"
            >
              আবার চেষ্টা করো
            </button>
          </div>
        ) : invalidCategory || products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="text-5xl">🔎</p>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              {invalidCategory
                ? "এই ক্যাটাগরি পাওয়া যায়নি"
                : "কোনো পণ্য পাওয়া যায়নি"}
            </h1>

            <p className="mt-2 text-gray-500">
              অন্য ক্যাটাগরি নির্বাচন করো অথবা হোম পেজে ফিরে যাও।
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              হোম পেজে ফিরে যাও
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-green-700">
                বাজারদর
              </p>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {categoryIcon} {categoryName} এর বাজারদর
              </h1>

              <p className="mt-3 text-gray-600">
                আজকের {categoryName} এর দাম এক নজরে দেখে নাও।
              </p>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                মোট {formatBn(sortedProducts.length)}টি পণ্য পাওয়া গেছে
              </p>

              <label className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:self-auto">
                <ArrowUpDown size={17} className="text-green-700" />

                <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                  সাজান:
                </span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="max-w-[190px] cursor-pointer bg-transparent text-sm font-semibold text-gray-800 outline-none"
                >
                  <option value="default">ডিফল্ট</option>
                  <option value="low-to-high">
                    দাম: কম থেকে বেশি
                  </option>
                  <option value="high-to-low">
                    দাম: বেশি থেকে কম
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="shrink-0 text-gray-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product, index) => {
                const price = getPrice(product);
                const change = getChange(product);
                const isUp = change > 0;
                const isDown = change < 0;

                const productSlug =
                  product.slug ?? product.id ?? product._id;

                if (productSlug == null) {
                  return (
                    <article
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-4xl">
                        {getProductEmoji(product, categoryIcon)}
                      </p>

                      <h2 className="mt-4 font-bold text-gray-900">
                        {getProductName(product)}
                      </h2>

                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatBn(price)} টাকা
                      </p>
                    </article>
                  );
                }

                return (
                  <Link
                    key={product.id ?? product.slug ?? index}
                    href={`/product/${encodeURIComponent(String(productSlug))}`}
                    className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 text-5xl">
                      {getProductEmoji(product, categoryIcon)}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700">
                      {getProductName(product)}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {getUnit(product)}
                    </p>

                    <div className="mt-5">
                      <p className="text-sm text-gray-500">
                        আজকের দাম
                      </p>

                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatBn(price)} টাকা
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                      <span className="text-sm text-gray-500">
                        দামের পরিবর্তন
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          isUp
                            ? "bg-green-50 text-green-700"
                            : isDown
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isUp ? "▲ " : isDown ? "▼ " : "—"}
                        {formatBn(Math.abs(change))}%
                      </span>
                    </div>

                    <p className="mt-5 text-center font-semibold text-green-700">
                      বিস্তারিত দেখো →
                    </p>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPageContent />
    </Suspense>
  );
}