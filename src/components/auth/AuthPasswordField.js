import {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import {AuthFieldError} from "./AuthFieldError";
import {Input} from "../common/Input";

// Visibility-toggle behavior stays local to this component and is not part
// of the shared Input primitive's API — Input just renders the field chrome
// (via the extra `pr-11` padding passed through `className` to make room
// for the toggle button below).
export const AuthPasswordField = ({
    id,
    name,
    label,
    value,
    onChange,
    error,
    autoComplete,
    disabled = false,
    required = true,
}) => {
    const fieldId = id || name;
    const [visible, setVisible] = useState(false);

    return (
        <div>
            {label && (
                <label htmlFor={fieldId} className="mb-1.5 block text-ds-label text-dsNeutral-600">
                    {label}
                </label>
            )}
            <div className="relative">
                <Input
                    id={fieldId}
                    name={name}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete || "current-password"}
                    disabled={disabled}
                    required={required}
                    error={error}
                    className="pr-11"
                />
                <button
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    disabled={disabled}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-dsNeutral-500 transition hover:bg-dsNeutral-100 hover:text-dsNeutral-900 disabled:cursor-not-allowed"
                >
                    {visible ? <Eye size={19} strokeWidth={1.75}/> : <EyeOff size={19} strokeWidth={1.75}/>}
                </button>
            </div>
            <AuthFieldError id={fieldId} error={error}/>
        </div>
    );
};

export default AuthPasswordField;
