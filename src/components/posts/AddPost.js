import React, {useState, useRef, useId, useEffect} from 'react';
import { Smile, X } from "lucide-react";
import { Textarea } from "@material-tailwind/react";
import {usePosts} from "../../context/PostProvider";
import {useUser} from "../../context/UserProvider";
import RandomIcons from "../../Icons/RandomIcons";
import EmojiLibrary from "../interaction/EmojiLibrary";
import ShareButton from "../../assets/buttons/ShareButtom";
import {Typography} from "@material-tailwind/react";
import {ADD_POST_API, fetchWithAuth, JWT_STORAGE_KEY} from "../../utils/Utils";
import {MAX_POST_IMAGES, MAX_POST_IMAGES_TOTAL_SIZE, validateUploadFiles, describeRejectionReason} from "../../utils/uploadValidation";
import Swal from "../../utils/swalTheme";
import {Avatar as PrimitiveAvatar} from "../common/Avatar";

function AddPost() {
    const [postText, setPostText] = useState('');
    // Each entry is { file, previewUrl } - previewUrl is created once, at
    // selection time, and stored alongside its File so it's stable across
    // re-renders (typing, emoji picks, etc.) instead of being recreated
    // every render. Revoked explicitly on removal, on successful submit,
    // and on unmount (see below) so nothing outlives its usefulness.
    const [selectedImages, setSelectedImages] = useState([]);
    const selectedImagesRef = useRef(selectedImages);
    selectedImagesRef.current = selectedImages;
    const fileInputRef = useRef();
    const {user, isDemo}=useUser();
    const [isPosting, setIsPosting] = useState(false);
    const {addPost}=usePosts()
    const uid = useId();
    const safeUid = uid.replace(/:/g, "");
    const postContentId = `post-content-${safeUid}`;
    const imageInputId  = `imageupload-${safeUid}`;

    // Revokes whatever preview URLs are still outstanding when AddPost
    // unmounts (e.g. the user navigated away with images selected but never
    // submitted/removed them). Reads the ref rather than closing over
    // selectedImages directly so this always sees the latest selection,
    // not whatever it was when the component first mounted.
    useEffect(() => {
        return () => {
            selectedImagesRef.current.forEach(({previewUrl}) => URL.revokeObjectURL(previewUrl));
        };
    }, []);

    const handlePostChange = (e) => {
        setPostText(e.target.value);
    };
    const removeImage = (indexToRemove) => {
        setSelectedImages((prev) => {
            const removed = prev[indexToRemove];
            if (removed) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };
    const handlePostSubmit = async () => {
        if (isPosting || isDemo) return;

        const cleanedText = postText.trim();
        if (cleanedText === '' && selectedImages.length === 0) {
            await Swal.fire("Empty Post", "Share something to the world!", "warning");
            return;
        }
            const token = localStorage.getItem(JWT_STORAGE_KEY);
            if (!token) {
                await Swal.fire("Error", "Unauthorized", "error");
                return;
            }

            const formData = new FormData();
            formData.append("postText", postText);
            selectedImages.forEach(({file}) => {
                formData.append("files", file);
            });

            try {
                setIsPosting(true);
                const response = await fetchWithAuth(ADD_POST_API, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
                }

                const newPost = await response.json();
                addPost(newPost,user.id);

                await Swal.fire({
                    title: "Post Uploaded!",
                    text: "Post Successfully added",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'center',
                });
                selectedImages.forEach(({previewUrl}) => URL.revokeObjectURL(previewUrl));
                setPostText('');
                setSelectedImages([]);
            } catch (err) {
                await Swal.fire("Error", "Post Upload Failed :( ", "error");
                console.error('Error creating post:', err);
            } finally {
                setIsPosting(false);
            }

    };


    return (
        <div className='add-post-container'>

            <div className="w-full mb-6 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-none mx-auto px-2 sm:px-4 lg:px-0">
                <div className="w-full px-4 py-3 shadow-ds-low rounded-ds-lg border border-dsNeutral-100 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                        <PrimitiveAvatar
                            size="md"
                            src={user.profilePictureUrl}
                            name={user.fullName}
                            alt={user.fullName}
                        />
                        <Typography className="text-ds-user-name text-dsNeutral-900">
                            {user.fullName}
                        </Typography>
                    </div>
                    <div>
                        {selectedImages.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto w-full max-w-full">
                                {selectedImages.map((item, index) => (
                                    <button
                                        type="button"
                                        key={item.previewUrl}
                                        className="relative block cursor-pointer border-0 bg-transparent p-0"
                                        onClick={() => removeImage(index)}
                                        title="Click to remove"
                                        aria-label={`Remove selected image ${index + 1}`}
                                    >
                                        <img
                                            src={item.previewUrl}
                                            alt=""
                                            className="w-24 h-24 object-cover rounded-control"
                                        />
                                        <span
                                            className="absolute top-0 right-0 bg-dsScrim text-white p-0.5 rounded-bl"
                                            aria-hidden="true">
                                            <X size={12} strokeWidth={2}/>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div>
                            <label htmlFor={postContentId} className="sr-only">Post content</label>
                            <Textarea value={postText}
                                      id={postContentId}
                                      name="postText"
                                      onChange={handlePostChange}
                                      variant="static"
                                      disabled={isDemo}
                                      aria-describedby={`${postContentId}-help`}
                                      label=" "
                                      labelProps={{ htmlFor: postContentId, className: "sr-only", "aria-hidden": true }}
                                      containerProps={{ className: "grid h-full rounded-md" }}
                                      placeholder={isDemo ? "Posting is disabled in Demo Mode." : `What's going on in your mind, ${user.name}?`} rows={6}/>
                        </div>
                    </div>
                        <div className="flex w-full items-center gap-1 mt-3">
                            <label
                                htmlFor={imageInputId}
                                className={`
                                 p-2 rounded-full
                                 hover:bg-dsNeutral-100
                                    focus:outline-none focus:ring-2 focus:ring-dsFocusRing
                                cursor-pointer
                                 transition ${isDemo ? "opacity-40 pointer-events-none cursor-not-allowed" : ""}`}
                                aria-label="Upload images"
                                title={isDemo ? "Uploading images is disabled in Demo Mode." : "Upload images"}
                                role="button"
                                tabIndex={isDemo ? -1 : 0}
                                aria-disabled={isDemo || undefined}
                                onClick={() => { if (!isDemo) fileInputRef.current?.click(); }}
                                onKeyDown={(e) => {
                                    if (isDemo) return;
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                            >
                                <RandomIcons.PhotoIcon/>
                                <span className="sr-only">Upload images</span>
                            </label>

                            <input
                                name="images[]"
                                type="file"
                                id={imageInputId}
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                disabled={isDemo}
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    e.target.value = "";
                                    if (files.length === 0) return;

                                    const {valid, rejected} = validateUploadFiles(files);
                                    const remainingSlots = Math.max(0, MAX_POST_IMAGES - selectedImages.length);
                                    const withinCount = valid.slice(0, remainingSlots);
                                    const droppedForCount = valid.slice(withinCount.length);

                                    const existingTotalSize = selectedImages.reduce((sum, {file}) => sum + file.size, 0);
                                    const {valid: accepted, rejected: rejectedForTotalSize} = validateUploadFiles(withinCount, {
                                        maxTotalSize: MAX_POST_IMAGES_TOTAL_SIZE,
                                        existingTotalSize,
                                    });

                                    if (rejected.length > 0 || droppedForCount.length > 0 || rejectedForTotalSize.length > 0) {
                                        const messages = [
                                            ...rejected.map(({file, reason}) => `${file.name}: ${describeRejectionReason(reason)}`),
                                            ...rejectedForTotalSize.map(({file, reason}) => `${file.name}: ${describeRejectionReason(reason)}`),
                                            ...(droppedForCount.length > 0 ? [`You can upload up to ${MAX_POST_IMAGES} images per post.`] : []),
                                        ];
                                        Swal.fire("Some files were not added", messages.join("\n"), "warning");
                                    }

                                    if (accepted.length === 0) return;

                                    const newItems = accepted.map((file) => ({
                                        file,
                                        previewUrl: URL.createObjectURL(file),
                                    }));
                                    setSelectedImages(prev => [...prev, ...newItems]);
                                }}
                            />
                            <EmojiLibrary
                                icon={Smile}
                                triggerClassName="p-2 rounded-full hover:bg-dsNeutral-100 transition text-dsNeutral-600"
                                triggerLabel="Choose emoji"
                                onEmojiClick={(emoji) => setPostText(prev => prev + emoji.emoji)}
                            />
                            <div className="flex-1"/>
                            <ShareButton onClick={handlePostSubmit} text={"Share"} loading={isPosting} disabled={isDemo}/>
                        </div>
                </div>

            </div>

        </div>
);
}

export default AddPost;
