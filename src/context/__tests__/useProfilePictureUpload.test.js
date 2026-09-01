import { renderHook, act } from "@testing-library/react";

// SEC-002 regression suite: useProfilePictureUpload previously sent any
// selected file straight to the upload endpoint with no client-side
// validation at all. The fix rejects files that fail validateUploadFile
// before fetchWithAuth is ever called.

const mockUser = { id: 1 };
jest.mock("../UserProvider", () => ({
    useUser: () => ({
        user: mockUser,
        setUser: jest.fn(),
        updateUserProfilePicture: jest.fn(),
        fetchUserDetails: jest.fn(),
    }),
}));

jest.mock("../PostProvider", () => ({
    usePosts: () => ({ fetchUserPosts: jest.fn() }),
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
    UPLOAD_PROFILE_PIC_API: (userId) => `/api/user/${userId}/profile-picture`,
    DELETE_PROFILE_PIC_API: (userId) => `/api/user/${userId}/profile-picture`,
    JWT_STORAGE_KEY: "jwtToken",
}));

const useProfilePictureUpload = require("../useProfilePictureUpload").default;

function makeFile(name, { type = "image/png", size = 1024 } = {}) {
    const file = new File([new Uint8Array(size)], name, { type });
    Object.defineProperty(file, "size", { value: size, configurable: true });
    return file;
}

function makeChangeEvent(file) {
    return { target: { files: file ? [file] : [], value: "x" } };
}

let alertSpy;

beforeEach(() => {
    // react-scripts' default Jest config sets resetMocks: true, which wipes
    // any implementation given to jest.fn(impl) before every test - the
    // implementation has to be (re-)established here via mockImplementation.
    mockFetchWithAuth.mockImplementation(() => Promise.resolve({ ok: true, text: async () => "https://img/new.png" }));
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
    alertSpy.mockRestore();
});

test("uploads a valid file", async () => {
    const { result } = renderHook(() => useProfilePictureUpload());

    await act(async () => {
        result.current.handleFileChange(makeChangeEvent(makeFile("avatar.png")));
    });

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/user/1/profile-picture", expect.objectContaining({ method: "POST" }));
    expect(alertSpy).not.toHaveBeenCalled();
});

test("rejects an oversized file without calling the upload endpoint", async () => {
    const { result } = renderHook(() => useProfilePictureUpload());
    const oversized = makeFile("huge.png", { size: 5 * 1024 * 1024 + 1 });

    await act(async () => {
        result.current.handleFileChange(makeChangeEvent(oversized));
    });

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("5 MB"));
});

test("rejects an unsupported MIME type without calling the upload endpoint", async () => {
    const { result } = renderHook(() => useProfilePictureUpload());
    const badFile = makeFile("doc.pdf", { type: "application/pdf" });

    await act(async () => {
        result.current.handleFileChange(makeChangeEvent(badFile));
    });

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Unsupported file type"));
});
