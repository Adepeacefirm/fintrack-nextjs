import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ResetPasswordSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-100 via-sky-50 to-emerald-100 px-4 py-10">
      <div className="pointer-events-none absolute -left-12 top-12 h-60 w-60 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />

      <main className="relative w-full max-w-lg rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_60px_-24px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
        <p className="text-sm font-medium tracking-wide text-emerald-700">
          Password Updated
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          You&apos;re all set.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your FinTrack account password has been changed successfully.
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Next step in your app</p>
          <p className="mt-2 leading-6">
            Open your Expo app and login with your{" "}
            <span className="font-semibold">email</span> and your{" "}
            <span className="font-semibold">new password</span>.
          </p>
          {email ? (
            <p className="mt-2 break-all text-xs text-emerald-800/90">
              Email from reset session: {email}
            </p>
          ) : null}
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Return to portal
        </Link>
      </main>
    </div>
  );
}
