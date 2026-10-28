
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: "/",
      });

      if (result.error) {
        setError(
          result.error.message || "অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করো।"
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("সমস্যা হয়েছে। MongoDB connection ও server পরীক্ষা করো।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#f1f5ef] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#e0e8df] bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-sm font-semibold text-[#078641]">
          ← বাজার দর-এ ফিরে যাও
        </Link>

        <div className="mb-7 mt-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#202c23]">
            নতুন অ্যাকাউন্ট তৈরি করো
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            বাজারদর জানতে আজই যোগ দাও
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#202c23]">
              তোমার নাম
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="সম্পূর্ণ নাম লেখো"
              className="w-full rounded-lg border border-[#dce5dc] px-3 py-3 text-sm outline-none focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#202c23]">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-[#dce5dc] px-3 py-3 text-sm outline-none focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#202c23]">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৮ অক্ষর"
              className="w-full rounded-lg border border-[#dce5dc] px-3 py-3 text-sm outline-none focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#078641] px-4 py-3 font-semibold text-white transition hover:bg-[#066e35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "সাইন আপ"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link href="/signin" className="font-bold text-[#078641] hover:underline">
            সাইন ইন করো
          </Link>
        </p>
      </div>
    </main>
  );
}
