import { SearchX } from "lucide-react";
import { useSearch } from "../context/SearchProvider";
import { Link } from "react-router-dom";
import { PROFILE_PAGE } from "../utils/Utils";
import Search from "../components/interaction/Search";
import {useIsMobile} from "../hooks/useIsMobile";
import {Avatar as PrimitiveAvatar} from "../components/common/Avatar";
import LoadingSpinner from "../assets/loaders/LoadingSpinner";

// Fidelity reconciliation (Phase G): rebuilt against the Design System's
// SearchResult card (#people) - 56px avatar, name, "View profile" text
// link, compact card - instead of a large left-aligned row. Also wires up
// SearchProvider's existing `loading` flag, which this page never consumed
// before (a real gap, not a design-token issue - no new API/state added).
// Query state ownership, debounce, request cancellation, and result
// routing are all unchanged - only presentation changed.
function SearchPage() {
    const { searchResults, search, loading } = useSearch();
    const isMobile = useIsMobile();

    const hasQuery = search.trim().length > 0;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {isMobile && (
                <div className="flex justify-center mb-6">
                    <Search/>
                </div>
            )}

            <h1 className="text-center text-ds-page-title text-dsNeutral-900 mb-6">
                Search Results
            </h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <LoadingSpinner className="w-6 h-6 text-dsBrand-600" />
                </div>
            ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-14 bg-white border border-dsNeutral-100 rounded-ds-lg max-w-md mx-auto">
                    <SearchX className="w-8 h-8 text-dsNeutral-200 mb-2" strokeWidth={1.75} />
                    <p className="text-ds-body text-dsNeutral-500">
                        {hasQuery ? `No results for "${search}"` : "No users found."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white border border-dsNeutral-100 rounded-ds-lg p-4 flex flex-col items-center gap-2 text-center"
                        >
                            <PrimitiveAvatar src={user.profilePictureUrl} name={user.fullName} alt={user.fullName} size={56} />
                            <p className="text-ds-user-name text-dsNeutral-900 truncate max-w-full">
                                {user.fullName}
                            </p>
                            <Link
                                to={PROFILE_PAGE(user.id)}
                                className="text-ds-caption font-semibold text-dsBrand-600 hover:text-dsBrand-700"
                            >
                                View profile
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchPage;
