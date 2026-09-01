// Design System (Faceboard Design System.dc.html) Input primitive.
//
// Presentational field contract only — replaces the duplicated `baseInput`
// class string currently copy-pasted between AuthTextField.js and
// AuthPasswordField.js (see the Phase B primitive gate report). Does NOT
// include password-visibility logic, search-clear logic, or any other
// composed behavior: a consumer that needs a trailing control (password
// toggle, clear button) wraps this Input in its own `relative` container and
// positions the control absolutely, exactly like AuthPasswordField already
// does today — `className` is exposed so that consumer can add the
// necessary trailing padding (e.g. `pr-11`).
//
// Error *message* rendering is intentionally NOT owned here — that stays
// with AuthFieldError (or an equivalent), which the design's own component
// hierarchy treats as a separate concern from the field itself. This
// component only wires `aria-invalid`/`aria-describedby` toward an
// `${id}-error` element the consumer renders, matching AuthTextField's
// existing convention.
import React, {useId} from "react";

const BASE_INPUT_CLASSES =
    "h-control w-full rounded-control border bg-white px-3.5 text-ds-body text-dsNeutral-900 outline-none transition " +
    "placeholder:text-dsNeutral-500 " +
    "focus:border-dsBrand-600 focus:ring-4 focus:ring-dsFocusRing " +
    "disabled:cursor-not-allowed disabled:bg-dsNeutral-100 disabled:text-dsNeutral-300";

const DEFAULT_BORDER = "border-dsNeutral-200 hover:border-dsNeutral-300";
const ERROR_BORDER = "border-dsDestructive focus:border-dsDestructive";

export const Input = ({
    id,
    name,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    disabled = false,
    required = false,
    error,
    className = "",
    ...rest
}) => {
    const autoId = useId();
    const fieldId = id || name || autoId;

    return (
        <div>
            {label && (
                <label htmlFor={fieldId} className="mb-1.5 block text-ds-label text-dsNeutral-600">
                    {label}
                </label>
            )}
            <input
                id={fieldId}
                name={name}
                type={type}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                className={`${BASE_INPUT_CLASSES} ${error ? ERROR_BORDER : DEFAULT_BORDER} ${className}`}
                {...rest}
            />
        </div>
    );
};

export default Input;
