import { Avatar } from "@material-tailwind/react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../../context/SearchProvider";
import { PROFILE_PAGE, SEARCH_PAGE } from "../../utils/Utils";
import SearchInput from "../../assets/inputs/SearchInput";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

const SEARCH_RESULTS_LISTBOX_ID = "search-results-listbox";

function Search() {
    const [showPreview, setShowPreview] = useState(false);
    // Accessibility follow-up: which result is "active" for keyboard users. DOM focus
    // deliberately never leaves the input (the WAI-ARIA combobox pattern) - the active option is
    // instead communicated via aria-activedescendant + a visual highlight, exactly as ArrowDown/
    // ArrowUp/Enter below implement it.
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const { searchResults, search, setSearch, searchUsers } = useSearch();
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const controllerRef = useRef(null);

    useEffect(() => {
        if (location.pathname !== SEARCH_PAGE) {
            setSearch("");
        }
    }, [location.pathname, setSearch]);

    // Whenever the visible result set changes, whatever was highlighted no longer necessarily
    // corresponds to the same result - safest to reset rather than carry over a stale index.
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchResults, showPreview]);

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

    const selectResult = (user) => {
        navigate(PROFILE_PAGE(user.id));
        setShowPreview(false);
    };

    const handleKeyDown = (e) => {
        const hasVisibleResults = showPreview && searchResults.length > 0;

        if (e.key === "Escape") {
            if (showPreview) {
                setShowPreview(false);
            }
            return;
        }

        if (hasVisibleResults && e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
            return;
        }

        if (hasVisibleResults && e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
            return;
        }

        if (e.key === "Enter") {
            if (hasVisibleResults && highlightedIndex >= 0) {
                e.preventDefault();
                selectResult(searchResults[highlightedIndex]);
                return;
            }
            if (search.trim() !== "") {
                navigate(`${SEARCH_PAGE}?query=${encodeURIComponent(search)}`);
                setShowPreview(false);
            }
        }
    };

    const handleSearchClick = () => {
        if (search.trim() !== "") {
            navigate(`${SEARCH_PAGE}?query=${encodeURIComponent(search)}`);
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

    const showListbox = showPreview && searchResults.length > 0;
    const activeDescendantId =
        showListbox && highlightedIndex >= 0 ? `search-result-${searchResults[highlightedIndex].id}` : undefined;

    return (
        <div ref={containerRef} className="relative h-full">
            <SearchInput
                onSearch={handleSearchClick}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                value={search}
                role="combobox"
                aria-expanded={showListbox}
                aria-haspopup="listbox"
                aria-controls={SEARCH_RESULTS_LISTBOX_ID}
                aria-autocomplete="list"
                aria-activedescendant={activeDescendantId}
            />

            {showListbox && (
                <ul
                    id={SEARCH_RESULTS_LISTBOX_ID}
                    role="listbox"
                    aria-label="Search results"
                    className="absolute top-full left-0 w-full mt-1 bg-dsNeutral-surface shadow-ds-floating rounded-ds-lg max-h-60 overflow-y-auto z-[50] pointer-events-auto"
                >

                    {searchResults.map((user, index) => (
                        <li
                            key={user.id}
                            id={`search-result-${user.id}`}
                            role="option"
                            aria-selected={index === highlightedIndex}
                            className={`px-4 py-2 hover:bg-dsNeutral-100 cursor-pointer flex items-center gap-2 ${index === highlightedIndex ? "bg-dsNeutral-100" : ""}`}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onClick={() => selectResult(user)}
                        >
                            <Avatar src={user.profilePictureUrl} alt="Profile pic"/>
                            {user.fullName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Search;
