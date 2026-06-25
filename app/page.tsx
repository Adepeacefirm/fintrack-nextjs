import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-cyan-100 px-4 py-10">
      <div className="pointer-events-none absolute -left-16 top-16 h-56 w-56 rounded-full bg-orange-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl" />

      <main className="relative w-full max-w-xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_60px_-24px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
        <p className="text-sm font-medium tracking-wide text-orange-700">
          FinTrack Web Portal
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Reset your password securely
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          This page is used by password reset links sent from Supabase. If you
          opened a reset email, continue to set your new password.
        </p>

        <Link
          href="/reset-password"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Continue to reset form
        </Link>

        <p className="mt-6 text-xs text-slate-500">
          After reset is successful, return to your Expo app and sign in with
          your updated password.
        </p>
      </main>
    </div>
  );
}
