import React from "react";
import { render, fireEvent } from "@testing-library/react";

// PERF-001 regression suite: AddPost previously called URL.createObjectURL(file)
// directly in the render path on every render, and never called
// URL.revokeObjectURL - leaking one blob URL per selected image per keystroke.
// The fix stores { file, previewUrl } pairs in state, creating each previewUrl
// exactly once (at selection time) and revoking it on removal, on successful
// submit, and on unmount.
//
// Phase 9 (accessibility): the clickable "remove this preview" wrapper was a
// non-semantic <div> with alt="preview-N" as the only way to identify preview
// thumbnails in tests; it's now a real <button aria-label="Remove selected
// image N"> with alt="" on the (now-redundant, since the button already has
// an accessible name) inner img. Selectors below were updated to query via
// the button's aria-label instead of the removed alt text - a test-fixture
// change only, not a weakening of what's being verified.

jest.mock("../../../Icons/RandomIcons", () => ({
    PhotoIcon: () => <span>photo-icon</span>,
}));

jest.mock("../../interaction/EmojiLibrary", () => () => <div>emoji-library</div>);

jest.mock("../../../assets/buttons/ShareButtom", () => ({ onClick, text, loading }) => (
    <button onClick={onClick} disabled={loading}>{text}</button>
));

const mockUser = { id: 1, name: "Alice", fullName: "Alice Doe", profilePictureUrl: "" };
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

const mockAddPost = jest.fn();
jest.mock("../../../context/PostProvider", () => ({
    usePosts: () => ({ addPost: mockAddPost }),
}));

const mockSwalFire = jest.fn();
// Cleanup Batch 2: swalTheme.js now calls Swal.mixin({...}) at module load
// time to build its themed instance, so this mock must expose a .mixin
// method (returning an object with its own .fire) - not just a bare .fire
// - or importing swalTheme.js throws immediately.
jest.mock("sweetalert2", () => ({
    __esModule: true,
    default: {
        fire: (...args) => mockSwalFire(...args),
        mixin: () => ({ fire: (...args) => mockSwalFire(...args) }),
    },
}));

const AddPost = require("../AddPost").default;
const { MAX_IMAGE_FILE_SIZE, MAX_POST_IMAGES, MAX_POST_IMAGES_TOTAL_SIZE } = require("../../../utils/uploadValidation");

function makeFile(name, { type = "image/png", size } = {}) {
    if (size === undefined) {
        return new File(["x"], name, { type });
    }
    const file = new File([new Uint8Array(size)], name, { type });
    Object.defineProperty(file, "size", { value: size, configurable: true });
    return file;
}

function selectFile(container, file) {
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
}

describe("AddPost - image preview object URL lifecycle (PERF-001)", () => {
    let createObjectURLSpy;
    let revokeObjectURLSpy;
    let urlCounter;

    beforeEach(() => {
        jest.clearAllMocks();
        urlCounter = 0;
        createObjectURLSpy = jest.fn(() => `blob:mock-${++urlCounter}`);
        revokeObjectURLSpy = jest.fn();
        global.URL.createObjectURL = createObjectURLSpy;
        global.URL.revokeObjectURL = revokeObjectURLSpy;
    });

    test("creates exactly one object URL per selected file, and re-rendering (typing) does not recreate them", () => {
        const { container } = render(<AddPost />);

        selectFile(container, makeFile("a.png"));
        selectFile(container, makeFile("b.png"));
        expect(createObjectURLSpy).toHaveBeenCalledTimes(2);

        const textarea = container.querySelector("textarea");
        fireEvent.change(textarea, { target: { value: "hello" } });
        fireEvent.change(textarea, { target: { value: "hello world" } });

        expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(2);
    });

    test("removing one image revokes only that image's URL, leaving the other's preview intact", () => {
        const { container } = render(<AddPost />);
        selectFile(container, makeFile("a.png"));
        selectFile(container, makeFile("b.png"));

        const previewsBefore = container.querySelectorAll('button[aria-label^="Remove selected image"] img');
        expect(previewsBefore).toHaveLength(2);
        const firstUrl = previewsBefore[0].getAttribute("src");
        const secondUrl = previewsBefore[1].getAttribute("src");

        fireEvent.click(previewsBefore[0].closest("button"));

        expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(revokeObjectURLSpy).toHaveBeenCalledWith(firstUrl);

        const previewsAfter = container.querySelectorAll('button[aria-label^="Remove selected image"] img');
        expect(previewsAfter).toHaveLength(1);
        expect(previewsAfter[0].getAttribute("src")).toBe(secondUrl);
    });

    test("revokes every remaining object URL on unmount", () => {
        const { container, unmount } = render(<AddPost />);
        selectFile(container, makeFile("a.png"));
        selectFile(container, makeFile("b.png"));

        expect(revokeObjectURLSpy).not.toHaveBeenCalled();
        unmount();
        expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2);
    });
});

// SEC-002 regression suite: AddPost previously added every selected file to
// selectedImages (and created an object URL for it) with no validation at
// all. The fix rejects files that fail validateUploadFile/MAX_POST_IMAGES
// before they ever enter state or get a preview URL.
function selectFiles(container, files) {
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files } });
}

describe("AddPost - upload validation (SEC-002)", () => {
    let createObjectURLSpy;
    let urlCounter;

    beforeEach(() => {
        jest.clearAllMocks();
        urlCounter = 0;
        createObjectURLSpy = jest.fn(() => `blob:mock-${++urlCounter}`);
        global.URL.createObjectURL = createObjectURLSpy;
        global.URL.revokeObjectURL = jest.fn();
        mockSwalFire.mockImplementation(() => Promise.resolve({}));
    });

    test("accepts a valid file and rejects an unsupported-type file from the same batch", () => {
        const { container } = render(<AddPost />);
        const goodFile = makeFile("good.png");
        const badFile = makeFile("doc.pdf", { type: "application/pdf" });

        selectFiles(container, [goodFile, badFile]);

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(1);
        expect(mockSwalFire).toHaveBeenCalledTimes(1);
        // swalTheme.js's positional Swal.fire(title, html, icon) call is merged
        // into a single options object (plus iconHtml) before reaching the
        // underlying .fire, so the message text lands on .html of that object.
        expect(mockSwalFire.mock.calls[0][0].html).toContain("doc.pdf");
    });

    test("rejects an oversized file without creating a preview or an object URL", () => {
        const { container } = render(<AddPost />);
        const oversized = makeFile("huge.png", { size: MAX_IMAGE_FILE_SIZE + 1 });

        selectFiles(container, [oversized]);

        expect(createObjectURLSpy).not.toHaveBeenCalled();
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(0);
        expect(mockSwalFire).toHaveBeenCalledTimes(1);
    });

    test("accepts a file exactly at the max size boundary", () => {
        const { container } = render(<AddPost />);
        const atLimit = makeFile("at-limit.png", { size: MAX_IMAGE_FILE_SIZE });

        selectFiles(container, [atLimit]);

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(1);
        expect(mockSwalFire).not.toHaveBeenCalled();
    });

    test(`enforces the ${MAX_POST_IMAGES}-image-per-post limit, accepting only the remaining slots`, () => {
        const { container } = render(<AddPost />);
        const firstBatch = Array.from({ length: MAX_POST_IMAGES }, (_, i) => makeFile(`img${i}.png`));
        selectFiles(container, firstBatch);
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(MAX_POST_IMAGES);

        selectFiles(container, [makeFile("one-too-many.png")]);

        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(MAX_POST_IMAGES);
        expect(mockSwalFire).toHaveBeenCalledTimes(1);
        expect(mockSwalFire.mock.calls[0][0].html).toContain(`up to ${MAX_POST_IMAGES} images`);
    });

    test("accepts a batch whose combined size lands exactly at the 10MB aggregate limit", () => {
        const { container } = render(<AddPost />);
        const half = MAX_POST_IMAGES_TOTAL_SIZE / 2;

        selectFiles(container, [makeFile("a.png", { size: half }), makeFile("b.png", { size: half })]);

        expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(2);
        expect(mockSwalFire).not.toHaveBeenCalled();
    });

    test("rejects a new file that would push the combined post image size over 10MB, without a preview or object URL", () => {
        const { container } = render(<AddPost />);
        // Two already-selected files (4MB each, both under the 5MB per-file cap) put
        // the running total at 8MB without tripping the individual size check.
        selectFiles(container, [
            makeFile("already-1.png", { size: 4 * 1024 * 1024 }),
            makeFile("already-2.png", { size: 4 * 1024 * 1024 }),
        ]);
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(2);
        createObjectURLSpy.mockClear();

        // 8MB + 3MB = 11MB > 10MB, even though 3MB alone is well under the 5MB per-file cap.
        selectFiles(container, [makeFile("too-much-more.png", { size: 3 * 1024 * 1024 })]);

        expect(createObjectURLSpy).not.toHaveBeenCalled();
        expect(container.querySelectorAll('button[aria-label^="Remove selected image"] img')).toHaveLength(2);
        expect(mockSwalFire).toHaveBeenCalledTimes(1);
        expect(mockSwalFire.mock.calls[0][0].html).toContain("10 MB");
    });
});
