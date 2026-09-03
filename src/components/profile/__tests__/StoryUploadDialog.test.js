// SEC-002 regression suite: openStoryUploadDialog's SweetAlert2 file input
// only used `accept: "image/*"` as a file-picker hint - the returned File
// was never actually validated before being handed to uploadStory. The fix
// validates it inside preConfirm (the same mechanism already used for the
// "no file selected" case), so an invalid file keeps the user in the dialog
// with a validation message instead of proceeding to upload.

const mockShowValidationMessage = jest.fn();
jest.mock("sweetalert2", () => ({
    __esModule: true,
    default: {
        fire: jest.fn(() => Promise.resolve({})),
        showValidationMessage: (...args) => mockShowValidationMessage(...args),
    },
}));

const mockMySwalFire = jest.fn();
jest.mock("sweetalert2-react-content", () => ({
    __esModule: true,
    default: () => ({
        fire: (config) => mockMySwalFire(config),
    }),
}));

// The post-upload Success/Error popup uses the shared ThemedSwal (utils/swalTheme) directly,
// same as every other plain title/text/icon popup in the app (SharePostModal, UserDetails, ...)
// - mocked independently of the raw "sweetalert2" mock above, which only backs the file-picker/
// caption steps' MySwal.
const mockThemedSwalFire = jest.fn();
jest.mock("../../../utils/swalTheme", () => ({
    __esModule: true,
    default: { fire: (...args) => mockThemedSwalFire(...args) },
}));

const openStoryUploadDialog = require("../StoryUploadDialog").default;

function makeFile(name, { type = "image/png", size = 1024 } = {}) {
    const file = new File([new Uint8Array(size)], name, { type });
    Object.defineProperty(file, "size", { value: size, configurable: true });
    return file;
}

beforeEach(() => {
    // react-scripts' default Jest config sets resetMocks: true, which wipes
    // any implementation given to jest.fn(impl) before every test - the
    // implementation has to be (re-)established here via mockImplementation.
    // Resolving with an undefined `value` mimics the dialog being cancelled,
    // so openStoryUploadDialog returns immediately after the first fire()
    // call without needing to mock the caption/uploading dialogs too.
    mockMySwalFire.mockImplementation(() => Promise.resolve({ value: undefined }));
});

async function capturePreConfirm() {
    await openStoryUploadDialog(jest.fn(), jest.fn());
    return mockMySwalFire.mock.calls[0][0].preConfirm;
}

test("accepts a valid file with no validation message", async () => {
    const preConfirm = await capturePreConfirm();
    const file = makeFile("story.png");

    expect(preConfirm(file)).toBe(file);
    expect(mockShowValidationMessage).not.toHaveBeenCalled();
});

test("rejects an oversized file, keeping the dialog open with a validation message", async () => {
    const preConfirm = await capturePreConfirm();
    const oversized = makeFile("huge.png", { size: 5 * 1024 * 1024 + 1 });

    expect(preConfirm(oversized)).toBeUndefined();
    expect(mockShowValidationMessage).toHaveBeenCalledWith(expect.stringContaining("5 MB"));
});

test("rejects an unsupported MIME type", async () => {
    const preConfirm = await capturePreConfirm();
    const badFile = makeFile("doc.pdf", { type: "application/pdf" });

    expect(preConfirm(badFile)).toBeUndefined();
    expect(mockShowValidationMessage).toHaveBeenCalledWith(expect.stringContaining("Unsupported file type"));
});

test("still shows the original message when no file was selected", async () => {
    const preConfirm = await capturePreConfirm();

    expect(preConfirm(undefined)).toBeUndefined();
    expect(mockShowValidationMessage).toHaveBeenCalledWith("You need to select an image");
});

describe("post-upload result popup", () => {
    function mockFileThenCaptionThenUploading() {
        mockMySwalFire
            .mockImplementationOnce(() => Promise.resolve({ value: makeFile("story.png") })) // file picker
            .mockImplementationOnce(() => Promise.resolve({ value: "caption" })) // caption
            .mockImplementationOnce(() => Promise.resolve({})); // "Uploading..." (not awaited by the dialog)
    }

    test("uses the shared ThemedSwal (not the raw MySwal) for a successful upload", async () => {
        mockFileThenCaptionThenUploading();
        const uploadStory = jest.fn(() => Promise.resolve({ id: "s1" }));
        const fetchStories = jest.fn(() => Promise.resolve());

        await openStoryUploadDialog(uploadStory, fetchStories);

        expect(mockThemedSwalFire).toHaveBeenCalledWith({
            title: "Success",
            text: "Story uploaded!",
            icon: "success",
        });
        // The result popup is themed identically to every other plain
        // Faceboard popup - no toast/position/DS_SWAL_OPTS overrides.
        expect(mockThemedSwalFire.mock.calls[0][0]).not.toHaveProperty("toast");
        expect(mockThemedSwalFire.mock.calls[0][0]).not.toHaveProperty("buttonsStyling");
    });

    test("uses the shared ThemedSwal for a failed upload", async () => {
        mockFileThenCaptionThenUploading();
        const uploadStory = jest.fn(() => Promise.resolve(null));
        const fetchStories = jest.fn();

        await openStoryUploadDialog(uploadStory, fetchStories);

        expect(mockThemedSwalFire).toHaveBeenCalledWith({
            title: "Error",
            text: "Upload failed",
            icon: "error",
        });
        expect(fetchStories).not.toHaveBeenCalled();
    });
});
