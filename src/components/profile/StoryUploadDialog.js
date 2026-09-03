import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ThemedSwal from "../../utils/swalTheme";
import {validateUploadFile, describeRejectionReason} from "../../utils/uploadValidation";

// withReactContent(...) doesn't reliably inherit Swal.mixin() defaults
// (confirmed in browser testing) - so buttonsStyling is set explicitly per
// call here instead of via the shared utils/swalTheme mixin every other
// Swal.fire call site uses. The visual theme itself (SwalDesignTheme.css)
// is keyed off SweetAlert2's own always-present classes, not an opt-in
// customClass, so it applies here with no extra wiring either way. The
// file-picker/caption steps below still need this raw MySwal (input +
// preConfirm aren't exposed by the ThemedSwal mixin); the post-upload
// result popup instead uses ThemedSwal directly, matching every other
// plain title/text/icon popup in the app (SharePostModal, UserDetails, etc.).
const MySwal = withReactContent(Swal);
const DS_SWAL_OPTS = { buttonsStyling: false };

export default async function openStoryUploadDialog(uploadStory, fetchStories) {
    try {
        const { value: file } = await MySwal.fire({
            title: "Upload a Story",
            input: "file",
            inputAttributes: {
                accept: "image/*",
                "aria-label": "Upload your story image",
            },
            showCancelButton: true,
            confirmButtonText: "Next",
            cancelButtonText: "Cancel",
            ...DS_SWAL_OPTS,
            preConfirm: (selectedFile) => {
                if (!selectedFile) {
                    Swal.showValidationMessage("You need to select an image");
                    return selectedFile;
                }

                const validation = validateUploadFile(selectedFile);
                if (!validation.valid) {
                    Swal.showValidationMessage(describeRejectionReason(validation.reason));
                    return;
                }

                return selectedFile;
            },
        });

        if (!file) return;

        const { value: caption } = await MySwal.fire({
            title: "Add a caption (optional)",
            input: "text",
            inputLabel: "Caption",
            inputPlaceholder: "Write something...",
            showCancelButton: true,
            ...DS_SWAL_OPTS,
        });

        MySwal.fire({
            title: "Uploading...",
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false,
            ...DS_SWAL_OPTS,
        });

        const uploaded = await uploadStory(file, caption || "");
        if (uploaded) {
            await fetchStories();
            ThemedSwal.fire({ title: "Success", text: "Story uploaded!", icon: "success" });
        } else {
            ThemedSwal.fire({ title: "Error", text: "Upload failed", icon: "error" });
        }
    } catch (err) {
        console.error("Upload error:", err);
        MySwal.fire({ title: "Error", text: "Something went wrong!", icon: "error", ...DS_SWAL_OPTS });
    }
}
