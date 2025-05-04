import React, { createContext, useContext, useState } from "react";
import {fetchWithAuth, SEARCH_USERS_BY_NAME_API} from "../utils/Utils";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const searchUsers = async (query, controller = new AbortController()) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const signal = controller.signal;

        setLoading(true);
        try {
            const response = await fetchWithAuth(SEARCH_USERS_BY_NAME_API(query), { signal });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setSearchResults(result);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error(err.message);
            }
        } finally {
            setLoading(false);
        }
        return controller;
    };

    return (
        <SearchContext.Provider value={{
            searchResults,
            setSearchResults,
            search,
            setSearch,
            loading,
            searchUsers
        }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
