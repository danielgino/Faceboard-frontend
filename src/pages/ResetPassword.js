import logoPNG from "../assets/photos/logo/logoPNG.png";
import React, {useEffect, useState } from "react";
import Footer from "../components/layout/Footer";
import {PasswordInput} from "../assets/inputs/PasswordInput";
import Swal from "sweetalert2";
import {useLocation,useNavigate} from "react-router-dom";
import {LOGIN_PAGE, RESET_PASSWORD_API} from "../utils/Utils";


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
    }, [token]);

    const validate = (name,value) => {
        let message="";
        switch (name){
            case "password":
                if (value.length < 8) {
                    message = "Password must be at least 8 characters";
                }
                else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) {
                    message = "Password must include uppercase, lowercase, number and symbol";
                }
                break;
            case "confirmPassword":
                if (value !== formData.password) {
                    message = "Passwords do not match";
                }
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
            <main className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
                <div className="w-full space-y-6 text-gray-600 sm:max-w-md">
                    <div className="flex justify-center">
                        <img
                            className="w-[400px] h-auto object-contain"
                            src={logoPNG}
                            alt="Faceboard logo"
                        />
                    </div>
                    <div className="bg-white shadow p-4 py-6 space-y-8 sm:p-6 sm:rounded-lg">
                        <div className="relative">
                            <span className="block w-full h-px bg-gray-300"></span>
                            <p className="inline-block w-fit text-sm bg-white px-2 absolute -top-2 inset-x-0 mx-auto">Enter
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
                            <button
                                disabled={loading}
                                className={`w-full px-4 py-2 text-white font-medium rounded-lg duration-150 ${
                                    loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600"
                                }`}
                            >
                                {loading ? "Saving..." : "Change password"}
                            </button>
                        </form>
                    </div>

                </div>
            </main>
                <Footer/>
            </div>
    )
}

export default ResetPassword