import {useState} from "react";
import {ShieldCheck} from "lucide-react";
import {Button} from "../common/Button";
import Swal from "../../utils/swalTheme";
import SectionCard from "../common/SectionCard";
import {PasswordInput} from "../../assets/inputs/PasswordInput";
import {SETTINGS_API, fetchWithAuth} from "../../utils/Utils";
import {validatePassword, validatePasswordConfirmation} from "../../utils/passwordValidation";
import {useUser} from "../../context/UserProvider";
import DemoReadOnlyNotice from "../common/DemoReadOnlyNotice";

// Password change is already an independent operation today (its own
// submission, its own API call, no overlap with the field auto-save
// workflow in Settings), so this section owns its state and submission
// end-to-end rather than receiving them as props.
function PasswordSettings() {
    // Defensive fallback (not just style): unlike Settings.js, this component has an existing
    // test suite that renders it without a wrapping UserProvider, where useUser() returns
    // undefined (UserContext has no default value) - destructuring straight off that would throw.
    const {isDemo} = useUser() || {};
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = (name, value) => {
        let message = "";
        switch (name) {
            case "password":
                message = validatePassword(value);
                break;
            case "confirmPassword":
                message = validatePasswordConfirmation(password, value);
                break;

            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: message }));
    };

    const handleSubmit = async () => {
        if (isDemo) return;
        // Double-submit guard: a second click/Enter while the first request
        // is still in flight (e.g. slow network) is a no-op instead of
        // firing a duplicate PUT.
        if (saving) return;

        const payload = {};

        if (currentPassword?.trim() && password.trim()) {
            payload.currentPassword = currentPassword;
            payload.newPassword = password;
        }

        if (!payload.currentPassword || !payload.newPassword) {
            alert("Please fill both current and new password.");
            return;
        }

        setSaving(true);
        try {
            const response = await fetchWithAuth(SETTINGS_API, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error("Failed to update password");
            }
            await Swal.fire({
                title: "Success!",
                text: `Password updated successfully`,
                icon: "success"
            });
        } catch (e) {
            console.error("🔥 Server error:", e.message);
            await Swal.fire({
                title: "Error!",
                text: `Please Check Password Fields`,
                icon: "error"
            });

        } finally {
            setSaving(false);
        }
    };

    return (
        <SectionCard title="Security" icon={ShieldCheck}>
            <div className="space-y-4">
                <PasswordInput id="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={errors.currentPassword} disabled={isDemo} />
                <PasswordInput  id="NewPassword" label="New Password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); validate("password", e.target.value); }} error={errors.password} disabled={isDemo} />
                <PasswordInput  id="ConfirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); validate("confirmPassword", e.target.value); }} error={errors.confirmPassword} disabled={isDemo} />

                <div className="flex justify-center pt-2">
                    <Button onClick={handleSubmit} variant="primary" loading={saving} disabled={isDemo}>
                        Save Changes
                    </Button>
                </div>
                {isDemo && <DemoReadOnlyNotice message="Demo Mode — password cannot be changed." />}
            </div>
        </SectionCard>
    );
}

export default PasswordSettings;
