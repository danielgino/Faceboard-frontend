// SEC-002: client-side upload validation shared by AddPost, useProfilePictureUpload,
// and StoryUploadDialog. This is a UX convenience only - not a security boundary. The
// backend (ImageUploadValidator.java) is the sole authority: it independently
// re-validates the declared Content-Type against fully-decoded image bytes before
// anything reaches Cloudinary, regardless of what the client sends. These values
// mirror the backend's actual, verified configuration so the two rarely disagree:
//   - allowed types: ImageUploadValidator.ALLOWED_CONTENT_TYPES
//   - max file size: spring.servlet.multipart.max-file-size=5MB (application.properties),
//     enforced globally for all three upload endpoints (UserController.uploadProfilePicture,
//     StoryController.uploadStory, PostController.addPost)
//   - max post image count: PostController.addPost's `files.size() > 4` rejection
//   - max combined post request size: spring.servlet.multipart.max-request-size=10MB,
//     which matters only for PostController.addPost since it's the only endpoint that
//     can put more than one file in a single multipart request
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_POST_IMAGES = 4;
export const MAX_POST_IMAGES_TOTAL_SIZE = 10 * 1024 * 1024;

export function validateUploadFile(file, { maxSize = MAX_IMAGE_FILE_SIZE, allowedTypes = ALLOWED_IMAGE_TYPES } = {}) {
    if (!file || file.size === 0) {
        return { valid: false, reason: "empty" };
    }
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, reason: "type" };
    }
    if (file.size > maxSize) {
        return { valid: false, reason: "size" };
    }
    return { valid: true };
}

// maxTotalSize/existingTotalSize are optional - when maxTotalSize is omitted, behavior
// is unchanged (per-file checks only). When present, each file is additionally checked
// against a running total (seeded by existingTotalSize) in selection order, so files
// already over budget because of earlier accepted files are rejected with reason
// "totalSize" without disturbing files accepted before them.
export function validateUploadFiles(files, { maxSize, allowedTypes, maxTotalSize, existingTotalSize = 0 } = {}) {
    const valid = [];
    const rejected = [];
    let runningTotal = existingTotalSize;
    files.forEach((file) => {
        const result = validateUploadFile(file, { maxSize, allowedTypes });
        if (!result.valid) {
            rejected.push({ file, reason: result.reason });
            return;
        }
        if (maxTotalSize !== undefined && runningTotal + file.size > maxTotalSize) {
            rejected.push({ file, reason: "totalSize" });
            return;
        }
        runningTotal += file.size;
        valid.push(file);
    });
    return { valid, rejected };
}

export function describeRejectionReason(reason, { maxSize = MAX_IMAGE_FILE_SIZE, maxTotalSize = MAX_POST_IMAGES_TOTAL_SIZE } = {}) {
    switch (reason) {
        case "empty":
            return "The selected file is empty.";
        case "type":
            return "Unsupported file type. Only JPEG, PNG, GIF, and WEBP images are allowed.";
        case "size":
            return `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))} MB.`;
        case "totalSize":
            return `Total post image size cannot exceed ${Math.round(maxTotalSize / (1024 * 1024))} MB.`;
        default:
            return "This file could not be uploaded.";
    }
}
