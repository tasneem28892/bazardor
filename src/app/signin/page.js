
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/",
      });

      if (result.error) {
        setError(
          result.error.message || "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।"
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

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Google Login করা যায়নি। আবার চেষ্টা করো।");
      setGoogleLoading(false);
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
            আবার ফিরে এসেছ!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            তোমার অ্যাকাউন্টে সাইন ইন করো
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[#202c23]"
            >
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
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[#202c23]"
            >
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="তোমার পাসওয়ার্ড"
              className="w-full rounded-lg border border-[#dce5dc] px-3 py-3 text-sm outline-none focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-lg bg-[#078641] px-4 py-3 font-semibold text-white transition hover:bg-[#066e35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e0e8df]" />
          <span className="text-xs text-gray-500">অথবা</span>
          <div className="h-px flex-1 bg-[#e0e8df]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#dce5dc] bg-white px-4 py-3 font-semibold text-[#202c23] transition hover:bg-[#f8faf7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.02 13.22l7.98 6.19C11.89 13.72 17.52 9.5 24 9.5z"
              transform="translate(0 4)"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.81 46.98 24.55z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.53 10.78l7.99-6.19z"
              transform="translate(0 0)"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-6.48 0-12.11-4.22-14.01-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              transform="translate(0 -4)"
            />
          </svg>

          {googleLoading
            ? "Google-এ সংযোগ হচ্ছে..."
            : "Google দিয়ে সাইন ইন"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#078641] hover:underline"
          >
            সাইন আপ করো
          </Link>
        </p>
      </div>
    </main>
  );
}
