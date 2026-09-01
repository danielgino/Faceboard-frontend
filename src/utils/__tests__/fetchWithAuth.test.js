// JWT audit (Option A) regression suite: fetchWithAuth (Utils.js) is the
// single, reusable authenticated-fetch path every migrated raw-fetch call
// site now goes through. authCleanup is mocked here so these tests isolate
// fetchWithAuth's own behavior (header attachment, RequestInit/FormData
// preservation, 401-only trigger) from authCleanup's own idempotency logic,
// which has its own dedicated suite in authCleanup.test.js.

const mockHandleUnauthorized = jest.fn();
jest.mock("../authCleanup", () => ({
    handleUnauthorized: (...args) => mockHandleUnauthorized(...args),
    JWT_STORAGE_KEY: "jwtToken",
}));

const { fetchWithAuth, LOGIN_PAGE } = require("../Utils");

function jsonResponse(status, body = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
        text: async () => JSON.stringify(body),
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
});

describe("fetchWithAuth - shared authenticated-fetch path", () => {
    test("attaches the current localStorage token as a Bearer Authorization header", async () => {
        localStorage.setItem("jwtToken", "token-v1");
        global.fetch.mockResolvedValue(jsonResponse(200));

        await fetchWithAuth("/api/x");

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [, init] = global.fetch.mock.calls[0];
        expect(init.headers.Authorization).toBe("Bearer token-v1");
    });

    test("reads the token fresh at request time, not a stale captured value", async () => {
        localStorage.setItem("jwtToken", "old-token");
        global.fetch.mockResolvedValue(jsonResponse(200));
        await fetchWithAuth("/api/x");
        expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer old-token");

        localStorage.setItem("jwtToken", "new-token");
        await fetchWithAuth("/api/x");
        expect(global.fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer new-token");
    });

    test("preserves caller-supplied headers and other RequestInit options (method, signal, body)", async () => {
        localStorage.setItem("jwtToken", "t");
        global.fetch.mockResolvedValue(jsonResponse(200));
        const controller = new AbortController();

        await fetchWithAuth("/api/x", {
            method: "PUT",
            headers: { "X-Custom": "yes" },
            signal: controller.signal,
            body: JSON.stringify({ a: 1 }),
        });

        const [url, init] = global.fetch.mock.calls[0];
        expect(url).toBe("/api/x");
        expect(init.method).toBe("PUT");
        expect(init.headers["X-Custom"]).toBe("yes");
        expect(init.signal).toBe(controller.signal);
        expect(init.body).toBe(JSON.stringify({ a: 1 }));
    });

    test("defaults Content-Type to application/json when unset and the body isn't FormData", async () => {
        localStorage.setItem("jwtToken", "t");
        global.fetch.mockResolvedValue(jsonResponse(200));

        await fetchWithAuth("/api/x", { method: "POST", body: JSON.stringify({}) });

        expect(global.fetch.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");
    });

    test("does not set Content-Type for a FormData body, preserving the browser's auto multipart boundary", async () => {
        localStorage.setItem("jwtToken", "t");
        global.fetch.mockResolvedValue(jsonResponse(200));
        const form = new FormData();
        form.append("file", new Blob(["x"]), "x.png");

        await fetchWithAuth("/api/upload", { method: "POST", body: form });

        const [, init] = global.fetch.mock.calls[0];
        expect(Object.keys(init.headers).some((k) => k.toLowerCase() === "content-type")).toBe(false);
        expect(init.body).toBe(form);
    });

    test("does not override a Content-Type explicitly supplied by the caller", async () => {
        localStorage.setItem("jwtToken", "t");
        global.fetch.mockResolvedValue(jsonResponse(200));

        await fetchWithAuth("/api/x", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: "raw",
        });

        expect(global.fetch.mock.calls[0][1].headers["Content-Type"]).toBe("text/plain");
    });

    test("on a 401 response, triggers the shared unauthorized-cleanup path and still returns the original Response", async () => {
        localStorage.setItem("jwtToken", "t");
        const res = jsonResponse(401, { message: "expired" });
        global.fetch.mockResolvedValue(res);

        const returned = await fetchWithAuth("/api/x");

        expect(mockHandleUnauthorized).toHaveBeenCalledTimes(1);
        expect(mockHandleUnauthorized).toHaveBeenCalledWith(LOGIN_PAGE);
        expect(returned).toBe(res);
    });

    test.each([400, 403, 404, 409, 413, 500])(
        "a %i response does not trigger the unauthorized-cleanup path",
        async (status) => {
            localStorage.setItem("jwtToken", "t");
            global.fetch.mockResolvedValue(jsonResponse(status));

            await fetchWithAuth("/api/x");

            expect(mockHandleUnauthorized).not.toHaveBeenCalled();
        }
    );

    test("a successful response is returned unchanged for the caller to parse", async () => {
        localStorage.setItem("jwtToken", "t");
        const res = jsonResponse(200, { hello: "world" });
        global.fetch.mockResolvedValue(res);

        const returned = await fetchWithAuth("/api/x");

        expect(returned).toBe(res);
        await expect(returned.json()).resolves.toEqual({ hello: "world" });
    });

    test("a network failure (rejected fetch) propagates untranslated and does not trigger cleanup", async () => {
        localStorage.setItem("jwtToken", "t");
        const networkError = new Error("network down");
        global.fetch.mockRejectedValue(networkError);

        await expect(fetchWithAuth("/api/x")).rejects.toBe(networkError);
        expect(mockHandleUnauthorized).not.toHaveBeenCalled();
    });
});
