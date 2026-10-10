
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

const formatBn = (value) =>
  Number(value || 0).toLocaleString("bn-BD");

function getProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  return [];
}

function getPrice(product) {
  return Number(
    product?.today ??
      product?.price ??
      product?.currentPrice ??
      product?.current_price ??
      0
  );
}

function getChange(product) {
  return Number(
    product?.change?.pct ??
      product?.changePercent ??
      product?.change_percent ??
      0
  );
}

function getUnit(unit) {
  const units = {
    kg: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
  };

  return units[unit] || unit || "একক উল্লেখ নেই";
}

export default function CategoryPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");
      setProducts([]);

      try {
        const url =
          `${BASE_URL}/products?category=${encodeURIComponent(slug)}`;

        let response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("পণ্য লোড করা যায়নি।");
        }

        let data = await response.json();
        let list = getProductList(data);

        // কিছু API category query উপেক্ষা করতে পারে।
        // সে ক্ষেত্রে সব product এনে category অনুযায়ী filter করা হবে।
        if (list.length === 0) {
          response = await fetch(`${BASE_URL}/products`, {
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
          }

          data = await response.json();
          list = getProductList(data);
        }

        const filteredProducts = list.filter(
          (product) =>
            String(product?.category || "").toLowerCase() ===
            String(slug).toLowerCase()
        );

        // API যদি আগে থেকেই category অনুযায়ী filter করা list দেয়,
        // category field না থাকলেও সেই list ব্যবহার করা হবে।
        const finalProducts =
          filteredProducts.length > 0
            ? filteredProducts
            : list.every(
                (product) =>
                  !product?.category ||
                  String(product.category).toLowerCase() ===
                    String(slug).toLowerCase()
              )
              ? list
              : [];

        if (!cancelled) {
          setProducts(finalProducts);
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
  }, [slug]);

  const categoryName = categoryNames[slug] || "পণ্য";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900"
        >
          ← হোম পেজে ফিরে যাও
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-green-700">
            বাজারদর
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {categoryName} এর বাজারদর
          </h1>

          <p className="mt-3 text-gray-600">
            আজকের {categoryName} এর দাম এক নজরে দেখে নাও।
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-white hover:bg-green-800"
            >
              আবার চেষ্টা করো
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-4xl">🛒</p>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              কোনো পণ্য পাওয়া যায়নি
            </h2>
            <p className="mt-2 text-gray-500">
              এই category-তে API থেকে কোনো product পাওয়া যায়নি।
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-2 text-white hover:bg-green-800"
            >
              সব পণ্য দেখো
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-gray-500">
              মোট {formatBn(products.length)}টি পণ্য পাওয়া গেছে
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => {
                const price = getPrice(product);
                const change = getChange(product);
                const direction = product?.change?.dir;
                const isUp =
                  direction === "up" ||
                  (!direction && change > 0);
                const isDown =
                  direction === "down" ||
                  (!direction && change < 0);

                return (
                  <article
                    key={product.id ?? product.slug ?? index}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 text-5xl">
                      {product.image ||
                        product.categoryIcon ||
                        "🛒"}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">
                      {product.nameBn ||
                        product.name_bn ||
                        product.name ||
                        product.title ||
                        "নাম পাওয়া যায়নি"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {getUnit(product.unitBn || product.unit_bn || product.unit)}
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
                        গত দিনের তুলনায়
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          isUp
                            ? "bg-red-50 text-red-600"
                            : isDown
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isUp ? "↑ " : isDown ? "↓ " : ""}
                        {formatBn(Math.abs(change))}%
                      </span>
                    </div>

                    {product.slug && (
                      <Link
                        href={`/product/${encodeURIComponent(product.slug)}`}
                        className="mt-5 block rounded-xl border border-green-700 py-2.5 text-center font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
                      >
                        বিস্তারিত দেখো →
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
