import { render, screen } from "@testing-library/react";
import { AuthFieldError } from "../AuthFieldError";

describe("AuthFieldError", () => {
    it("renders nothing when there is no error", () => {
        const { container } = render(<AuthFieldError id="email" error="" />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders the error message tied to the field id when an error is present", () => {
        render(<AuthFieldError id="email" error="Invalid email" />);
        const message = screen.getByText("Invalid email");
        expect(message).toHaveAttribute("id", "email-error");
    });
});
