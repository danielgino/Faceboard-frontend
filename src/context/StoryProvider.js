import React, { createContext, useContext, useState, useEffect } from "react";
import {useUser} from "./UserProvider";
import {GET_FRIENDS_STORIES_API, UPLOAD_STORY_API} from "../utils/Utils";

const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
    const { user } = useUser();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchStories = async () => {
        if (!user) return null;
        setLoading(true);
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await fetch(GET_FRIENDS_STORIES_API, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Error Fetching Stories");

            const data = await response.json();
            setStories(data);
        } catch (error) {
            console.error("Error Fetching Stories: ", error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (user?.id) {
            fetchStories();
        }
    }, [user]);
    const uploadStory = async (file, caption) => {
        const token = localStorage.getItem("jwtToken");
        const formData = new FormData();
        formData.append("file", file);
        if (caption) formData.append("caption", caption);

        try {
            const response = await fetch(UPLOAD_STORY_API, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Error upload a story..");

            const newStory = await response.json();
            setStories((prev) => [newStory, ...prev]);
            return newStory;
        } catch (error) {
            console.error("Error upload a story: ", error.message);
            return null;
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    return (
        <StoryContext.Provider value={{ stories, loading, fetchStories, uploadStory }}>
            {children}
        </StoryContext.Provider>
    );
};
