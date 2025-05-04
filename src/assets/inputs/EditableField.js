import { useState, useEffect } from "react";
import { Pencil, X, Check } from "lucide-react";
import {useUser} from "../../context/UserProvider";

function EditableField({ label, value, onSave, validate, multiline = false, rows = 3 }) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value || "");
    const [error, setError] = useState("");
    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setInputValue(newVal);

        if (validate) {
            const validationMessage = validate(newVal);
            setError(validationMessage);
        } else {
            setError("");
        }
    };

    const handleSave = async () => {
        const validationMessage = validate ? validate(inputValue) : "";
        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        await onSave(inputValue);
        setEditing(false);
    };

    const handleCancel = () => {
        setInputValue(value || "");
        setError("");
        setEditing(false);
    };

    return (
        <div className="mb-4">
            <label className="block font-medium mb-1">{label}</label>
            {!editing ? (
                <div className="flex items-center gap-2">
                   <span className="whitespace-pre-line break-words w-full max-w-xs bg-gray-50 ">
                     {value || "—"}
                      </span>
                    <button onClick={() => setEditing(true)}><Pencil size={16}/></button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                {multiline ? (
                        <textarea
                            value={inputValue}
                            maxLength={200}
                            onChange={handleChange}
                            rows={rows}
                            className={`border px-2 py-1 rounded resize-none ${error ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    ) : (
                        <input
                            value={inputValue}
                            onChange={handleChange}
                            className={`border px-2 py-1 rounded max-w-xs w-full ${error ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    )}
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={!!error}><Check size={16} /></button>
                        <button onClick={handleCancel}><X size={16} /></button>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

export default EditableField;
