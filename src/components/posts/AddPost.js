import React, {useState, useRef, useId} from 'react';
import { Textarea } from "@material-tailwind/react";
import {usePosts} from "../../context/PostProvider";
import {useUser} from "../../context/UserProvider";
import RandomIcons from "../../Icons/RandomIcons";
import EmojiLibrary from "../interaction/EmojiLibrary";
import ShareButton from "../../assets/buttons/ShareButtom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
} from "@material-tailwind/react";
import {ADD_POST_API} from "../../utils/Utils";
import Swal from "sweetalert2";

function AddPost() {
    const [postText, setPostText] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef();
    const {user}=useUser();
    const [isPosting, setIsPosting] = useState(false);
    const {addPost}=usePosts()
    const uid = useId();
    const safeUid = uid.replace(/:/g, "");
    const postContentId = `post-content-${safeUid}`;
    const imageInputId  = `imageupload-${safeUid}`;


    const handlePostChange = (e) => {
        setPostText(e.target.value);
    };
    const removeImage = (indexToRemove) => {
        setSelectedImages((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };
    const handlePostSubmit = async () => {
        if (isPosting) return;

        const cleanedText = postText.trim();
        if (cleanedText === '' && selectedImages.length === 0) {
            await Swal.fire("Empty Post", "Share something to the world!", "warning");
            return;
        }
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                await Swal.fire("Error", "Unauthorized", "error");
                return;
            }

            const formData = new FormData();
            formData.append("postText", postText);
            selectedImages.forEach((file) => {
                formData.append("files", file);
            });

            try {
                setIsPosting(true);
                const response = await fetch(ADD_POST_API, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
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

            <div className="w-full mb-6 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl  xl:max-w-5xl mx-auto px-2 sm:px-4">
                <Card shadow={false} className="w-full px-4 py-2 shadow-md rounded-xl">
                    <CardHeader
                        color="transparent"
                        floated={false}
                        shadow={false}
                        className="mx-0 flex items-center gap-4 pt-0 pb-8"
                    >
                        <Avatar
                            size="lg"
                            variant="circular"
                            src={user.profilePictureUrl}
                            alt={user.fullName}
                        />
                        <div className="flex w-full flex-col gap-0.5">
                            <div className="flex items-center justify-between">
                                <Typography variant="h6" color="blue-gray">
                                    {user.fullName}
                                </Typography>
                                <div className="5 flex items-center gap-0">

                                </div>
                            </div>

                        </div>
                    </CardHeader>
                    <CardBody className="mb-6 p-0">
                        {selectedImages.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto w-full max-w-full">
                                {selectedImages.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative cursor-pointer"
                                        onClick={() => removeImage(index)}
                                        title="Click to remove"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            className="w-24 h-24 object-cover rounded-md"
                                        />
                                        <div
                                            className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-bl">
                                            ✕
                                        </div>
                                    </div>
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
                                      aria-describedby={`${postContentId}-help`}
                                      label=" "
                                      labelProps={{ htmlFor: postContentId, className: "sr-only", "aria-hidden": true }}
                                      containerProps={{ className: "grid h-full rounded-md" }}
                                      placeholder={`What's going on in your mind, ${user.name}?`} rows={6}/>
                        </div>
                    </CardBody>
                        <div className="flex w-full items-center gap-1">
                            <label
                                htmlFor={imageInputId}
                                className="
                                 p-2 rounded-full
                                 hover:bg-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-gray-400
                                cursor-pointer
                                 transition"
                                aria-label="Upload images"
                                title="Upload images"
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => {
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
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    setSelectedImages(prev => [...prev, ...files]);
                                }}
                                style={{display: 'none'}}
                            />
                            <EmojiLibrary onEmojiClick={(emoji) => setPostText(prev => prev + emoji.emoji)}/>
                        </div>
                        <div className="flex justify-end gap-2">
                            <ShareButton onClick={handlePostSubmit} text={"Share"} loading={isPosting}/>
                        </div>
                </Card>

            </div>

        </div>
);
}

export default AddPost;
