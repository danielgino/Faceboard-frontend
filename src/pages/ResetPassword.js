import logoPNG from "../assets/photos/logo/logoPNG.png";
import React, {useEffect, useState } from "react";
import Footer from "../components/layout/Footer";
import {PasswordInput} from "../assets/inputs/PasswordInput";
import Swal from "../utils/swalTheme";
import {useLocation,useNavigate} from "react-router-dom";
import {LOGIN_PAGE, RESET_PASSWORD_API} from "../utils/Utils";
import {validatePassword, validatePasswordConfirmation} from "../utils/passwordValidation";
import {Button} from "../components/common/Button";


function ResetPassword(){
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const token = new URLSearchParams(location.search).get("token")
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (!token) {
            Swal.fire("Invalid link", "Missing or invalid token.", "error")
                .then(() => navigate(LOGIN_PAGE));
        }
    }, [token, navigate]);

    const validate = (name,value) => {
        let message="";
        switch (name){
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            Swal.fire("Invalid link", "Missing token.", "error");
            return;
        }

        validate("password", formData.password);
        validate("confirmPassword", formData.confirmPassword);

        const hasErrors = Object.values(errors).some(Boolean);
        if (hasErrors || !formData.password || !formData.confirmPassword) {
            Swal.fire("Fix errors", "Please correct the form before submitting.", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(RESET_PASSWORD_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: formData.password }),
            });

            if (res.status === 204) {
                await Swal.fire("Done", "Password reset successful.", "success")
                navigate(LOGIN_PAGE);
            } else {
                const msg = await res.text().catch(() => "");
                await Swal.fire("Error", msg || "Invalid or expired link.", "error")
                      navigate(LOGIN_PAGE);


            }
        } catch (err) {
            Swal.fire("Network error", "Please try again later.", "error")
        } finally {
            setLoading(false)
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validate(name, value);
    };

    return(
            <div>
            <main className="w-full h-dvh flex flex-col items-center justify-center bg-dsNeutral-canvas px-4">
                <div className="w-full space-y-6 text-dsNeutral-600 sm:max-w-md">
                    <div className="flex justify-center">
                        <img
                            className="w-[180px] md:w-[400px] h-auto object-contain"
                            src={logoPNG}
                            alt="Faceboard logo"
                        />
                    </div>
                    <div className="bg-dsNeutral-surface shadow-ds-low p-4 py-6 space-y-8 sm:p-6 sm:rounded-ds-lg">
                        <div className="relative">
                            <span className="block w-full h-px bg-dsNeutral-200"></span>
                            <p className="inline-block w-fit text-sm bg-dsNeutral-surface px-2 absolute -top-2 inset-x-0 mx-auto">Enter
                                New Strong Password</p>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5">
                            <div>

                                <PasswordInput
                                    name="password"
                                    label="New Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                />
                            </div>
                            <div>
                                <PasswordInput
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}/>
                            </div>
                            {/* Explicit type="submit": the original relied on
                                a bare <button>'s implicit default type inside
                                a form. Button.js defaults to type="button", so
                                this must be explicit to preserve Enter-key
                                submit behavior. */}
                            <Button type="submit" variant="primary" disabled={loading} loading={loading} className="w-full">
                                {loading ? "Saving..." : "Change password"}
                            </Button>
                        </form>
                    </div>

                </div>
            </main>
                <Footer/>
            </div>
    )
}

export default ResetPassword