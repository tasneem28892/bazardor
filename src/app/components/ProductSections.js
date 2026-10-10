
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, RefreshCw } from "lucide-react";

const BASE_URL = "https://api.abcz.workers.dev/api/bazardor";

function bn(value) {
  return Number(value || 0).toLocaleString("bn-BD");
}

function getName(product) {
  return (
    product?.nameBn ||
    product?.name_bn ||
    product?.name ||
    product?.title ||
    "পণ্য"
  );
}

function getPrice(product) {
  return Number(
    product?.today ??
      product?.price ??
      product?.currentPrice ??
      product?.current_price ??
      product?.averagePrice ??
      product?.average_price ??
      0
  );
}

function getChange(product) {
  const change = product?.change;

  if (change && typeof change === "object") {
    const percent = Number(change.pct ?? change.percent ?? 0);

    if (change.dir === "up") return Math.abs(percent);
    if (change.dir === "down") return -Math.abs(percent);
    if (change.dir === "flat") return 0;

    return percent;
  }

  return Number(
    product?.changePercent ??
      product?.change_percent ??
      product?.priceChange ??
      product?.price_change ??
      change ??
      0
  );
}

function getUnit(product) {
  const unit =
    product?.unitBn ||
    product?.unit_bn ||
    product?.unit ||
    product?.unitName ||
    "kg";

  const units = {
    kg: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
  };

  return units[unit] || unit;
}

function getEmoji(product) {
  return product?.image || product?.emoji || product?.icon || "🛒";
}

function getSlug(product) {
  return product?.slug || product?.id || "";
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[#e0e8df] bg-white p-4">
      <div className="h-20 rounded-lg bg-[#edf1eb]" />
      <div className="mt-4 h-4 w-2/3 rounded bg-[#edf1eb]" />
      <div className="mt-3 h-3 w-1/2 rounded bg-[#edf1eb]" />
      <div className="mt-5 h-6 w-3/4 rounded bg-[#edf1eb]" />
    </div>
  );
}

function ProductCard({ product }) {
  const price = getPrice(product);
  const change = getChange(product);
  const slug = getSlug(product);

  return (
    <Link
      href={`/product/${encodeURIComponent(slug)}`}
      className="group flex min-w-0 flex-col rounded-xl border border-[#e0e8df] bg-white p-3 transition hover:-translate-y-1 hover:border-[#b8d8bf] hover:shadow-md sm:p-4"
    >
      <div className="flex h-[100px] items-center justify-center rounded-lg bg-[#f3f7f1] sm:h-[120px]">
        <span className="text-5xl" role="img" aria-label={getName(product)}>
          {getEmoji(product)}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-bold text-[#26352b] group-hover:text-[#078641]">
        {getName(product)}
      </h3>

      <p className="mt-1 text-xs text-gray-500">{getUnit(product)}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-gray-500">আজকের দাম</p>
          <p className="mt-0.5 text-base font-extrabold text-[#26352b]">
            {bn(price)} টাকা
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold ${
            change > 0
              ? "bg-[#fde8e7] text-red-600"
              : change < 0
              ? "bg-[#e2f5e7] text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {change > 0 ? (
            <ArrowUp size={11} />
          ) : change < 0 ? (
            <ArrowDown size={11} />
          ) : null}
          {change === 0 ? "— " : ""}
          {bn(Math.abs(change))}%
        </span>
      </div>
    </Link>
  );
}

function ProductGroup({ title, subtitle, products, type }) {
  const isRising = type === "rising";

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#26352b] sm:text-xl">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                isRising
                  ? "bg-[#fde8e7] text-red-600"
                  : "bg-[#e2f5e7] text-green-700"
              }`}
            >
              {isRising ? (
                <ArrowUp size={17} />
              ) : (
                <ArrowDown size={17} />
              )}
            </span>
            {title}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#dce5da] bg-white p-5 text-center text-sm text-gray-500">
          এই মুহূর্তে দামের পরিবর্তনের তথ্য পাওয়া যায়নি।
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id ?? product.slug ?? `${getName(product)}-${index}`}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProductSections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${BASE_URL}/products`);

      if (!response.ok) {
        throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : Array.isArray(data.data)
        ? data.data
        : [];

      setProducts(list);
    } catch (err) {
      console.error("পণ্য লোড করতে সমস্যা:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const rising = [...products]
    .filter((product) => getChange(product) > 0)
    .sort((a, b) => getChange(b) - getChange(a))
    .slice(0, 6);

  const falling = [...products]
    .filter((product) => getChange(product) < 0)
    .sort((a, b) => getChange(a) - getChange(b))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      {loading ? (
        <>
          {[0, 1, 2].map((group) => (
            <section key={group} className="mt-8">
              <div className="mb-4 h-6 w-48 animate-pulse rounded bg-[#dfe8dc]" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <SkeletonCard key={item} />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-[#e0e8df] bg-white p-8 text-center">
          <p className="font-bold text-[#26352b]">
            পণ্যের তথ্য লোড করা যায়নি
          </p>
          <p className="mt-2 text-sm text-gray-500">
            ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করো।
          </p>
          <button
            onClick={loadProducts}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#078641] px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCw size={15} />
            আবার চেষ্টা করো
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-8 text-center text-sm text-gray-500">
          কোনো পণ্য পাওয়া যায়নি।
        </p>
      ) : (
        <>
          <ProductGroup
            title="আজ দাম বেড়েছে"
            subtitle="যেসব পণ্যের দাম আজ বেড়েছে"
            products={rising}
            type="rising"
          />

          <ProductGroup
            title="আজ দাম কমেছে"
            subtitle="যেসব পণ্যের দাম আজ কমেছে"
            products={falling}
            type="falling"
          />

          <section id="সব-পণ্য" className="mt-10 scroll-mt-36">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-[#26352b] sm:text-2xl">
                সব পণ্য
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                নিত্যপ্রয়োজনীয় পণ্যের আজকের বাজারদর এক জায়গায়।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id ?? product.slug ?? `${getName(product)}-${index}`}
                  product={product}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
