import { validatePassword, validatePasswordConfirmation } from "../passwordValidation";

// HOOK-002 regression suite: pins down the exact rules previously duplicated
// across SignUp.js, Settings.js, and ResetPassword.js, so a future edit to
// this shared utility can't silently change any of the three forms.

describe("validatePassword", () => {
    test("accepts a password meeting length + complexity rules", () => {
        expect(validatePassword("Abcdefg1!")).toBe("");
    });

    test("rejects a password under 8 characters", () => {
        expect(validatePassword("Ab1!")).toBe("Password must be at least 8 characters");
    });

    test("rejects a password exactly at 7 characters (below the boundary)", () => {
        expect(validatePassword("Abcdef1")).toBe("Password must be at least 8 characters");
    });

    test("accepts a password exactly at the 8-character boundary", () => {
        expect(validatePassword("Abcdefg1")).not.toBe("Password must be at least 8 characters");
    });

    test.each([
        ["missing uppercase", "abcdefg1!"],
        ["missing lowercase", "ABCDEFG1!"],
        ["missing digit", "Abcdefgh!"],
        ["missing symbol", "Abcdefgh1"],
    ])("rejects a password %s", (_label, password) => {
        expect(validatePassword(password)).toBe(
            "Password must include uppercase, lowercase, number and symbol"
        );
    });
});

describe("validatePasswordConfirmation", () => {
    test("accepts a matching confirmation", () => {
        expect(validatePasswordConfirmation("Abcdefg1!", "Abcdefg1!")).toBe("");
    });

    test("rejects a non-matching confirmation", () => {
        expect(validatePasswordConfirmation("Abcdefg1!", "Different1!")).toBe(
            "Passwords do not match"
        );
    });

    test("rejects an empty confirmation against a non-empty password", () => {
        expect(validatePasswordConfirmation("Abcdefg1!", "")).toBe("Passwords do not match");
    });
});
