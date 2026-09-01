
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {GenderEnum, getAge, LOGIN_PAGE, SIGNUP_API} from "../utils/Utils";
import {validatePassword, validatePasswordConfirmation} from "../utils/passwordValidation";
import {isValidEmail} from "../utils/emailValidation";
import Swal from '../utils/swalTheme'
import logoPNG from "../assets/photos/logo/logoPNG.png";
import {fetchWithRetries} from "../utils/fetchWithRetries";
import AuthLayout, {AuthAvatarCluster} from "../components/auth/AuthLayout";
import {AuthTextField} from "../components/auth/AuthTextField";
import {AuthPasswordField} from "../components/auth/AuthPasswordField";
import {AuthPrimaryButton} from "../components/auth/AuthPrimaryButton";
import {AuthFieldError} from "../components/auth/AuthFieldError";
import {Button} from "../components/common/Button";

// Select/date fields aren't a type Input supports, so they aren't migrated
// to the shared primitive (see the Phase C consumer mapping) — but their
// class string is aligned to the same token language Input itself uses, so
// they still read as the same field family. That includes the invalid-state
// border swap: base classes carry no border colour, and `selectFieldClass`
// picks the same default/error border tokens Input does off the `error` flag.
const selectFieldBaseClass =
    "h-control w-full rounded-control border bg-white px-3.5 text-ds-body text-dsNeutral-900 outline-none transition " +
    "focus:ring-4 focus:ring-dsFocusRing";
const selectFieldDefaultBorder =
    "border-dsNeutral-200 hover:border-dsNeutral-300 focus:border-dsBrand-600";
const selectFieldErrorBorder = "border-dsDestructive focus:border-dsDestructive";
const selectFieldClass = (error) =>
    `${selectFieldBaseClass} ${error ? selectFieldErrorBorder : selectFieldDefaultBorder}`;

const fieldLabelClass = "mb-2 block text-ds-label text-dsNeutral-600";


function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        lastname: "",
        gender: "",
        birthDate: "",
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validate(name, value);
    };
    const validate = (name,value) => {
       let message="";
        switch (name){
            case "name":
            case "lastname":
                if (value.length<2) {
                    message = "Name or Lastname must be at least 2 Characters";
                }
               else if (!/^[A-Za-z\u0590-\u05FF]+$/.test(value)) {
                    message = "Only letters are allowed";
                }
                break;
            case "username":
                if (value.length<3){
                    message="Username must be at least 3 Characters "
                } else if (!/^[\w.]+$/.test(value)) {
                    message = "Username can contain only letters, numbers, _ and .";
                      }
                break;
            case "gender":
                if (!value) {
                    message = "Gender is required";
                }
                break;

            case "birthDate":
                if (!value) {
                    message = "Birth date is required";
                } else {
                    const age = getAge(value);
                    if (age < 13) {
                        message = "You must be at least 13 years old";
                    }
                }
                break;
            case "email":
                if (!isValidEmail(value)) {
                    message = "Invalid email";
                }
                break;

            case "password":
                message = validatePassword(value);
                break;
            case "confirmPassword":
                message = validatePasswordConfirmation(formData.password, value);
                break;


            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: message }));

        }

    const register = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const isValid = Object.values(errors).every((error) => !error);
        const allFieldsFilled = Object.values(formData).every((value) => value !== "");

        if (!isValid || !allFieldsFilled) {
            // Run per-field validation for every field, not only the ones the
            // user has already interacted with. Without this, a required field
            // left completely untouched (most visibly the Gender select, which
            // has no natural "type then clear" interaction) never gets an
            // `errors` entry, so it stays un-reddened while the generic "fix
            // the errors" dialog still blocks submission.
            Object.entries(formData).forEach(([field, value]) => validate(field, value));

            await Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please fix the errors in the form before submitting.",
            });
            return;
        }

        setIsSubmitting(true);

        Swal.fire({
            title: "Creating Account…",
            html:
                " השרת יכול להיות בשינה. מנסה ליצור משתמש…<br/>" +
                "<small id='attemptText'>Attempt 1/10</small>",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
            showConfirmButton: false,
        });

        try {
            const response = await fetchWithRetries(
                SIGNUP_API,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData }),
                },
                {
                    maxAttempts: 10,
                    delayMs: 3000,
                    timeoutPerAttemptMs: 15000,
                    onAttempt: (a, max) => {
                        const el = document.getElementById("attemptText");
                        if (el) el.textContent = `Attempt ${a}/${max}`;
                    },
                }
            );

            if (!response.ok) {
                Swal.close();

                const errorObj = await response.json().catch(() => ({}));
                const msg =
                    Object.values(errorObj)[0] ||
                    errorObj?.message ||
                    "Unknown error";

                await Swal.fire({
                    title: "Error!",
                    text: `Registration failed: ${msg}`,
                    icon: "error",
                });

                return; // לא ממשיכים להצלחה
            }

            Swal.close();

            await Swal.fire({
                title: "Good job!",
                text: "Registration successful!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            handleBackToLogin();
        } catch (err) {
            Swal.close();

            if (err?.name === "AbortError") {
                await Swal.fire({
                    title: "Timeout",
                    text: "השרת לא הגיב בזמן (Render Free). נסה/י שוב בעוד רגע.",
                    icon: "error",
                });
            } else {
                console.error("Error registering user:", err);
                await Swal.fire({
                    title: "Error!",
                    text: `Registration failed: ${err?.message ?? "Network error / server not ready"}`,
                    icon: "error",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleBackToLogin=()=>{
        navigate(LOGIN_PAGE)
    }

    return (
        <AuthLayout
            brandHeading="Start finding new friendships."
            brandSubtext="Create an account and start connecting with people you know."
        >
            <img
                src={logoPNG}
                alt="Faceboard logo"
                width="140"
                height="42"
                className="mb-8 h-auto w-[120px] object-contain lg:hidden"
            />

            <h2 className="text-[28px] font-bold leading-tight text-dsNeutral-900 sm:text-[34px]">Create your account</h2>
            <p className="mt-2.5 text-ds-body text-dsNeutral-600">Join Faceboard to connect with people you know.</p>

            <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-5">
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <AuthTextField
                            label="Name"
                            name="name"
                            onChange={handleChange}
                            value={formData.name}
                            type="text"
                            autoComplete="given-name"
                            error={errors.name}
                        />
                    </div>
                    <div className="w-1/2">
                        <AuthTextField
                            label="Lastname"
                            name="lastname"
                            onChange={handleChange}
                            value={formData.lastname}
                            type="text"
                            autoComplete="family-name"
                            error={errors.lastname}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="gender" className={fieldLabelClass}>Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        aria-invalid={!!errors.gender}
                        aria-describedby={errors.gender ? "gender-error" : undefined}
                        className={selectFieldClass(errors.gender)}
                    >
                        <option value="">Select Gender</option>
                        <option value={GenderEnum.MALE}>Male</option>
                        <option value={GenderEnum.FEMALE}>Female</option>
                    </select>
                    <AuthFieldError id="gender" error={errors.gender}/>
                </div>

                <AuthTextField
                    label="Username"
                    name="username"
                    onChange={handleChange}
                    value={formData.username}
                    type="text"
                    autoComplete="username"
                    error={errors.username}
                />

                <AuthTextField
                    label="Email"
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    error={errors.email}
                />

                <AuthPasswordField
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    error={errors.password}
                />

                <AuthPasswordField
                    name="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    error={errors.confirmPassword}
                />

                <div>
                    <label htmlFor="birthDate" className={fieldLabelClass}>
                        Birth Date
                    </label>
                    <input
                        id="birthDate"
                        onChange={handleChange}
                        value={formData.birthDate}
                        name="birthDate"
                        type="date"
                        required
                        aria-invalid={!!errors.birthDate}
                        aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
                        className={selectFieldClass(errors.birthDate)}
                    />
                    <AuthFieldError id="birthDate" error={errors.birthDate}/>
                </div>

                <div className="pt-2">
                    <AuthPrimaryButton
                        type="submit"
                        onClick={register}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        loadingText="Creating account…"
                    >
                        Create account
                    </AuthPrimaryButton>
                </div>
            </form>

            <div className="mt-7 lg:hidden">
                <div className="flex items-center gap-3 rounded-xl bg-dsBrand-50 p-3.5">
                    <AuthAvatarCluster size="sm"/>
                    <p className="text-xs font-medium text-dsNeutral-600">A few familiar faces are already here.</p>
                </div>
            </div>

            <p className="mt-7 border-t border-dsNeutral-200 pt-6 text-center text-[14.5px] text-dsNeutral-600">
                Already have an account?{" "}
                <Button type="button" variant="text" onClick={handleBackToLogin} className="font-semibold">
                    Log in
                </Button>
            </p>
        </AuthLayout>
    );
}

export default SignUp