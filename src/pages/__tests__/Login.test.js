import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Login from "../Login";

// Login-popup removal regression: Login previously opened a SweetAlert
// "Connecting.." modal for the whole duration of the login request (closed
// on both success and failure) with a live "Attempt N/10" counter fed by
// fetchWithRetries' onAttempt callback. That modal (and the onAttempt wiring
// that existed only to feed it) is now gone; the existing loading state on
// the Login button itself is the only in-progress indicator left, and
// success/error handling and duplicate-submit prevention are unchanged.

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}), { virtual: true });

const mockFetchUserDetails = jest.fn().mockResolvedValue(undefined);
jest.mock("../../context/UserProvider", () => ({
    useUser: () => ({ fetchUserDetails: mockFetchUserDetails }),
}));

const mockFetchWithRetries = jest.fn();
jest.mock("../../utils/fetchWithRetries", () => ({
    fetchWithRetries: (...args) => mockFetchWithRetries(...args),
}));

function fillCredentials() {
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "hunter2" } });
}

beforeEach(() => {
    mockNavigate.mockClear();
    mockFetchUserDetails.mockClear();
    mockFetchWithRetries.mockReset();
    localStorage.clear();
});

test("clicking Login immediately shows the button's own loading state and no connecting popup ever appears", async () => {
    let resolveFetch;
    mockFetchWithRetries.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<Login />);
    fillCredentials();

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    // The button's own loading state must be visible right away.
    expect(await screen.findByRole("button", { name: /logging in/i })).toBeInTheDocument();

    // No SweetAlert (or any other) "connecting" popup was ever rendered.
    expect(screen.queryByText(/connecting/i)).not.toBeInTheDocument();
    expect(document.querySelector(".swal2-container")).not.toBeInTheDocument();

    await act(async () => {
        resolveFetch({ ok: true, text: async () => "jwt-token" });
    });
});

test("a second click while a login is already in flight does not fire a second request", async () => {
    mockFetchWithRetries.mockReturnValue(new Promise(() => {})); // never resolves within this test
    render(<Login />);
    fillCredentials();

    const button = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(mockFetchWithRetries).toHaveBeenCalledTimes(1));
});

test("successful login stores the JWT, loads the user, and navigates home - unchanged", async () => {
    mockFetchWithRetries.mockResolvedValue({ ok: true, text: async () => "jwt-token" });

    render(<Login />);
    fillCredentials();

    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    });

    expect(localStorage.getItem("jwtToken")).toBe("jwt-token");
    expect(mockFetchUserDetails).toHaveBeenCalledWith("jwt-token");
    expect(mockNavigate).toHaveBeenCalled();
});

test("a failed login shows the existing error message and no popup - unchanged", async () => {
    mockFetchWithRetries.mockResolvedValue({ ok: false, text: async () => "" });

    render(<Login />);
    fillCredentials();

    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    });

    expect(screen.getByText(/login failed, please check password or email/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText(/connecting/i)).not.toBeInTheDocument();
});
