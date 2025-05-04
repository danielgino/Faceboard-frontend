import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

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
            preConfirm: (selectedFile) => {
                if (!selectedFile) {
                    Swal.showValidationMessage("You need to select an image");
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
        });

        MySwal.fire({
            title: "Uploading...",
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false,
        });

        const uploaded = await uploadStory(file, caption || "");
        if (uploaded) {
            await fetchStories();
            MySwal.fire("✅ Success", "Story uploaded!", "success");
        } else {
            MySwal.fire("❌ Error", "Upload failed", "error");
        }
    } catch (err) {
        console.error("Upload error:", err);
        Swal.fire("Error", "Something went wrong!", "error");
    }
}
