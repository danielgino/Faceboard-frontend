import LoadingSpinner from "./LoadingSpinner";

// Same dialog shell LikeList itself renders once loaded (scrim, radius,
// shadow) so there's no visual jump between this placeholder and the real
// dialog - just its content swapped for an indeterminate spinner.
function LikeLoader() {
    return (
        <div className="fixed inset-0 bg-dsScrim flex justify-center items-center z-[9999] p-4">
            <div className="w-full max-w-sm bg-white rounded-ds-lg shadow-ds-modal flex flex-col items-center justify-center gap-3 py-16">
                <LoadingSpinner className="w-7 h-7 text-dsBrand-600" />
                <p className="text-ds-body text-dsNeutral-500">Loading likes…</p>
            </div>
        </div>
    );
}

export default LikeLoader;
