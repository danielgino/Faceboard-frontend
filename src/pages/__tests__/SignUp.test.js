import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUp from "../SignUp";
import { GenderEnum } from "../../utils/Utils";

// Phase 8G: SignUp had no dedicated coverage protecting its registration
// payload/validation-gate/error-feedback behavior. These tests pin that
// down so any future change to SignUp (including further decomposition)
// can't silently drop/rename a field or change the submission gate.

// react-router-dom@7's package.json "main" points at a file absent from the
// installed version, which the exports-map-blind Jest 27 resolver (bundled
// with this project's react-scripts@5) can't work around; virtual:true
// tells Jest not to try resolving the real module path at all (see the same
// workaround in src/components/profile/__tests__/UserDetailsEmailSource.test.js).
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}), { virtual: true });

const mockSwalFire = jest.fn(() => Promise.resolve({}));
// `Swal` is consumed through src/utils/swalTheme.js, which calls
// `Swal.mixin(...)` at module load and then reassigns `.fire` on the result,
// so the mock has to be a single mutable object that returns itself from
// `mixin`.
jest.mock("sweetalert2", () => {
    const swal = {
        fire: (...args) => mockSwalFire(...args),
        close: jest.fn(),
        showLoading: jest.fn(),
        mixin: () => swal,
    };
    return swal;
});

const mockFetchWithRetries = jest.fn();
jest.mock("../../utils/fetchWithRetries", () => ({
    fetchWithRetries: (...args) => mockFetchWithRetries(...args),
}));

beforeEach(() => {
    mockNavigate.mockClear();
    mockSwalFire.mockClear();
    mockFetchWithRetries.mockReset();
});

function fillField(label, value) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValidForm(overrides = {}) {
    const values = {
        name: "Alice",
        lastname: "Smith",
        gender: GenderEnum.MALE,
        username: "alice123",
        email: "alice@example.com",
        password: "GoodPass1!",
        confirmPassword: "GoodPass1!",
        birthDate: "2000-01-01",
        ...overrides,
    };

    fillField("Name", values.name);
    fillField("Lastname", values.lastname);
    fireEvent.change(screen.getByLabelText("Gender"), { target: { value: values.gender } });
    fillField("Username", values.username);
    fillField("Email", values.email);
    fillField("Password", values.password);
    fillField("Confirm Password", values.confirmPassword);
    fireEvent.change(screen.getByLabelText("Birth Date"), { target: { value: values.birthDate } });

    return values;
}

function submit() {
    fireEvent.click(screen.getByText("Create account"));
}

test("a fully valid form submits the exact expected registration payload", async () => {
    mockFetchWithRetries.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<SignUp />);

    const values = fillValidForm();
    submit();

    await waitFor(() => expect(mockFetchWithRetries).toHaveBeenCalledTimes(1));

    const [url, options] = mockFetchWithRetries.mock.calls[0];
    expect(url).toContain("/user/register");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual(values);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
});

test("an invalid password blocks submission without calling the API", async () => {
    render(<SignUp />);

    fillValidForm({ password: "short", confirmPassword: "short" });
    submit();

    await waitFor(() =>
        expect(mockSwalFire).toHaveBeenCalledWith(
            expect.objectContaining({ text: "Please fix the errors in the form before submitting." })
        )
    );
    expect(mockFetchWithRetries).not.toHaveBeenCalled();
});

test("a mismatched password confirmation blocks submission without calling the API", async () => {
    render(<SignUp />);

    fillValidForm({ password: "GoodPass1!", confirmPassword: "Different1!" });
    submit();

    await waitFor(() =>
        expect(mockSwalFire).toHaveBeenCalledWith(
            expect.objectContaining({ text: "Please fix the errors in the form before submitting." })
        )
    );
    expect(mockFetchWithRetries).not.toHaveBeenCalled();
});

function fillEveryFieldButGender() {
    fillField("Name", "Alice");
    fillField("Lastname", "Smith");
    fillField("Username", "alice123");
    fillField("Email", "alice@example.com");
    fillField("Password", "GoodPass1!");
    fillField("Confirm Password", "GoodPass1!");
    fireEvent.change(screen.getByLabelText("Birth Date"), { target: { value: "2000-01-01" } });
}

test("submitting with Gender unselected marks the field red like the other required fields", async () => {
    render(<SignUp />);

    // Gender is never interacted with — the exact QA scenario.
    fillEveryFieldButGender();
    const gender = screen.getByLabelText("Gender");
    expect(gender).not.toHaveClass("border-dsDestructive");
    expect(gender).toHaveAttribute("aria-invalid", "false");

    submit();

    await waitFor(() =>
        expect(mockSwalFire).toHaveBeenCalledWith(
            expect.objectContaining({ text: "Please fix the errors in the form before submitting." })
        )
    );

    // Same invalid signalling the text/password fields get from the Input primitive.
    expect(gender).toHaveClass("border-dsDestructive");
    expect(gender).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Gender is required")).toBeInTheDocument();
    expect(mockFetchWithRetries).not.toHaveBeenCalled();
});

test("selecting a Gender clears its error state", async () => {
    render(<SignUp />);

    fillEveryFieldButGender();
    submit();

    const gender = screen.getByLabelText("Gender");
    await waitFor(() => expect(gender).toHaveClass("border-dsDestructive"));

    fireEvent.change(gender, { target: { value: GenderEnum.FEMALE } });

    expect(gender).not.toHaveClass("border-dsDestructive");
    expect(gender).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByText("Gender is required")).not.toBeInTheDocument();
});

test("a failed registration shows the server error message and does not navigate", async () => {
    mockFetchWithRetries.mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Username already taken" }),
    });
    render(<SignUp />);

    fillValidForm();
    submit();

    await waitFor(() =>
        expect(mockSwalFire).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Error!",
                text: "Registration failed: Username already taken",
            })
        )
    );
    expect(mockNavigate).not.toHaveBeenCalled();
});
