import { ReactNode } from "react";

export default function DesktopAdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                            <span className="text-white text-xs font-black">NP</span>
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-tight">निर्वाचन Live</h1>
                            <p className="text-[10px] text-slate-400 leading-tight">HQ Admin Dashboard</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-0.5">
                    <NavLink href="/dashboard" icon="chart" label="Dashboard" />
                    <NavLink href="/agents" icon="users" label="Agents" />
                    <NavLink href="/pending" icon="clock" label="Pending Review" />
                    <NavLink href="/disputes" icon="alert" label="Disputes" />
                    <NavLink href="/export" icon="download" label="Export" />
                </nav>
                <div className="p-4 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-600">v1.0 — Phase 3</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
                    <h2 className="text-sm font-bold text-slate-800">
                        प्रतिनिधि सभा निर्वाचन २०८२
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs text-emerald-600 font-semibold">Live</span>
                    </div>
                </header>
                <div className="flex-1 p-6">{children}</div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
            <NavIcon type={icon} />
            {label}
        </a>
    );
}

function NavIcon({ type }: { type: string }) {
    const cls = "w-[18px] h-[18px] text-slate-400";
    switch (type) {
        case "chart":
            return (
                <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
                </svg>
            );
        case "clock":
            return (
                <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
            );
        case "alert":
            return (
                <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            );
        case "users":
            return (
                <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            );
        case "download":
            return (
                <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            );
        default:
            return null;
    }
}
