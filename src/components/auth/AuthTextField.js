import {AuthFieldError} from "./AuthFieldError";
import {Input} from "../common/Input";

// Thin wrapper: field chrome (height/border/radius/focus/error/disabled) now
// lives in the shared Input primitive — this file's job is just to keep
// AuthFieldError as a sibling, exactly as before, since error-message
// ownership stays separate from the field itself.
export const AuthTextField = ({
    id,
    name,
    label,
    type = "text",
    value,
    onChange,
    error,
    placeholder,
    autoComplete,
    disabled = false,
    required = true,
}) => {
    const fieldId = id || name;

    return (
        <div>
            <Input
                id={fieldId}
                name={name}
                label={label}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                required={required}
                error={error}
            />
            <AuthFieldError id={fieldId} error={error}/>
        </div>
    );
};

export default AuthTextField;
