import { useState } from "react";
import {fetchWithAuth, UPDATE_SETTINGS_API} from "../utils/Utils";
export function useAutoSaveField(initialValue, fieldName,setUser) {
    const [value, setValue] = useState(initialValue || "");
    const [loading, setLoading] = useState(false);

    const updateServer = async (newValue) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(UPDATE_SETTINGS_API, {
                method: "PUT",
                body: JSON.stringify({ [fieldName]: newValue }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update ${fieldName}`);
            }
            if (setUser) {
                setUser((prev) => ({
                    ...prev,
                    [fieldName]: newValue,
                }));
            }
            return true;
        } catch (error) {
            console.error(`Error updating ${fieldName}:`, error);
            alert(`Failed to update ${fieldName}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const onSave = async (newVal) => {
        setValue(newVal);
        return await updateServer(newVal);
    };

    return { value, onSave, loading };
}
