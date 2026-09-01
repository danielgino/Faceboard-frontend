// JWT audit (Option A) regression suite: authCleanup.handleUnauthorized is the
// single, shared, idempotent "unauthorized" cleanup path triggered by
// fetchWithAuth (Utils.js) on a 401. Each test re-imports the module fresh via
// jest.isolateModules so the module-level `unauthorizedHandled` flag doesn't
// leak state between tests.

function mockLocation(pathname) {
    const replace = jest.fn();
    Object.defineProperty(window, "location", {
        configurable: true,
        value: { pathname, replace },
    });
    return replace;
}

function freshHandleUnauthorized() {
    return freshAuthCleanup().handleUnauthorized;
}

function freshAuthCleanup() {
    let mod;
    jest.isolateModules(() => {
        mod = require("../authCleanup");
    });
    return mod;
}

beforeEach(() => {
    localStorage.clear();
});

describe("authCleanup.handleUnauthorized - shared idempotent 401 cleanup path", () => {
    test("removes the stored JWT and redirects to the login page", () => {
        const replace = mockLocation("/feed");
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const handleUnauthorized = freshHandleUnauthorized();

        handleUnauthorized("/login");

        expect(localStorage.getItem("jwtToken")).toBeNull();
        expect(replace).toHaveBeenCalledTimes(1);
        expect(replace).toHaveBeenCalledWith("/login");
    });

    test("a second call after cleanup already ran is a no-op", () => {
        const replace = mockLocation("/feed");
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const handleUnauthorized = freshHandleUnauthorized();

        handleUnauthorized("/login");
        localStorage.setItem("jwtToken", "reinstated-token");
        handleUnauthorized("/login");

        expect(replace).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem("jwtToken")).toBe("reinstated-token");
    });

    test("many concurrent failures only clean up and redirect once", () => {
        const replace = mockLocation("/feed");
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const handleUnauthorized = freshHandleUnauthorized();

        handleUnauthorized("/login");
        handleUnauthorized("/login");
        handleUnauthorized("/login");
        handleUnauthorized("/login");

        expect(replace).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem("jwtToken")).toBeNull();
    });

    test("does nothing when already on the login page", () => {
        const replace = mockLocation("/login");
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const handleUnauthorized = freshHandleUnauthorized();

        handleUnauthorized("/login");

        expect(replace).not.toHaveBeenCalled();
        expect(localStorage.getItem("jwtToken")).toBe("abc.def.ghi");
    });
});

// SEC-004: clearStoredSession is the one piece of cleanup genuinely shared
// between handleUnauthorized (above) and UserProvider.logout - it must remove
// the stored token and do nothing else (no redirect, no idempotency guard),
// since the two callers deliberately keep their own separate redirect/state
// semantics.
describe("authCleanup.clearStoredSession - shared token removal, no redirect", () => {
    test("removes the stored JWT", () => {
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const { clearStoredSession } = freshAuthCleanup();

        clearStoredSession();

        expect(localStorage.getItem("jwtToken")).toBeNull();
    });

    test("does not perform any redirect", () => {
        const replace = mockLocation("/feed");
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const { clearStoredSession } = freshAuthCleanup();

        clearStoredSession();

        expect(replace).not.toHaveBeenCalled();
    });

    test("is not gated by handleUnauthorized's idempotency flag - repeated calls always remove the token", () => {
        const replace = mockLocation("/feed");
        localStorage.setItem("jwtToken", "abc.def.ghi");
        const { handleUnauthorized, clearStoredSession } = freshAuthCleanup();

        handleUnauthorized("/login");
        localStorage.setItem("jwtToken", "reinstated-token");
        clearStoredSession();

        expect(replace).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem("jwtToken")).toBeNull();
    });
});
