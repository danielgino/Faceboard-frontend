import {Input} from "../../components/common/Input";
import {AuthFieldError} from "../../components/auth/AuthFieldError";

// ForgotPassword's only field — internals now delegate to the shared Input
// (adds proper aria-invalid/aria-describedby, which this never had) while
// keeping the same external name/props so ForgotPassword.js is unaffected.
export const GlobalInput = ({name, label, type, value, onChange, error}) => {
    const fieldId = name;

    return (
        <div>
            <Input
                id={fieldId}
                name={name}
                label={label}
                onChange={onChange}
                value={value}
                type={type}
                required
                error={error}
            />
            <AuthFieldError id={fieldId} error={error}/>
        </div>
    );
};