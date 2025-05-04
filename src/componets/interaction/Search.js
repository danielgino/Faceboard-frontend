import { Avatar } from "@material-tailwind/react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../../context/SearchProvider";
import { PROFILE_PAGE } from "../../utils/Utils";
import SearchInput from "../../assets/inputs/SearchInput";

// Debounce קטן
function useDebouncedCallback(callback, delay) {
    const timer = useRef();
    const debouncedFunction = (...args) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };
    return debouncedFunction;
}

function Search() {
    const [showPreview, setShowPreview] = useState(false);
    const { searchResults, setSearchResults, search, setSearch, searchUsers } = useSearch();
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const controllerRef = useRef(null);

    useEffect(() => {
        if (location.pathname !== '/search-page') {
            setSearch("");
        }
    }, [location.pathname, setSearch]);

    const debouncedSearchPreview = useDebouncedCallback(async (value) => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        const controller = await searchUsers(value);
        controllerRef.current = controller;
    }, 300);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        setShowPreview(true);
        debouncedSearchPreview(value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (search.trim() !== "") {
                navigate(`/search-page?query=${encodeURIComponent(search)}`);
                setShowPreview(false);
            }
        }
    };

    const handleSearchClick = () => {
        if (search.trim() !== "") {
            navigate(`/search-page?query=${encodeURIComponent(search)}`);
            setShowPreview(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowPreview(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative h-full">
            {/* אינפוט חיפוש */}
            <SearchInput
                onSearch={handleSearchClick}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                value={search}
            />

            {/* תצוגת התוצאות בתוך ה-Header - לא פורטל! */}
            {showPreview && searchResults.length > 0 && (
                <ul className="absolute top-full right-0 w-80 mt-1 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-[50] pointer-events-auto">
                    {searchResults.map((user) => (
                        <li
                            key={user.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            onClick={() => {
                                navigate(PROFILE_PAGE(user.id));
                                setShowPreview(false);
                            }}
                        >
                            <Avatar src={user.profilePictureUrl} alt="Profile pic" />
                            {user.fullName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Search;
