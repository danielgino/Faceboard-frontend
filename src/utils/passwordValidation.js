// HOOK-002: SignUp.js, Settings.js, and ResetPassword.js each implemented
// identical password-strength and password-confirmation-match rules/messages.
// Centralized here as pure functions (no React dependency) since none of the
// three consumers need anything beyond a synchronous string-in, message-out
// check - this is deduplication only, not a rules or wording change.
const PASSWORD_STRENGTH_REGEX = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/;

export function validatePassword(password) {
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }
    if (!PASSWORD_STRENGTH_REGEX.test(password)) {
        return "Password must include uppercase, lowercase, number and symbol";
    }
    return "";
}

export function validatePasswordConfirmation(password, confirmation) {
    if (confirmation !== password) {
        return "Passwords do not match";
    }
    return "";
}
