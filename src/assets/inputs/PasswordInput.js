import {Eye, EyeOff} from "lucide-react";
import {useState} from "react";
import {Input} from "../../components/common/Input";
import {AuthFieldError} from "../../components/auth/AuthFieldError";

// Used by ResetPassword.js and PasswordSettings.js — internals now delegate
// to the shared Input for field chrome, keeping visibility-toggle behavior
// local exactly like AuthPasswordField does. Each rendered instance already
// owns its own independent `showPassword` state (the `[name]`-keyed object
// was vestigial — every instance only ever reads/writes its own `name` key —
// simplified to a plain per-instance boolean with identical outward behavior).
export const PasswordInput = ({id, name, label, value, onChange, error, disabled = false}) => {
    const [visible, setVisible] = useState(false);
    // ResetPassword.js's two call sites don't pass `id`, only `name` — match
    // Input's own id/name fallback so the label's htmlFor and AuthFieldError's
    // id always agree with the actual rendered input id.
    const fieldId = id || name;

    return (
        <div>
            {label && (
                <label htmlFor={fieldId} className="mb-1.5 block text-ds-label text-dsNeutral-600">{label}</label>
            )}
            <div className="relative">
                <Input
                    id={fieldId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    type={visible ? "text" : "password"}
                    required
                    error={error}
                    disabled={disabled}
                    className="pr-11"
                />
                <button
                    type="button"
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-dsNeutral-500 transition hover:bg-dsNeutral-100 hover:text-dsNeutral-900"
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <Eye size={19} strokeWidth={1.75}/> : <EyeOff size={19} strokeWidth={1.75}/>}
                </button>
            </div>
            <AuthFieldError id={fieldId} error={error}/>
        </div>
    );
};