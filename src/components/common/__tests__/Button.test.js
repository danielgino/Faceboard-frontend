import {fireEvent, render, screen} from "@testing-library/react";
import {Button} from "../Button";

describe("Button", () => {
    it("forwards clicks", () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Save</Button>);
        fireEvent.click(screen.getByRole("button", {name: "Save"}));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("disables natively and blocks interaction when disabled", () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick} disabled>Save</Button>);
        const button = screen.getByRole("button", {name: "Save"});
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("disables and marks itself busy while loading, without hiding the label", () => {
        render(<Button loading>Save</Button>);
        const button = screen.getByRole("button", {name: "Save"});
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("applies the requested variant's class contract", () => {
        render(<Button variant="text">Back to login</Button>);
        expect(screen.getByRole("button", {name: "Back to login"})).toHaveClass("text-dsBrand-600");
    });

    it("falls back to the primary variant for an unknown variant name", () => {
        render(<Button variant="not-a-real-variant">Go</Button>);
        expect(screen.getByRole("button", {name: "Go"})).toHaveClass("bg-dsBrand-600");
    });
});
