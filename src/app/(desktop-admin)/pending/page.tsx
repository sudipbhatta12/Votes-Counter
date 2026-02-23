"use client";

export default function PendingReviewPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
                Pending Review Queue
            </h1>
            <p className="text-slate-500 mb-6">
                All submissions with &quot;Pending&quot; status. Click a row to open the split-screen review.
            </p>

            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 14l2 2 4-4" />
                </svg>
                <p className="text-lg font-bold text-slate-800 mb-2">
                    Use the Dashboard
                </p>
                <p className="text-sm text-slate-500 mb-4">
                    Click the &quot;Pending&quot; filter card on the Dashboard to see all pending submissions.
                </p>
                <a
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                >
                    Go to Dashboard
                </a>
            </div>
        </div>
    );
}
