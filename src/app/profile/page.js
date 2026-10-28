"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/signin");
    }

    if (user) {
      setName(user.name || "");
    }
  }, [isPending, user, router]);

  async function handleUpdate(e) {
    e.preventDefault();

    const newName = name.trim();

    if (!newName) {
      toast.error("তোমার নাম লিখো।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.updateUser({
        name: newName,
      });

      if (result?.error) {
        toast.error(
          result.error.message || "তথ্য আপডেট করা যায়নি।"
        );
        return;
      }

      toast.success("তোমার তথ্য সফলভাবে আপডেট হয়েছে!");

      // Updated session information refresh করা
      await authClient.getSession();

      router.refresh();
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("আপডেট করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result?.error) {
        toast.error(
          result.error.message || "সাইন আউট করা যায়নি।"
        );
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছে!");
      router.replace("/signin");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setSigningOut(false);
    }
  }

  if (isPending || !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f1f5ef]">
        <LoaderCircle
          size={32}
          className="animate-spin text-[#078641]"
        />
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] bg-[#f1f5ef] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#202c23]">
            আমার প্রোফাইল
          </h1>

          <p className="mt-1 text-sm text-[#737c74]">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* User information card */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[#e0e8df] bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div className="flex min-w-0 items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-16 w-16 shrink-0 rounded-2xl border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e7eee8] text-[#078641]">
                <UserRound size={32} />
              </div>
            )}

            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold text-[#26352b] sm:text-xl">
                {user.name || "নাম দেওয়া হয়নি"}
              </h2>

              <p className="mt-1 break-all text-sm text-[#737c74] sm:text-base">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-400 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60 sm:self-center"
          >
            {signingOut ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}

            {signingOut ? "সাইন আউট হচ্ছে..." : "সাইন আউট"}
          </button>
        </section>

        {/* Update information form */}
        <section className="mt-6 rounded-2xl border border-[#e0e8df] bg-white/70 p-5 sm:p-6">
          <h2 className="text-base font-bold text-[#26352b]">
            তথ্য
          </h2>

          <form onSubmit={handleUpdate} className="mt-9 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-[#344138]"
              >
                নাম
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="তোমার নাম লেখো"
                required
                className="w-full rounded-lg border border-[#dce5dc] bg-transparent px-3 py-2.5 text-sm text-[#26352b] outline-none transition placeholder:text-gray-400 focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#078641] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-green-900/20 transition hover:bg-[#066e35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  আপডেট হচ্ছে...
                </>
              ) : (
                "আপডেট"
              )}
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}