import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Settings from "../Settings";

// Multi-field PATCH regression: Settings.js's "Save" button used to fire one
// independent PUT /user/settings request per edited field via Promise.all.
// Those concurrent requests raced each other's non-atomic read-modify-write
// on the backend, so a multi-field edit (e.g. name + lastname together)
// would sometimes only persist one of them. The fix awaits each field's
// save sequentially instead. These tests assert the actual regression
// contract: requests never overlap, and every changed field's new value is
// present in some request body by the time the save completes.

jest.mock("../../components/settings/ProfilePictureSettings", () => () => <div>profile-picture-settings</div>);
jest.mock("../../components/settings/PasswordSettings", () => () => <div>password-settings</div>);

jest.mock("../../context/useProfilePictureUpload", () => () => ({
    uploading: false,
    handleFileChange: jest.fn(),
    handleRemoveProfilePicture: jest.fn(),
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    ...jest.requireActual("../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

let mockUser;
const mockSetUser = jest.fn();
jest.mock("../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser, setUser: mockSetUser }),
}));

beforeEach(() => {
    mockUser = {
        id: 1,
        name: "Alice",
        lastname: "Smith",
        email: "alice@example.com",
        bio: "old bio",
        facebookUrl: "",
        instagramUrl: "",
    };
    mockFetchWithAuth.mockReset();
    mockSetUser.mockReset();
});

function pendingResponses() {
    const pending = [];
    mockFetchWithAuth.mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
    return pending;
}

test("saving two edited fields together never has a second request in flight before the first resolves", async () => {
    const pending = pendingResponses();
    render(<Settings />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alicia" } });
    fireEvent.change(screen.getByLabelText("Lastname"), { target: { value: "Jones" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Only the first field's request should be in flight; none of the later
    // fields' requests may have been fired yet.
    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);

    // Resolving the first request is what's allowed to unblock the second -
    // proving they run sequentially, not concurrently.
    await act(async () => {
        pending.shift()({ ok: true });
    });
    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(2));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);

    // Drain the remaining requests (one per editable field).
    while (pending.length) {
        const resolve = pending.shift();
        await act(async () => {
            resolve({ ok: true });
        });
    }

    // Both edited fields' new values were actually sent to the server.
    const bodies = mockFetchWithAuth.mock.calls.map(([, options]) => JSON.parse(options.body));
    expect(bodies).toContainEqual({ name: "Alicia" });
    expect(bodies).toContainEqual({ lastname: "Jones" });
});

test("editing a single field still saves successfully", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: true });
    render(<Settings />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alicia" } });

    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });

    const bodies = mockFetchWithAuth.mock.calls.map(([, options]) => JSON.parse(options.body));
    expect(bodies).toContainEqual({ name: "Alicia" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument());
});
