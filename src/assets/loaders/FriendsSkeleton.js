// Matches Friends.js's actual unified FriendRow list shape (Phase G) at
// every viewport, instead of a separate desktop-grid vs. mobile-list
// skeleton pair for a layout split that no longer exists.
export default function FriendsSkeleton({ count = 8 }) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-10">
            <div className="h-6 w-48 bg-dsNeutral-100 rounded mx-auto mb-5 animate-pulse" />
            <div className="h-9 w-full max-w-xs bg-dsNeutral-100 rounded-full mx-auto mb-5 animate-pulse" />

            <div
                className="flex flex-col divide-y divide-dsNeutral-100 bg-white rounded-ds-lg border border-dsNeutral-100 overflow-hidden animate-pulse"
                aria-busy="true"
                aria-live="polite"
            >
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-dsNeutral-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="h-3 bg-dsNeutral-100 rounded w-2/5 mb-2" />
                            <div className="h-2.5 bg-dsNeutral-100 rounded w-1/4" />
                        </div>
                        <div className="h-8 w-20 bg-dsNeutral-100 rounded-control" />
                    </div>
                ))}
            </div>
        </div>
    );
}
