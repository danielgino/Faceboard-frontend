import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import {useUser} from "./UserProvider";
import {fetchWithAuth, GET_FRIENDS_STORIES_API, UPLOAD_STORY_API} from "../utils/Utils";

const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
    const { user } = useUser();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchStories = useCallback(async () => {
        if (!user) return null;
        setLoading(true);
        try {
            const response = await fetchWithAuth(GET_FRIENDS_STORIES_API);

            if (!response.ok) throw new Error("Error Fetching Stories");

            const data = await response.json();
            // Ownership boundary for the raw API response: every consumer
            // (StoryBar's stories.reduce) assumes an array, so a malformed-
            // but-200 payload is normalized to a safe empty array here rather
            // than left to crash whichever component reads it first. Genuine
            // fetch failures are unaffected - they hit the catch block below
            // and leave the last-known-good `stories` value in place.
            setStories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error Fetching Stories: ", error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => {
        if (user?.id) {
            fetchStories();
        }
    }, [user, fetchStories]);
    const uploadStory = async (file, caption) => {
        const formData = new FormData();
        formData.append("file", file);
        if (caption) formData.append("caption", caption);

        try {
            const response = await fetchWithAuth(UPLOAD_STORY_API, {
                method: "POST",
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

    return (
        <StoryContext.Provider value={{ stories, loading, fetchStories, uploadStory }}>
            {children}
        </StoryContext.Provider>
    );
};
