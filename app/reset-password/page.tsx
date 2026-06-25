"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type LinkPayload = Record<string, string>;

function maskSensitive(value: string, key: string) {
  if (!/(token|secret|refresh|code)/i.test(key) || value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

// 1. Isolated Form Component containing the useSearchParams hook
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPreparingSession, setIsPreparingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const payload = useMemo(() => {
    const parsedPayload: LinkPayload = {};

    searchParams.forEach((value, key) => {
      parsedPayload[key] = value;
    });

    if (typeof window !== "undefined") {
      const rawHash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);

      hashParams.forEach((value, key) => {
        parsedPayload[key] = value;
      });
    }

    return parsedPayload;
  }, [searchParams]);

  const sortedPayloadEntries = useMemo(
    () => Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)),
    [payload],
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const accessToken = payload.access_token;
    const refreshToken = payload.refresh_token;
    const code = payload.code;

    const bootstrapSession = async () => {
      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        } else {
          throw new Error(
            "This reset link is missing required auth credentials.",
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not validate your reset link.";
        setErrorMessage(message);
      } finally {
        setIsPreparingSession(false);
      }
    };

    void bootstrapSession();
  }, [payload]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      const email = data.user?.email ?? "";
      router.replace(
        `/reset-password/success?email=${encodeURIComponent(email)}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while changing your password.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative w-full max-w-xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_60px_-24px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
      <p className="text-sm font-medium tracking-wide text-orange-700">
        FinTrack Account Recovery
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Set Your New Password
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Your reset link has been processed. Enter a secure password below, then
        continue in your mobile app.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Supabase Link Payload
        </p>
        {sortedPayloadEntries.length > 0 ? (
          <ul className="mt-3 max-h-48 space-y-2 overflow-auto pr-1 text-xs text-slate-700">
            {sortedPayloadEntries.map(([key, value]) => (
              <li key={key} className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-semibold text-slate-500">{key}</span>
                <span className="break-all">{maskSensitive(value, key)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-600">
            Waiting for link details from URL...
          </p>
        )}
      </div>

      {isPreparingSession ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Validating reset link...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            New Password
          </span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-orange-300 transition focus:border-orange-500 focus:ring-2"
            placeholder="At least 8 characters"
            disabled={isPreparingSession || isSubmitting}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Confirm Password
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-orange-300 transition focus:border-orange-500 focus:ring-2"
            placeholder="Re-enter your password"
            disabled={isPreparingSession || isSubmitting}
          />
        </label>

        <button
          type="submit"
          disabled={isPreparingSession || isSubmitting}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving new password..." : "Update password"}
        </button>
      </form>

      <p className="mt-5 text-xs text-slate-500">
        If this link has expired, return to your app and request a fresh reset
        email.
      </p>

      <Link
        href="/"
        className="mt-4 inline-block text-xs font-semibold text-cyan-800 hover:text-cyan-600"
      >
        Back to FinTrack reset portal
      </Link>
    </main>
  );
}

// 2. Main wrapper with background styling and Suspense Boundary
export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-cyan-100 px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl" />

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-md backdrop-blur">
            Loading reset portal...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
