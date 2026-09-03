import { render, screen, fireEvent } from "@testing-library/react";
import SuggestedFriends from "../SuggestedFriends";

// Demo Mode: `disabled` renders a genuinely non-interactive Add control (native `disabled`
// attribute, not just styling) - clicking it must never fire onAdd, so no friend-request API
// call can ever originate from this card while Demo Mode is active.

function person(id) {
    return { id, fullName: `Person ${id}`, username: `person${id}`, profilePictureUrl: "" };
}

test("clicking Add calls onAdd when not disabled", () => {
    const onAdd = jest.fn();
    render(<SuggestedFriends suggestions={[person(1)]} onAdd={onAdd} />);

    fireEvent.click(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith(1);
});

test("disabled=true renders a non-interactive Add button that never calls onAdd", () => {
    const onAdd = jest.fn();
    render(<SuggestedFriends suggestions={[person(1)]} onAdd={onAdd} disabled />);

    const addButton = screen.getByText("Add");
    expect(addButton).toBeDisabled();

    fireEvent.click(addButton);

    expect(onAdd).not.toHaveBeenCalled();
});

test("disabled=true still shows suggestion names and avatars", () => {
    render(<SuggestedFriends suggestions={[person(7)]} disabled />);

    expect(screen.getByText("Person 7")).toBeInTheDocument();
    expect(screen.getByText("@person7")).toBeInTheDocument();
});
