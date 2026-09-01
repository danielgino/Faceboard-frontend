import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchInput from "../SearchInput";

// Phase 13 micro-close regression: SearchInput used to keep its own
// internal `value` state and silently ignore the `value`/`onKeyDown` props
// callers already passed. It's now a plain controlled input - these two
// tests cover exactly the contract that bug broke.

test("an external value reset is reflected immediately in the rendered input", () => {
    const { rerender } = render(<SearchInput value="bob" onChange={() => {}} />);

    expect(screen.getByRole("searchbox")).toHaveValue("bob");

    rerender(<SearchInput value="" onChange={() => {}} />);

    expect(screen.getByRole("searchbox")).toHaveValue("");
});

test("a parent-provided onKeyDown actually fires from the input", () => {
    const onKeyDown = jest.fn();
    render(<SearchInput value="bob" onChange={() => {}} onKeyDown={onKeyDown} />);

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
});

test("Enter still calls onSearch with the current value (existing convenience behavior)", () => {
    const onSearch = jest.fn();
    render(<SearchInput value="bob" onChange={() => {}} onSearch={onSearch} />);

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });

    expect(onSearch).toHaveBeenCalledWith("bob");
});
