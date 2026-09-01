import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearch } from "../SearchProvider";

// Phase 10 micro-close: SearchProvider used to wrap <Routes> in App.js (above
// the protected-route element), so it never unmounted across a logout - a
// different user logging in on the same tab could inherit the previous
// user's search query/results. It now lives inside the protected-route
// provider stack, so it unmounts/remounts exactly like every other
// protected-scoped provider on a session boundary. This test proves the
// underlying contract that fix relies on: a fresh SearchProvider mount
// starts with no leftover state from a previous mount.

function Consumer() {
    const { search, setSearch, searchResults } = useSearch();
    return (
        <div>
            <span data-testid="search">{search}</span>
            <span data-testid="results-count">{searchResults.length}</span>
            <button onClick={() => setSearch("bob")}>set-search</button>
        </div>
    );
}

test("a new SearchProvider mount does not retain a previous mount's search state", () => {
    const { unmount } = render(
        <SearchProvider>
            <Consumer />
        </SearchProvider>
    );

    fireEvent.click(screen.getByText("set-search"));
    expect(screen.getByTestId("search").textContent).toBe("bob");

    // Simulates the protected-route element (and everything inside it,
    // including SearchProvider) tearing down on logout.
    unmount();

    // Simulates a different user's protected session mounting fresh.
    render(
        <SearchProvider>
            <Consumer />
        </SearchProvider>
    );

    expect(screen.getByTestId("search").textContent).toBe("");
    expect(screen.getByTestId("results-count").textContent).toBe("0");
});
