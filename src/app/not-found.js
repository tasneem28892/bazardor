import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f1f5ef] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#e0e8df] bg-white p-8 text-center shadow-sm">
        <div className="text-6xl">🔎</div>

        <h1 className="mt-5 text-3xl font-extrabold text-[#202c23]">
          404
        </h1>

        <h2 className="mt-2 text-xl font-bold text-[#078641]">
          পেজটি খুঁজে পাওয়া যায়নি
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          দুঃখিত! তুমি যে পেজটি খুঁজছ, সেটি পাওয়া যাচ্ছে না।
          ঠিকানা পরীক্ষা করো অথবা হোম পেজে ফিরে যাও।
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[#078641] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#066e35]"
        >
          হোম পেজে ফিরে যাও
        </Link>
      </div>
    </main>
  );
}