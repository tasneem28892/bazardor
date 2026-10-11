"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, MapPin, Package } from "lucide-react";

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

const bn = (value) =>
  Number(value || 0).toLocaleString("bn-BD", {
    maximumFractionDigits: 2,
  });

function unwrap(data) {
  return data?.product ?? data?.data?.product ?? data?.data ?? data;
}

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getName(product) {
  return (
    product?.nameBn ||
    product?.name_bn ||
    product?.name ||
    product?.title ||
    "পণ্যের নাম"
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

function getUnit(product) {
  const unit =
    product?.unitBn ||
    product?.unit_bn ||
    product?.unit ||
    "kg";

  const units = {
    kg: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
  };

  return units[String(unit).toLowerCase()] || unit;
}

function getChange(product) {
  const change = product?.change;

  if (change && typeof change === "object") {
    const percent = Number(change.pct ?? change.percent ?? 0);

    if (change.dir === "up") return Math.abs(percent);
    if (change.dir === "down") return -Math.abs(percent);

    return percent;
  }

  return Number(
    product?.changePercent ??
      product?.change_percent ??
      change ??
      0
  );
}

function getMarkets(product) {
  const possibleLists = [
    product?.markets,
    product?.marketPrices,
    product?.market_prices,
    product?.bazarPrices,
    product?.bazar_prices,
    product?.pricesByMarket,
    product?.prices_by_market,
  ];

  return possibleLists.find(Array.isArray) || [];
}

function getMarketPrice(market, keys) {
  for (const key of keys) {
    const value = market?.[key];

    if (value !== undefined && value !== null && value !== "") {
      const number = Number(value);

      if (Number.isFinite(number)) return number;
    }
  }

  return null;
}

function getMarketName(market) {
  return (
    market?.marketBn ||
    market?.market_bn ||
    market?.marketName ||
    market?.market_name ||
    market?.bazarName ||
    market?.bazar_name ||
    market?.market ||
    market?.bazar ||
    market?.name ||
    "বাজার"
  );
}

function getDivision(market) {
  return (
    market?.divisionBn ||
    market?.division_bn ||
    market?.division ||
    market?.districtBn ||
    market?.district_bn ||
    market?.district ||
    market?.location ||
    "—"
  );
}

function getMarketRows(product) {
  return getMarkets(product).map((market, index) => {
    const minimum = getMarketPrice(market, [
      "minPrice",
      "min_price",
      "minimumPrice",
      "minimum_price",
      "min",
      "lowestPrice",
      "lowest_price",
    ]);

    const maximum = getMarketPrice(market, [
      "maxPrice",
      "max_price",
      "maximumPrice",
      "maximum_price",
      "max",
      "highestPrice",
      "highest_price",
    ]);

    const apiAverage = getMarketPrice(market, [
      "averagePrice",
      "average_price",
      "avgPrice",
      "avg_price",
      "average",
      "avg",
    ]);

    // API-তে গড় দাম থাকলে সেটি দেখাবে।
    // না থাকলে সর্বনিম্ন ও সর্বোচ্চ দামের মাঝামাঝি মান দেখাবে।
    const average =
      apiAverage !== null
        ? apiAverage
        : minimum !== null && maximum !== null
          ? Math.round((minimum + maximum) / 2)
          : null;

    return {
      id: market?.id ?? `${getMarketName(market)}-${index}`,
      name: getMarketName(market),
      division: getDivision(market),
      min: minimum,
      max: maximum,
      average,
    };
  });
}

function getSummary(product, rows) {
  const rowMinimums = rows
    .map((row) => row.min)
    .filter((value) => value !== null && value > 0);

  const rowMaximums = rows
    .map((row) => row.max)
    .filter((value) => value !== null && value > 0);

  const productMinimum = Number(
    product?.minimumPrice ??
      product?.minimum_price ??
      product?.minPrice ??
      product?.min_price ??
      0
  );

  const productMaximum = Number(
    product?.maximumPrice ??
      product?.maximum_price ??
      product?.maxPrice ??
      product?.max_price ??
      0
  );

  const minimum =
    productMinimum > 0
      ? productMinimum
      : rowMinimums.length
        ? Math.min(...rowMinimums)
        : 0;

  const maximum =
    productMaximum > 0
      ? productMaximum
      : rowMaximums.length
        ? Math.max(...rowMaximums)
        : 0;

  const averageValue =
    product?.averagePrice ??
    product?.average_price ??
    product?.avgPrice ??
    product?.avg_price;

  const average =
    averageValue !== undefined &&
    averageValue !== null &&
    averageValue !== ""
      ? Number(averageValue)
      : getPrice(product);

  return { minimum, maximum, average };
}

function Skeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f0f5f0] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 h-4 w-48 rounded bg-[#dfe8df]" />

        <div className="mb-3 rounded-xl border border-[#e5ece5] bg-white p-5 sm:p-6">
          <div className="h-16 rounded bg-[#edf2ed]" />
        </div>

        <div className="rounded-xl border border-[#e5ece5] bg-white p-5">
          <div className="mb-5 h-5 w-44 rounded bg-[#e7eee7]" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 rounded-xl bg-[#edf2ed]"
              />
            ))}
          </div>

          <div className="mt-7 h-5 w-56 rounded bg-[#e7eee7]" />

          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-9 rounded bg-[#edf2ed]"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function PriceCard({ title, value, color }) {
  return (
    <div className="rounded-xl border border-[#e6ede6] bg-[#fafcf9] p-4">
      <p className="text-xs font-medium text-[#6b776d]">
        {title}
      </p>

      <p className={`mt-2 text-xl font-extrabold ${color}`}>
        {value > 0 ? `${bn(value)} টাকা` : "তথ্য নেই"}
      </p>

      <p className="mt-1 text-[11px] text-[#7b867c]">
        বাজারভিত্তিক মূল্য
      </p>
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();

  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        let result = null;

        const response = await fetch(
          `${BASE_URL}/products/${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        if (response.ok) {
          const data = await response.json();
          const candidate = unwrap(data);

          if (
            candidate &&
            !Array.isArray(candidate) &&
            typeof candidate === "object" &&
            (
              candidate.id !== undefined ||
              candidate.slug !== undefined ||
              candidate.name !== undefined ||
              candidate.nameBn !== undefined ||
              candidate.name_bn !== undefined
            )
          ) {
            result = candidate;
          }
        }

        if (!result) {
          const allResponse = await fetch(
            `${BASE_URL}/products`,
            { cache: "no-store" }
          );

          if (!allResponse.ok) {
            throw new Error("পণ্যের তথ্য লোড করা যায়নি।");
          }

          const allProducts = getList(await allResponse.json());

          result = allProducts.find(
            (item) =>
              String(item.id) === String(slug) ||
              String(item.slug) === String(slug)
          );
        }

        if (!result) {
          throw new Error("এই পণ্যটি পাওয়া যায়নি।");
        }

        if (!cancelled) {
          setProduct(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "পণ্যের তথ্য লোড করা যায়নি।"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Skeleton />;

  if (error || !product) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f0f5f0] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#e2e9e2] bg-white p-8 text-center">
          <div className="text-5xl">🔎</div>

          <h1 className="mt-4 text-xl font-extrabold text-[#26352b]">
            পণ্য পাওয়া যায়নি
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "পণ্যের তথ্য পাওয়া যায়নি।"}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-[#078641] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#066e35]"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  const name = getName(product);

  const categorySlug =
    product?.categorySlug ??
    product?.category_slug ??
    (
      typeof product?.category === "string"
        ? product.category
        : product?.category?.slug
    );

  const categoryName =
    categoryNames[categorySlug] ||
    (
      typeof product?.category === "string"
        ? product.category
        : product?.category?.nameBn || "পণ্য"
    );

  const emoji =
    product?.emoji ||
    product?.image ||
    product?.icon ||
    categoryIcons[categorySlug] ||
    "🛒";

  const unit = getUnit(product);
  const change = getChange(product);
  const rows = getMarketRows(product);
  const summary = getSummary(product, rows);

  const description =
    product?.descriptionBn ||
    product?.description_bn ||
    product?.description ||
    `${name} এর বাজারভিত্তিক আজকের দাম এক নজরে দেখে নিন।`;

  return (
    <main className="min-h-screen bg-[#f0f5f0] px-3 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#647267]"
        >
          <Link href="/" className="hover:text-[#078641]">
            হোম
          </Link>

          <span>/</span>

          <Link
            href={categorySlug ? `/category/${categorySlug}` : "/"}
            className="hover:text-[#078641]"
          >
            {categoryName}
          </Link>

          <span>/</span>

          <span className="font-semibold text-[#26352b]">
            {name}
          </span>
        </nav>

        <section className="rounded-xl border border-[#e5ece5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f0f5f0] text-3xl sm:h-16 sm:w-16 sm:text-4xl">
                {emoji}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-extrabold text-[#26352b] sm:text-2xl">
                    {name}
                  </h1>

                  <span className="rounded-full bg-[#e7f5e9] px-2.5 py-1 text-[10px] font-bold text-[#078641]">
                    {categoryName}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#68756b]">
                  {unit} · {description}
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs text-[#657268]">
                  <Package size={13} />
                  নিত্যপ্রয়োজনীয় পণ্যের বাজারদর
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-5 rounded-xl bg-[#f0f5f0] px-4 py-3 sm:min-w-[125px] sm:flex-col sm:gap-1 sm:text-center">
              <p className="text-xs text-[#68756b]">
                আজকের গড় দাম
              </p>

              <p className="text-2xl font-extrabold text-[#26352b]">
                {summary.average > 0
                  ? bn(summary.average)
                  : "—"}
              </p>

              <p className="text-[11px] text-[#68756b]">
                টাকা / একক
              </p>

              {change !== 0 && (
                <span
                  className={`flex items-center gap-1 text-xs font-bold ${
                    change > 0
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  <TrendingUp
                    size={12}
                    className={change < 0 ? "rotate-180" : ""}
                  />
                  {change > 0 ? "▲" : "▼"}{" "}
                  {bn(Math.abs(change))}%
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-xl border border-[#e5ece5] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-extrabold text-[#26352b]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PriceCard
              title="সর্বনিম্ন দাম"
              value={summary.minimum}
              color="text-[#078641]"
            />

            <PriceCard
              title="সর্বোচ্চ দাম"
              value={summary.maximum}
              color="text-red-600"
            />

            <PriceCard
              title="গড় দাম"
              value={summary.average}
              color="text-[#078641]"
            />
          </div>

          <div className="mb-3 mt-6 flex items-center gap-2">
            <MapPin size={17} className="text-[#078641]" />

            <h2 className="text-sm font-extrabold text-[#26352b] sm:text-base">
              বাজারভিত্তিক আজকের দাম
            </h2>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#dce6dc] bg-[#fafcf9] px-4 py-8 text-center">
              <p className="text-sm font-semibold text-[#536256]">
                বাজারভিত্তিক দামের তথ্য পাওয়া যায়নি।
              </p>

              <p className="mt-2 text-xs text-gray-500">
                API-তে বাজারের আলাদা দামের তথ্য থাকলে এখানে দেখানো হবে।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#e5ece5]">
              <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                <thead className="bg-[#fafcf9] text-[#667268]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">
                      বাজার
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      বিভাগ
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      সর্বনিম্ন
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      সর্বোচ্চ
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      গড়
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`border-t border-[#e0e7e0] ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-[#f0f5f0]"
                      }`}
                    >
                      <td className="px-3 py-3 font-semibold text-[#344238]">
                        {row.name}
                      </td>

                      <td className="px-3 py-3 text-[#58665b]">
                        {row.division}
                      </td>

                      <td className="px-3 py-3 text-right text-[#344238]">
                        {row.min !== null
                          ? `${bn(row.min)} টাকা`
                          : "—"}
                      </td>

                      <td className="px-3 py-3 text-right text-[#344238]">
                        {row.max !== null
                          ? `${bn(row.max)} টাকা`
                          : "—"}
                      </td>

                      <td className="px-3 py-3 text-right font-bold text-[#26352b]">
                        {row.average !== null
                          ? `${bn(row.average)} টাকা`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#078641] transition hover:text-[#055c2c]"
          >
            <ArrowLeft size={15} />
            সব পণ্যে ফিরে যান
          </Link>
        </section>
      </div>
    </main>
  );
}