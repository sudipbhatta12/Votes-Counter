import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--color-bg)]">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
          <span className="text-white text-xl font-black">NP</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
          निर्वाचन Live
        </h1>
        <p className="text-lg text-slate-500 mb-8">
          प्रतिनिधि सभा सदस्य निर्वाचन, २०८२
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="touch-btn touch-btn-primary w-full"
          >
            एजेन्ट लगइन (Agent Login)
          </Link>
          <Link
            href="/dashboard"
            className="touch-btn w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            HQ Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Nirwachan Live 2026 — निर्वाचन आयोग, नेपाल
        </p>
      </div>
    </main>
  );
}
