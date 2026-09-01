import {fireEvent, render, screen} from "@testing-library/react";
import {Avatar} from "../Avatar";

describe("Avatar", () => {
    it("renders an image when src is provided", () => {
        render(<Avatar src="https://example.com/pic.jpg" alt="Maya Rosen" name="Maya Rosen" />);
        const img = screen.getByRole("img", {name: "Maya Rosen"});
        expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
    });

    it("renders initials fallback when there is no src", () => {
        render(<Avatar name="Maya Rosen" alt="Maya Rosen" />);
        expect(screen.getByText("MR")).toBeInTheDocument();
    });

    it("falls back to initials if the image fails to load, keeping the accessible name", () => {
        const {container} = render(<Avatar src="https://example.com/broken.jpg" name="Dana Katz" alt="Dana Katz" />);
        const img = screen.getByRole("img", {name: "Dana Katz"});
        fireEvent.error(img);
        expect(screen.getByText("DK")).toBeInTheDocument();
        expect(container.querySelector("img")).not.toBeInTheDocument();
        expect(screen.getByRole("img", {name: "Dana Katz"})).toBeInTheDocument();
    });

    it("preserves the accessible name contract even without a name for initials", () => {
        render(<Avatar alt="Current user" />);
        expect(screen.getByLabelText("Current user")).toBeInTheDocument();
    });

    it("hides fallback initials from the accessibility tree so they don't double-announce next to adjacent visible name text", () => {
        // Regression found wiring HeaderBar in Phase D: a link wrapping
        // <Avatar alt="" name="Ada Lovelace"/> plus the visible name text
        // must expose "Ada Lovelace" as its accessible name, not
        // "AL Ada Lovelace".
        render(
            <a href="/profile/1">
                <Avatar alt="" name="Ada Lovelace" />
                Ada Lovelace
            </a>
        );
        expect(screen.getByRole("link")).toHaveAccessibleName("Ada Lovelace");
    });
});
