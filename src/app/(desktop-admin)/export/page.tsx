export default function ExportPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
                Export Data
            </h1>
            <p className="text-slate-500 mb-6">
                One-click export of verified vote data to CSV/Excel.
            </p>
            <button className="touch-btn touch-btn-primary">
                Export to CSV
            </button>
        </div>
    );
}
