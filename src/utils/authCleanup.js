// Single, reusable, idempotent "unauthorized" cleanup path, triggered by every
// authenticated request made through fetchWithAuth (Utils.js) on a 401 - so a
// burst of concurrently-failing requests only cleans up/redirects once.
//
// loginPage is passed in by the caller (rather than imported from Utils.js)
// to avoid a circular import between this module and Utils.js. JWT_STORAGE_KEY
// is defined here instead (and re-exported from Utils.js) for the same reason
// - Utils.js already imports from this module, so defining the constant here
// keeps that dependency one-directional.
export const JWT_STORAGE_KEY = "jwtToken";

// The one piece of cleanup genuinely shared between the 401/unauthorized path
// and manual logout (UserProvider.logout). Everything else - redirect
// mechanism, idempotency, React context state resets - deliberately differs
// between the two callers and stays owned by each of them; SEC-004 found only
// this single line duplicated, not two equivalent cleanup flows.
export function clearStoredSession() {
    localStorage.removeItem(JWT_STORAGE_KEY);
}

let unauthorizedHandled = false;

export function handleUnauthorized(loginPage) {
    if (unauthorizedHandled) return;
    if (window.location.pathname === loginPage) return;
    unauthorizedHandled = true;
    clearStoredSession();
    window.location.replace(loginPage);
}
