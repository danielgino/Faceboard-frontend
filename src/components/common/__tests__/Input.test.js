import {fireEvent, render, screen} from "@testing-library/react";
import {Input} from "../Input";

describe("Input", () => {
    it("forwards value and onChange", () => {
        const onChange = jest.fn();
        render(<Input label="Email" name="email" value="a@b.com" onChange={onChange} />);
        const field = screen.getByLabelText("Email");
        expect(field).toHaveValue("a@b.com");
        fireEvent.change(field, {target: {value: "c@d.com"}});
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("marks itself invalid and describes itself by the error id when an error is passed", () => {
        render(<Input label="Email" id="email" error="Enter a valid email" />);
        const field = screen.getByLabelText("Email");
        expect(field).toHaveAttribute("aria-invalid", "true");
        expect(field).toHaveAttribute("aria-describedby", "email-error");
    });

    it("has no aria-invalid/aria-describedby when there is no error", () => {
        render(<Input label="Email" id="email" />);
        const field = screen.getByLabelText("Email");
        expect(field).toHaveAttribute("aria-invalid", "false");
        expect(field).not.toHaveAttribute("aria-describedby");
    });

    it("disables natively", () => {
        render(<Input label="Email" id="email" disabled />);
        expect(screen.getByLabelText("Email")).toBeDisabled();
    });

    it("does not render its own error message — that stays the consumer's responsibility", () => {
        render(<Input label="Email" id="email" error="Enter a valid email" />);
        expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();
    });
});
