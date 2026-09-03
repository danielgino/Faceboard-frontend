import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../context/UserProvider";
import {
    DEMO_LOGIN_API,
    FORGOT_PASSWORD_PAGE,
    HOME_PAGE,
    JWT_STORAGE_KEY,
    LOGIN_API,
    SIGNUP_PAGE
} from "../utils/Utils";
import logoPNG from "../assets/photos/logo/logoPNG.png"
import InputAlerts from "../assets/inputs/InputAlerts";
import {fetchWithRetries} from "../utils/fetchWithRetries";
import AuthLayout, {AuthAvatarCluster} from "../components/auth/AuthLayout";
import {AuthTextField} from "../components/auth/AuthTextField";
import {AuthPasswordField} from "../components/auth/AuthPasswordField";
import {AuthPrimaryButton} from "../components/auth/AuthPrimaryButton";
import {Button} from "../components/common/Button";
import DemoNeonBorder from "../components/common/DemoNeonBorder";
import "../assets/styles/DemoNeonBorder.css";


function Login() {
    const [email, setEmail] = useState(() => localStorage.getItem("savedEmail") || '');
    const [password, setPassword] = useState('');
    const {fetchUserDetails } = useUser();
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);


    const handleEmail = (event) => {
        const value = event.target.value;
        setEmail(value);
        localStorage.setItem("savedEmail", value);
    };

    const handlePassword = (event) => {
        setPassword(event.target.value);
    };

    const handleSignUpButton = () => {
        navigate(SIGNUP_PAGE);
    };

    // Demo Mode: mirrors handleLoginButton's token-store/fetch-user/navigate flow, but hits
    // POST /auth/demo (no credentials) instead of /auth/login. Backend enforcement
    // (DemoAccessFilter/ROLE_DEMO) is authoritative regardless of anything here.
    const handleDemoButton = async () => {
        if (isDemoSubmitting) return;
        setIsDemoSubmitting(true);
        setMessage("");

        try {
            const response = await fetchWithRetries(
                DEMO_LOGIN_API,
                { method: "POST" },
                { maxAttempts: 3, delayMs: 2000, timeoutPerAttemptMs: 15000 }
            );

            if (response.ok) {
                const responseText = await response.text();
                localStorage.setItem(JWT_STORAGE_KEY, responseText);
                await fetchUserDetails(responseText);
                navigate(HOME_PAGE);
            } else if (response.status === 404) {
                setMessage("Demo mode is currently unavailable.");
            } else if (response.status === 429) {
                setMessage("Too many Demo requests right now, please try again shortly.");
            } else {
                setMessage("Could not start Demo session, please try again.");
            }
        } catch (err) {
            setMessage("Network error: unable to start Demo session.");
            console.error("Error starting demo session:", err);
        } finally {
            setIsDemoSubmitting(false);
        }
    };
    const handleForgotPassButton = () => {
        navigate(FORGOT_PASSWORD_PAGE);
    };

    const handleLoginButton = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setMessage("");

        const loginRequest = { email, password };

        try {
            const response = await fetchWithRetries(
                LOGIN_API,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginRequest),
                },
                {
                    maxAttempts: 10,
                    delayMs: 3000,
                    timeoutPerAttemptMs: 15000,
                }
            );

            const responseText = await response.text();

            if (response.ok) {
                localStorage.setItem(JWT_STORAGE_KEY, responseText);
                await fetchUserDetails(responseText);
                navigate(HOME_PAGE);
            } else {
                setMessage("Login failed, please check password or Email");
            }
        } catch (err) {
            if (err?.name === "AbortError") {
                setMessage("Timeout: השרת לא הגיב בזמן (Render Free). נסה שוב בעוד רגע.");
            } else {
                setMessage("Network error: לא ניתן להתחבר כעת.");
            }

            console.error("Error during login:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            brandHeading="Your friends are already waiting for you."
            brandSubtext="Log back in to catch up on your feed, reconnect with people you know, and keep the conversation going."
        >
            <img
                src={logoPNG}
                alt="Faceboard logo"
                width="140"
                height="42"
                className="mb-8 h-auto w-[120px] object-contain lg:hidden"
            />

            <h2 className="text-[28px] font-bold leading-tight text-dsNeutral-900 sm:text-[34px]">Welcome back</h2>
            <p className="mt-2.5 text-ds-body text-dsNeutral-600">Log in to catch up with your friends and your feed.</p>

            {message !== '' && (
                <div className="mt-6">
                    <InputAlerts text={message} onClose={() => setMessage('')}/>
                </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-5">
                <AuthTextField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmail}
                    autoComplete="email"
                    placeholder="you@example.com"
                />

                <AuthPasswordField
                    id="password"
                    name="password"
                    label="Password"
                    value={password}
                    onChange={handlePassword}
                    autoComplete="current-password"
                />

                <div className="space-y-4 pt-2">
                    <AuthPrimaryButton
                        type="submit"
                        onClick={handleLoginButton}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        loadingText="Logging in…"
                    >
                        Log in
                    </AuthPrimaryButton>

                    <Button
                        type="button"
                        variant="text"
                        onClick={handleForgotPassButton}
                        disabled={isSubmitting}
                        className="block w-full text-center text-sm"
                    >
                        Forgot your password?
                    </Button>

                    <Button
                        type="button"
                        variant="text"
                        onClick={handleDemoButton}
                        disabled={isSubmitting || isDemoSubmitting}
                        className="demo-neon-border demo-neon-border--button block w-full rounded-control border border-dsBrand-200 py-2.5 text-center text-ds-button font-semibold no-underline hover:no-underline"
                    >
                        <DemoNeonBorder variant="button" />
                        {isDemoSubmitting ? "Starting Demo…" : "Explore as Demo User"}
                    </Button>
                </div>
            </form>

            <div className="mt-7 lg:hidden">
                <div className="flex items-center gap-3 rounded-xl bg-dsBrand-50 p-3.5">
                    <AuthAvatarCluster size="sm"/>
                    <p className="text-xs font-medium text-dsNeutral-600">A few familiar faces are already here.</p>
                </div>
            </div>

            <p className="mt-7 border-t border-dsNeutral-200 pt-6 text-center text-[14.5px] text-dsNeutral-600">
                Don't have an account?{" "}
                <Button type="button" variant="text" onClick={handleSignUpButton} className="font-semibold">
                    Sign up
                </Button>
            </p>
        </AuthLayout>
    );
}

export default Login;
