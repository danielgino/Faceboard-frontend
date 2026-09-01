export const AuthFieldError = ({id, error}) => {
    if (!error) return null;

    return (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-ds-error text-dsDestructive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 flex-none">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/>
            </svg>
            {error}
        </p>
    );
};

export default AuthFieldError;
