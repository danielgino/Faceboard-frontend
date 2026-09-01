import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProfileAvatar from "../ProfileAvatar";

// Phase 9 micro-close: RandomIcons.Edit no longer self-wraps in a <button>
// nested inside this <label>. That inner button was a dead tab stop (no
// onClick of its own) sitting in front of the actual file input, which was
// className="hidden" (display:none - unreachable by keyboard at all). The
// input is now className="sr-only" (visually hidden, still focusable) and
// carries its own accessible name, so it's both the real control and a real
// tab stop.

test("selecting a file still calls onFileChange", () => {
    const onFileChange = jest.fn();
    render(
        <ProfileAvatar
            imageUrl=""
            name="Ada"
            isOwnProfile={true}
            uploading={false}
            onFileChange={onFileChange}
            onRemovePicture={jest.fn()}
        />
    );

    const input = screen.getByLabelText("Change profile picture");
    const file = new File(["x"], "avatar.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileChange).toHaveBeenCalledTimes(1);
});

test("the file input is keyboard-focusable, unlike the previous display:none input", () => {
    render(
        <ProfileAvatar
            imageUrl=""
            name="Ada"
            isOwnProfile={true}
            uploading={false}
            onFileChange={jest.fn()}
            onRemovePicture={jest.fn()}
        />
    );

    const input = screen.getByLabelText("Change profile picture");
    input.focus();
    expect(input).toHaveFocus();
});
