"use client";

import { useEffect } from "react";
import WizardShell from "@/components/wizard/WizardShell";
import OfflineBanner from "@/components/ui/OfflineBanner";
import { useElectionStore } from "@/store/electionStore";
import { initBackgroundSync } from "@/lib/syncEngine";
import LoginStep from "./login/page";
import SelectTypeStep from "./select-type/page";
import SelectLocationStep from "./select-location/page";
import TallyStep from "./tally/page";
import UploadStep from "./upload/page";
import ConfirmationStep from "./confirmation/page";

export default function MobileAgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        initBackgroundSync();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
            <OfflineBanner />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                        <span className="text-white text-xs font-black">NP</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                        निर्वाचन Live
                    </span>
                </div>
                <ConnectionIndicator />
            </header>

            {/* Wizard */}
            <main className="flex-1 flex flex-col">
                <WizardShell>
                    {{
                        login: <LoginStep />,
                        "select-type": <SelectTypeStep />,
                        "select-location": <SelectLocationStep />,
                        tally: <TallyStep />,
                        upload: <UploadStep />,
                        confirmation: <ConfirmationStep />,
                    }}
                </WizardShell>
            </main>
        </div>
    );
}

function ConnectionIndicator() {
    return (
        <div className="flex items-center gap-2">
            <span
                id="connection-status"
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                title="Online"
            />
            <span className="text-xs font-medium text-slate-500">Online</span>
        </div>
    );
}
