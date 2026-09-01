import {useState, useEffect, useId, forwardRef, useImperativeHandle} from "react";

const EditableField = forwardRef(function EditableField(
    { label, value, validate, id: idProp, multiline = false, rows = 3, saveInProgress = false, editing = false, maxLength = 200 },
    ref
) {
    const [inputValue, setInputValue] = useState(value || "");
    const [error, setError] = useState("");
    const autoId = useId();
    const id = idProp || `editable-${autoId}`;

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        if (!editing) setError("");
    }, [editing]);

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

    useImperativeHandle(ref, () => ({
        validateAndGetValue: () => {
            const trimmedValue = inputValue.trim();
            const validationMessage = validate ? validate(trimmedValue) : "";

            if (validationMessage) {
                setError(validationMessage);
                return { valid: false };
            }

            setError("");
            return { valid: true, value: trimmedValue };
        },
    }));

    return (
        <div>
            {editing ? (
                <label htmlFor={id} className="block text-ds-label text-dsNeutral-600 mb-1.5">{label}</label>
            ) : (
                <div className="block text-ds-label text-dsNeutral-600 mb-1.5">{label}</div>
            )}

            {!editing ? (
                <span className="block flex-1 min-w-0 whitespace-pre-line break-words text-ds-body text-dsNeutral-900 py-1.5">
                    {value || "—"}
                </span>
            ) : multiline ? (
                <textarea
                    id={id}
                    value={inputValue}
                    maxLength={maxLength}
                    onChange={handleChange}
                    rows={rows}
                    disabled={saveInProgress}
                    className={`w-full border px-3.5 py-2 rounded-control text-ds-body text-dsNeutral-900 resize-none outline-none transition focus:ring-4 focus:ring-dsFocusRing focus:border-dsBrand-600 disabled:opacity-60 ${error ? 'border-dsDestructive' : 'border-dsNeutral-200 hover:border-dsNeutral-300'}`}
                />
            ) : (
                <input
                    id={id}
                    value={inputValue}
                    onChange={handleChange}
                    disabled={saveInProgress}
                    className={`h-control w-full border px-3.5 rounded-control text-ds-body text-dsNeutral-900 outline-none transition focus:ring-4 focus:ring-dsFocusRing focus:border-dsBrand-600 disabled:opacity-60 ${error ? 'border-dsDestructive' : 'border-dsNeutral-200 hover:border-dsNeutral-300'}`}
                />
            )}
            {error && <p className="text-dsDestructive text-ds-error mt-1.5">{error}</p>}
        </div>
    );
});

export default EditableField;
