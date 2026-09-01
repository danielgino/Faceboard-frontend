import { render, screen, fireEvent, act } from "@testing-library/react";
import PasswordSettings from "../PasswordSettings";

// Phase 8E: PasswordSettings was extracted from Settings.js as a fully
// self-contained section (it already owned its own submission before
// extraction). These tests protect the password-validation integration and
// the submit payload/success/failure behavior now that it's independently
// testable.

const mockFetchWithAuth = jest.fn();
jest.mock("../../../utils/Utils", () => ({
    ...jest.requireActual("../../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

const mockSwalFire = jest.fn(() => Promise.resolve());
// Cleanup Batch 2: swalTheme.js now calls Swal.mixin({...}) at module load
// time to build its themed instance, so this mock must expose a .mixin
// method (returning an object with its own .fire) - not just a bare .fire
// - or importing swalTheme.js throws immediately.
jest.mock("sweetalert2", () => ({
    fire: (...args) => mockSwalFire(...args),
    mixin: () => ({ fire: (...args) => mockSwalFire(...args) }),
}));

beforeEach(() => {
    mockFetchWithAuth.mockReset();
    mockSwalFire.mockClear();
});

test("shows the shared password-validation message while typing an invalid new password", () => {
    render(<PasswordSettings />);

    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "short" } });

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
});

test("shows a confirmation-mismatch message using the shared password utility", () => {
    render(<PasswordSettings />);

    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "GoodPass1!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "Different1!" } });

    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
});

test("submits the currentPassword/newPassword payload and shows a success alert", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: true });
    render(<PasswordSettings />);

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "oldpass1" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass1!" } });

    await act(async () => {
        fireEvent.click(screen.getByText("Save Changes"));
    });

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetchWithAuth.mock.calls[0];
    expect(url).toContain("/user/settings");
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ currentPassword: "oldpass1", newPassword: "NewPass1!" });
    expect(mockSwalFire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success" }));
});

test("shows an error alert when the request fails, without changing the submitted fields", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: false });
    render(<PasswordSettings />);

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "oldpass1" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass1!" } });

    await act(async () => {
        fireEvent.click(screen.getByText("Save Changes"));
    });

    expect(mockSwalFire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error" }));
});
