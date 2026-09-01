import { Shield } from "lucide-react";

// Desktop-sidebar card, visually matching SuggestedFriends/FriendsCard's
// shell (bg-white/border-dsNeutral-100/rounded-ds-lg/p-[18px]) and heading
// style. Pure presentation: takes an already-resolved tip string + loading
// flag + onNext callback as props (see useSafetyTip for the real
// GET /safety-tips/random data source - a curated static pool, no Gemini/AI
// involved) rather than fetching anything itself.
//
// The current tip stays on screen while a refresh is loading (and if that
// refresh fails) - "Loading a tip…" only appears before any tip has ever
// arrived, on the very first load.
function SafetyTip({ tip, loading, onNext }) {
    if (!loading && !tip) return null;

    return (
        <div className="bg-white border border-dsNeutral-100 rounded-ds-lg p-[18px]">
            <div className="flex items-center gap-2 mb-2">
                <Shield size={16} strokeWidth={1.75} className="text-dsBrand-600 flex-shrink-0" />
                <h2 className="text-ds-card-title text-dsNeutral-900">Safety Tip</h2>
            </div>

            <p className="text-ds-secondary-body text-dsNeutral-600">
                {tip || (loading ? "Loading a tip…" : "")}
            </p>

            <button
                type="button"
                onClick={onNext}
                disabled={loading}
                className="mt-3 w-full text-center text-ds-caption font-semibold text-dsBrand-600 hover:text-dsBrand-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                Another tip
            </button>
        </div>
    );
}

export default SafetyTip;
