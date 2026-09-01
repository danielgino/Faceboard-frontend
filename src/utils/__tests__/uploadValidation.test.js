import {
    validateUploadFile,
    validateUploadFiles,
    describeRejectionReason,
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_FILE_SIZE,
    MAX_POST_IMAGES_TOTAL_SIZE,
} from "../uploadValidation";

function makeFile({ name = "a.png", type = "image/png", size = 1024 } = {}) {
    const file = new File([new Uint8Array(size)], name, { type });
    // jsdom's File already reports the byte length correctly for a real
    // Uint8Array blob part, but this makes the intent explicit/robust across
    // environments rather than relying on that as an implementation detail.
    Object.defineProperty(file, "size", { value: size, configurable: true });
    return file;
}

describe("validateUploadFile", () => {
    test("accepts a valid image within the size limit", () => {
        const file = makeFile({ type: "image/jpeg", size: 1024 });
        expect(validateUploadFile(file)).toEqual({ valid: true });
    });

    test("accepts a file exactly at the max size boundary (backend semantics are <=)", () => {
        const file = makeFile({ size: MAX_IMAGE_FILE_SIZE });
        expect(validateUploadFile(file)).toEqual({ valid: true });
    });

    test("rejects a file one byte over the max size", () => {
        const file = makeFile({ size: MAX_IMAGE_FILE_SIZE + 1 });
        expect(validateUploadFile(file)).toEqual({ valid: false, reason: "size" });
    });

    test("rejects an unsupported MIME type", () => {
        const file = makeFile({ type: "application/pdf" });
        expect(validateUploadFile(file)).toEqual({ valid: false, reason: "type" });
    });

    test("rejects an empty file", () => {
        const file = makeFile({ size: 0 });
        expect(validateUploadFile(file)).toEqual({ valid: false, reason: "empty" });
    });

    test("every backend-allowed content type is accepted", () => {
        ALLOWED_IMAGE_TYPES.forEach((type) => {
            const file = makeFile({ type });
            expect(validateUploadFile(file)).toEqual({ valid: true });
        });
    });
});

describe("validateUploadFiles", () => {
    test("partitions a mixed batch into valid and rejected, preserving the reason", () => {
        const good = makeFile({ name: "good.png", type: "image/png", size: 100 });
        const tooBig = makeFile({ name: "big.png", type: "image/png", size: MAX_IMAGE_FILE_SIZE + 1 });
        const wrongType = makeFile({ name: "doc.pdf", type: "application/pdf", size: 100 });

        const { valid, rejected } = validateUploadFiles([good, tooBig, wrongType]);

        expect(valid).toEqual([good]);
        expect(rejected).toEqual([
            { file: tooBig, reason: "size" },
            { file: wrongType, reason: "type" },
        ]);
    });
});

describe("describeRejectionReason", () => {
    test("does not claim MIME-type checking is a security measure", () => {
        const message = describeRejectionReason("type");
        expect(message.toLowerCase()).not.toMatch(/secur/);
    });

    test("size message reflects the actual configured limit", () => {
        expect(describeRejectionReason("size")).toContain("5 MB");
    });

    test("totalSize message reflects the actual configured aggregate limit", () => {
        expect(describeRejectionReason("totalSize")).toContain("10 MB");
    });
});

describe("validateUploadFiles - aggregate post upload size (matches backend max-request-size=10MB)", () => {
    test("below the aggregate limit is accepted", () => {
        const file = makeFile({ size: 2 * 1024 * 1024 });
        const { valid, rejected } = validateUploadFiles([file], {
            maxTotalSize: MAX_POST_IMAGES_TOTAL_SIZE,
            existingTotalSize: 7 * 1024 * 1024,
        });
        expect(valid).toEqual([file]);
        expect(rejected).toEqual([]);
    });

    test("exactly at the aggregate boundary is accepted (backend semantics are <=)", () => {
        const file = makeFile({ size: 3 * 1024 * 1024 });
        const { valid, rejected } = validateUploadFiles([file], {
            maxTotalSize: MAX_POST_IMAGES_TOTAL_SIZE,
            existingTotalSize: 7 * 1024 * 1024,
        });
        expect(valid).toEqual([file]);
        expect(rejected).toEqual([]);
    });

    test("one byte over the aggregate limit is rejected with reason totalSize", () => {
        const file = makeFile({ size: 3 * 1024 * 1024 + 1 });
        const { valid, rejected } = validateUploadFiles([file], {
            maxTotalSize: MAX_POST_IMAGES_TOTAL_SIZE,
            existingTotalSize: 7 * 1024 * 1024,
        });
        expect(valid).toEqual([]);
        expect(rejected).toEqual([{ file, reason: "totalSize" }]);
    });

    test("already-selected total size counts toward the budget for a new file", () => {
        const file = makeFile({ size: 4 * 1024 * 1024 });
        const { valid, rejected } = validateUploadFiles([file], {
            maxTotalSize: MAX_POST_IMAGES_TOTAL_SIZE,
            existingTotalSize: 7 * 1024 * 1024, // 7MB + 4MB = 11MB > 10MB
        });
        expect(valid).toEqual([]);
        expect(rejected).toEqual([{ file, reason: "totalSize" }]);
    });

    test("processes a batch in order, accepting earlier files and rejecting only what pushes the total over budget", () => {
        const fileA = makeFile({ name: "a.png", size: 2 * 1024 * 1024 });
        const fileB = makeFile({ name: "b.png", size: 2 * 1024 * 1024 });
        const { valid, rejected } = validateUploadFiles([fileA, fileB], {
            maxTotalSize: MAX_POST_IMAGES_TOTAL_SIZE,
            existingTotalSize: 7 * 1024 * 1024, // 7+2=9 (A accepted), 9+2=11 (B rejected)
        });
        expect(valid).toEqual([fileA]);
        expect(rejected).toEqual([{ file: fileB, reason: "totalSize" }]);
    });

    test("omitting maxTotalSize preserves the original per-file-only behavior", () => {
        const file = makeFile({ size: 9 * 1024 * 1024 + 1 });
        const { valid, rejected } = validateUploadFiles([file]);
        // Over MAX_IMAGE_FILE_SIZE (5MB), so still rejected - but for the
        // per-file "size" reason, not "totalSize", since no aggregate budget
        // was requested.
        expect(valid).toEqual([]);
        expect(rejected).toEqual([{ file, reason: "size" }]);
    });
});
