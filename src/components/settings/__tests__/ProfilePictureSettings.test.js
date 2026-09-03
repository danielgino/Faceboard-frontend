import { render, screen, fireEvent } from "@testing-library/react";
import ProfilePictureSettings from "../ProfilePictureSettings";

// Phase 8E: protects the initials-fallback rendering and the
// window.confirm-gated remove flow now that this section is independently
// testable outside of Settings.js.

function makeUser(overrides = {}) {
    return {
        name: "Ada",
        lastname: "Lovelace",
        fullName: "Ada Lovelace",
        profilePictureUrl: "",
        ...overrides,
    };
}

test("renders initials fallback when there is no profile picture", () => {
    render(
        <ProfilePictureSettings
            user={makeUser()}
            uploading={false}
            onFileChange={jest.fn()}
            onRemove={jest.fn()}
        />
    );

    expect(screen.getByText("AL")).toBeInTheDocument();
});

test("renders the actual image when a profile picture URL is set", () => {
    // Phase 9: the avatar's alt text was intentionally emptied (alt="") since
    // it's redundant with the adjacent visible fullName text (accessibility
    // fix, not a regression). A decorative alt="" image is removed from the
    // accessibility tree, so it's no longer queryable by role/alt text here.
    const { container } = render(
        <ProfilePictureSettings
            user={makeUser({ profilePictureUrl: "https://example.com/avatar.jpg" })}
            uploading={false}
            onFileChange={jest.fn()}
            onRemove={jest.fn()}
        />
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/avatar.jpg");
});

// Demo Mode: disabled=true must make the upload input and Remove button genuinely
// non-interactive (native `disabled`, not just styling), not merely rely on the backend's
// existing 403 for the underlying PUT/DELETE.
describe("Demo Mode (disabled=true)", () => {
    test("the file input and Remove button are disabled, and Remove never calls onRemove", () => {
        const onRemove = jest.fn();
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

        const { container } = render(
            <ProfilePictureSettings
                user={makeUser()}
                uploading={false}
                onFileChange={jest.fn()}
                onRemove={onRemove}
                disabled
            />
        );

        expect(container.querySelector('input[type="file"]')).toBeDisabled();
        const removeButton = screen.getByText("Remove");
        expect(removeButton).toBeDisabled();

        fireEvent.click(removeButton);

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(onRemove).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });

    test("shows the Demo Mode read-only notice", () => {
        render(
            <ProfilePictureSettings
                user={makeUser()}
                uploading={false}
                onFileChange={jest.fn()}
                onRemove={jest.fn()}
                disabled
            />
        );

        expect(screen.getByText(/Demo Mode.*profile picture cannot be edited/i)).toBeInTheDocument();
    });
});

test("only calls onRemove after the confirm dialog is accepted", () => {
    const onRemove = jest.fn();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(
        <ProfilePictureSettings
            user={makeUser()}
            uploading={false}
            onFileChange={jest.fn()}
            onRemove={onRemove}
        />
    );

    fireEvent.click(screen.getByText("Remove"));
    expect(onRemove).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByText("Remove"));
    expect(onRemove).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
});
