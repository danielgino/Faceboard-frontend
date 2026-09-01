// Phase 14: SignUp.js, Settings.js, and ForgotPassword.js each independently
// re-declared the identical email-format regex. Centralized here as a pure
// function (no React dependency) - each caller still owns its own error
// message text, this is deduplication of the rule only.
const EMAIL_FORMAT_REGEX = /\S+@\S+\.\S+/;

export function isValidEmail(value) {
    return EMAIL_FORMAT_REGEX.test(value);
}
