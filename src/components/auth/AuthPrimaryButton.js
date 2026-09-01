import {Button} from "../common/Button";

// loadingText-swap is auth-specific presentation (not every Button consumer
// wants its label replaced while loading — the shared primitive always
// keeps children visible), so it's kept local here rather than added to
// Button's own API.
export const AuthPrimaryButton = ({type = "button", onClick, disabled, loading, loadingText, children}) => {
    return (
        <Button
            type={type}
            variant="primary"
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            className="w-full"
        >
            {loading ? loadingText : children}
        </Button>
    );
};

export default AuthPrimaryButton;
