import React, { createContext, useContext, useState, useEffect } from "react";
import {useUser} from "./UserProvider";

const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
    const { user } = useUser();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStories = async () => {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await fetch("http://localhost:8080/api/stories/friends", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("שגיאה בשליפת סטוריז");

            const data = await response.json();
            setStories(data);
        } catch (error) {
            console.error("שגיאה בשליפת סטוריז:", error.message);
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
            const response = await fetch("http://localhost:8080/api/stories/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("שגיאה בהעלאת סטורי");

            const newStory = await response.json();
            setStories((prev) => [newStory, ...prev]);
            return newStory;
        } catch (error) {
            console.error("שגיאה בהעלאת סטורי:", error.message);
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
