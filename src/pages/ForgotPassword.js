import { useNavigate } from 'react-router-dom';
import logoPNG from "../assets/photos/logo/logoPNG.png";
import React, { useState } from "react";
import Footer from "../components/layout/Footer";
import { FORGOT_PASSWORD_API, LOGIN_PAGE } from "../utils/Utils";
import { GlobalInput } from "../assets/inputs/GlobalInput";
import Swal from "sweetalert2";

function ForgotPassword() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "" });

    const handleBackToLogin = () => navigate(LOGIN_PAGE);

    const validateField = (name, value) => {
        let message = "";
        if (name === "email") {
            const v = (value || "").trim();
            if (!/\S+@\S+\.\S+/.test(v)) message = "Invalid email";
        }
        return message;
    };

    const validateAll = (data) => ({
        email: validateField("email", data.email),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next = { ...formData, [name]: value };
        setFormData(next);
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validateAll(formData);
        setErrors(nextErrors);
        const hasErrors = Object.values(nextErrors).some(Boolean);
        if (hasErrors) {
            Swal.fire("Fix errors", "Please correct the form before submitting.", "warning");
            return;
        }

        try {
            setLoading(true);

            if (!FORGOT_PASSWORD_API) {
                console.error("FORGOT_PASSWORD_API is undefined");
                throw new Error("Missing API URL");
            }

            const res = await fetch(FORGOT_PASSWORD_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
            });

            if (res.ok) {
                await Swal.fire("Check your email", "If this email exists, we sent a reset link.", "success");
                navigate(LOGIN_PAGE);
            } else {
                const msg = await res.text().catch(() => "");
                Swal.fire("Error", msg || "Something went wrong. Please try again.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Network error", "Please try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <main className="w-full min-h-[100svh] flex flex-col items-center justify-center bg-gray-50 sm:px-4">
                <div className="w-full space-y-6 text-gray-600 sm:max-w-md">
                    <div className="flex justify-center">
                        <img className="w-[400px] h-auto object-contain" src={logoPNG} alt="Faceboard logo" />
                    </div>
                    <div className="text-center">
                        <div className="mt-5 space-y-2">
                            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Reset your password</h3>
                        </div>
                    </div>
                    <div className="bg-white shadow p-4 py-6 space-y-8 sm:p-6 sm:rounded-lg">
                        <div className="relative">
                            <span className="block w-full h-px bg-gray-300"></span>
                            <p className="inline-block w-fit text-sm bg-white px-2 absolute -top-2 inset-x-0 mx-auto">
                                Enter Your email
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <GlobalInput
                                label="Email"
                                name="email"
                                onChange={handleChange}
                                value={formData.email}
                                type="email"
                                error={errors.email}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full px-4 py-2 text-white font-medium rounded-lg duration-150 ${
                                    loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600"
                                }`}
                            >
                                {loading ? "Sending..." : "Send reset link"}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="w-full mt-2 text-indigo-600 hover:underline"
                            >
                                Back to login
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ForgotPassword;
