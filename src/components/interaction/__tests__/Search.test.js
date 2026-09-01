import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Search from "../Search";

// Accessibility follow-up: Search.js's live-results dropdown previously had no roles/ARIA and
// was mouse-only (onClick, no keyboard path). It now follows the WAI-ARIA combobox pattern -
// DOM focus stays on the input; the "active" result is communicated via aria-activedescendant
// plus a visual highlight, and Escape/ArrowUp/ArrowDown/Enter are all wired through the input's
// existing onKeyDown. These tests cover exactly that contract.
//
// react-router-dom (v7, ESM-only) can't go through jest.requireActual from inside a mock
// factory in this project's Jest/CRA setup - same constraint LikeList.test.js already works
// around with a virtual, from-scratch mock instead of spreading the real module.
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
}), { virtual: true });

const mockSetSearch = jest.fn();
const mockSearchUsers = jest.fn(async () => new AbortController());
let mockSearchResults = [];
jest.mock("../../../context/SearchProvider", () => ({
    useSearch: () => ({
        searchResults: mockSearchResults,
        // Deliberately not "bo" (the value every test types): the input is controlled off this
        // mocked value (setSearch is a no-op mock, so it never actually updates), and firing a
        // change event whose value matches what's already in the DOM is a no-op in React's
        // controlled-input change detection - the input has to start from a different value for
        // fireEvent.change to actually invoke handleSearchChange.
        search: "",
        setSearch: mockSetSearch,
        searchUsers: mockSearchUsers,
    }),
}));

beforeEach(() => {
    mockNavigate.mockReset();
    mockSetSearch.mockReset();
    mockSearchResults = [
        { id: 1, fullName: "Bob One", profilePictureUrl: "" },
        { id: 2, fullName: "Bob Two", profilePictureUrl: "" },
    ];
});

function renderSearch() {
    return render(<Search />);
}

test("typing opens a properly-labeled listbox with option roles", () => {
    renderSearch();
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "bo" } });

    expect(screen.getByRole("listbox", { name: "Search results" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
});

test("ArrowDown highlights results in order and Enter navigates to the highlighted one", () => {
    renderSearch();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "bo" } });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    let options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
    expect(input).toHaveAttribute("aria-activedescendant", options[0].id);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    options = screen.getAllByRole("option");
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("/profile/2");
});

test("Escape closes the listbox without navigating", () => {
    renderSearch();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "bo" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
});

test("clicking a result still navigates (existing mouse behavior unaffected)", () => {
    renderSearch();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "bo" } });

    fireEvent.click(screen.getAllByRole("option")[1]);

    expect(mockNavigate).toHaveBeenCalledWith("/profile/2");
});
