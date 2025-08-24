import React, { useState } from "react";
import Stories from "react-insta-stories";
import { Avatar, Button, Typography, Input, Textarea } from "@material-tailwind/react";
import { useStories } from "../../context/StoryProvider";
import { useUser } from "../../context/UserProvider";
import { WithHeader } from "react-insta-stories";
import openStoryUploadDialog from "../profile/StoryUploadDialog";
import {isMobile} from "../../utils/Utils";
function StoryBar() {
    const [showStories, setShowStories] = useState(false);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(null);
    const { stories, uploadStory, fetchStories } = useStories();
    const { user } = useUser();

    const groupedStories = stories.reduce((acc, story) => {
        if (!acc[story.fullName]) {
            acc[story.fullName] = {
                profilePictureUrl: story.profilePictureUrl,
                fullName: story.fullName,
                stories: [],
            };
        }

        acc[story.fullName].stories.push({
            content: ({ action, isPaused }) => (
                <WithHeader story={{
                    header: {
                        heading: story.fullName,
                        profileImage: story.profilePictureUrl
                    }
                }} globalHeader="">
                    <div >
                        <img
                            src={story.imageUrl}
                            alt=""
                             style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {story.caption && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    background: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    maxWidth: "80%",
                                }}
                            >
                                {story.caption}
                            </div>
                        )}
                    </div>
                </WithHeader>
            )
        });

        return acc;
    }, {});

    const storyGroups = Object.values(groupedStories);

    const handleStoryClick = (index) => {
        setCurrentGroupIndex(index);
        setShowStories(true);
    };

    const safeStories = (storyGroups[currentGroupIndex]?.stories || []).filter(
        (s) => typeof s.content === "function"
    );

    return (
        <div
            className="relative bg-white shadow-md rounded-xl my-5
  w-full mx-auto
  max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl
  overflow-x-hidden">
            <div className="w-full overflow-x-auto overflow-y-hidden px-2 sm:px-4">
                <div className="flex items-center gap-4 py-2 h-[140px] min-w-fit">

                    <div
                        className="flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => openStoryUploadDialog(uploadStory, fetchStories)}
                    >
                        <div className="relative">
                            <Avatar
                                src={user.profilePictureUrl}
                                alt="You"
                                variant="circular"
                                size="xl"
                                className="border-2 border-gray-300 "
                            />
                            <div
                                className="absolute bottom-0 right-0 bg-blue-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                                +
                            </div>
                        </div>
                        <div className="text-center text-[12px] mt-1 text-gray-900 w-16 truncate">
                            Your Story
                        </div>
                    </div>

                    {storyGroups.map((userGroup, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => handleStoryClick(index)}
                        >
                            <Avatar
                                src={userGroup.profilePictureUrl}
                                alt={userGroup.fullName}
                                variant="circular"
                                size="xl"
                                className="border-4 border-blue-500 hover:scale-110 transition duration-200 "
                            />
                            <div className="text-center text-[12px] mt-1 text-gray-900 w-16 truncate">
                                {userGroup.fullName}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showStories && currentGroupIndex !== null && (
                <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
                    <div className="relative">
                        <Stories
                            stories={safeStories}
                            defaultInterval={3000}
                            width={isMobile ? "100vw" : "30vw"}
                            height={isMobile ? "100vw" : "45vw"}
                            onAllStoriesEnd={() => {
                                setShowStories(false);
                                setTimeout(() => {
                                    const nextIndex = currentGroupIndex + 1;
                                    if (nextIndex < storyGroups.length) {
                                        const nextStories = storyGroups[nextIndex]?.stories || [];
                                        if (nextStories.length > 0) {
                                            setCurrentGroupIndex(nextIndex);
                                            setShowStories(true);
                                        }
                                    } else {
                                        setCurrentGroupIndex(null);
                                    }
                                }, 200);
                            }}
                        />
                        <button
                            className="absolute top-4 right-4 z-[10000] bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
                            style={{pointerEvents: "auto"}}
                            onClick={() => {
                                setShowStories(false);
                                setCurrentGroupIndex(null);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}

export default StoryBar;
