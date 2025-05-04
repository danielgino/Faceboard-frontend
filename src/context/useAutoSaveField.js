import { useState } from "react";
import axios from "axios";
import {useUser} from "./UserProvider";
const {setUser}=useUser

export function useAutoSaveField(initialValue, fieldName,setUser) {
    const [value, setValue] = useState(initialValue || "");
    const [loading, setLoading] = useState(false);

    const updateServer = async (newValue) => {
        setLoading(true);
        try {
            await axios.put("http://localhost:8080/user/settings", {
                [fieldName]: newValue
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    "Content-Type": "application/json"
                }
            });
            console.log(`✅ ${fieldName} updated`);
            if (setUser) {
                setUser((prev) => ({
                    ...prev,
                    [fieldName]: newValue,
                }));
            }
        } catch (error) {
            console.error(`❌ Error updating ${fieldName}:`, error);
            alert(`Failed to update ${fieldName}`);
        } finally {
            setLoading(false);
        }
    };

    const onSave = async (newVal) => {
        setValue(newVal);
        await updateServer(newVal);
    };

    return { value, onSave, loading };
}
