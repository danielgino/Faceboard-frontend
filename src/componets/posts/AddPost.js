import React, { useState,useRef } from 'react';
import { Textarea, Button, IconButton } from "@material-tailwind/react";
import {usePosts} from "../../context/PostProvider";
import {useUser} from "../../context/UserProvider";
import EmojiPicker from "emoji-picker-react";
import RandomIcons from "../../Icons/RandomIcons";
import EmojiLibrary from "../interaction/EmojiLibrary";
import ShareButton from "../../assets/buttons/ShareButtom";
import {Subscript} from "lucide-react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
} from "@material-tailwind/react";
import {ADD_POST_API} from "../../utils/Utils";

function AddPost() {
    const [postText, setPostText] = useState('');
    const [postStatus, setPostStatus] = useState('');
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef();
    const {user}=useUser();

    const {addPost}=usePosts()


    const handlePostChange = (e) => {
        setPostText(e.target.value);
    };
    const removeImage = (indexToRemove) => {
        setSelectedImages((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };
    const handlePostSubmit = async () => {
        if (postText!=='' || selectedImages.length>0){
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setError('Token Not Found');
            return;
        }
            const formData = new FormData();
            formData.append("postText", postText);
            selectedImages.forEach((file, index) => {
                formData.append("files", file);
            });
        try {
            const response = await fetch(ADD_POST_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                return;
            }
            const newPost = await response.json();
            addPost(newPost)
            setPostStatus('Post Uploaded !');
            setPostText('');
            setSelectedImages([]);
        } catch (err) {
            setPostStatus('Error creating post!');
            console.error('Error creating post:', err);
        }
    };
    }

    return (
        <div className='add-post-container'>

            <div className="w-full max-w-4xl mx-auto ">
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
                            <div className="mt-4 flex gap-2 overflow-x-auto">
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
                            <Textarea value={postText} onChange={handlePostChange} variant="static"
                                      placeholder={`What's going on in your mind, ${user.name}?`} rows={6}/>
                        </div>
                    </CardBody>
                    <div className="flex w-full ">
                        <RandomIcons.PhotoIcon onClick={() => fileInputRef.current?.click()}/>
                        <input
                            type="file"
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
                        <ShareButton onClick={handlePostSubmit} text={"Share"}/>
                    </div>
                </Card>

            </div>


            {postStatus && <p>{postStatus}</p>} {/* הצגת סטטוס הפוסט */}
            {error && <p>{error}</p>} {/* הצגת שגיאה */}
        </div>
    );
}

export default AddPost;
