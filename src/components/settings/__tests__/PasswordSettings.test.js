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

let mockIsDemo = false;
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ isDemo: mockIsDemo }),
}));

beforeEach(() => {
    mockFetchWithAuth.mockReset();
    mockSwalFire.mockClear();
    mockIsDemo = false;
});

// Demo Mode: password inputs and Save Changes must be genuinely disabled (native `disabled`),
// and submitting must never issue the PUT even if triggered some other way (defense in depth
// behind the backend's own DEMO_READ_ONLY rejection).
describe("Demo Mode", () => {
    beforeEach(() => {
        mockIsDemo = true;
    });

    test("password fields and Save Changes are disabled, and no request is ever sent", async () => {
        render(<PasswordSettings />);

        expect(screen.getByLabelText("Current Password")).toBeDisabled();
        expect(screen.getByLabelText("New Password")).toBeDisabled();
        expect(screen.getByLabelText("Confirm New Password")).toBeDisabled();
        const saveButton = screen.getByText("Save Changes");
        expect(saveButton).toBeDisabled();

        fireEvent.click(saveButton);

        expect(mockFetchWithAuth).not.toHaveBeenCalled();
    });

    test("shows the Demo Mode read-only notice", () => {
        render(<PasswordSettings />);

        expect(screen.getByText(/Demo Mode.*password cannot be changed/i)).toBeInTheDocument();
    });
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
