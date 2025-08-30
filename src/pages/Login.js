import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../context/UserProvider";
import {
    ALT_RANDOM_USERS,
    FORGOT_PASSWORD_PAGE,
    HOME_PAGE,
    LOGIN_API,
    SIGNUP_PAGE
} from "../utils/Utils";
import logoPNG from "../assets/photos/logo/logoPNG.png"
import Footer from "../components/layout/Footer";
import InputAlerts from "../assets/inputs/InputAlerts";
import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";


function Login() {
    const [email, setEmail] = useState(() => localStorage.getItem("savedEmail") || '');
    const [password, setPassword] = useState('');
    const {fetchUserDetails } = useUser();
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);



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
    const handleForgotPassButton = () => {
        navigate(FORGOT_PASSWORD_PAGE);
    };

    const handleLoginButton = async () => {
        const loginRequest = {
            email: email,
            password: password,
        };

        try {
            const response = await fetch(LOGIN_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginRequest)
            });

            const responseText = await response.text();

            if (response.ok) {
                setToken(responseText);
                localStorage.setItem('jwtToken', responseText);
                // console.log("Received token:", responseText); //for checks
                await fetchUserDetails(responseText);
                navigate(HOME_PAGE);
            } else {
                setMessage("Login failed, please check password or Email");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    useEffect(() => {
        if (token) {
            navigate(HOME_PAGE);
        }
    }, [token, navigate]);

    return (
        // <div>

        <div className="min-h-dvh flex flex-col">
            <main className="w-full flex flex-1 min-h-0">
                <div
                    className="relative flex-1 hidden items-center justify-center bg-indigo-50 lg:flex overflow-hidden">
                    <div className="relative z-10 w-full max-w-md">
                        <img className="w-[400px] h-auto object-contain"
                             src={logoPNG} alt="Faceboard logo"/>

                        <div className=" mt-16 space-y-3">
                            <h3 className="text-indigo-400 text-3xl font-bold">Your friends are already waiting for
                                you.</h3>
                            <p className="text-gray-900">
                                Login now and start connecting with like-minded people, sharing your moments, and
                                building meaningful relationships – all in one vibrant community.
                            </p>
                            <div className="flex items-center -space-x-2 overflow-hidden">
                                <img src="https://randomuser.me/api/portraits/women/79.jpg"
                                     className="w-10 h-10 rounded-full border-2 border-white" alt={ALT_RANDOM_USERS}/>
                                <img src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg"
                                     className="w-10 h-10 rounded-full border-2 border-white" alt={ALT_RANDOM_USERS}/>
                                <img alt={ALT_RANDOM_USERS}
                                     src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=a72ca28288878f8404a795f39642a46f"
                                     className="w-10 h-10 rounded-full border-2 border-white"/>
                                <img alt={ALT_RANDOM_USERS} src="https://randomuser.me/api/portraits/men/86.jpg"
                                     className="w-10 h-10 rounded-full border-2 border-white"/>
                                <img
                                    src="https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e"
                                    className="w-10 h-10 rounded-full border-2 border-white" alt={ALT_RANDOM_USERS}/>
                                <p className="text-sm text-gray-900 font-medium translate-x-5">
                                    Join our users
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="absolute inset-0 my-auto h-[500px]"
                        style={{
                            background: "oklch(0.924 0.003 17.217)",
                            filter: "blur(118px)"
                        }}
                    >

                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">

                    <div className="w-full max-w-md space-y-8 px-4 bg-white text-gray-600 sm:px-0">
                        <div className="">
                            <img src={logoPNG} width={150} className="lg:hidden w-[400px] h-auto object-contain "
                                 alt="Faceboard Logo"/>
                            <div className="mt-5 space-y-2">
                                <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Login</h3>
                                <p className="">Don't have an account?
                                    <a onClick={handleSignUpButton}
                                       className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Sign Up</a></p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="block w-full h-px bg-gray-300"></span>
                            <p className="inline-block w-fit text-sm bg-white px-2 absolute -top-2 inset-x-0 mx-auto">Or
                                continue with</p>
                        </div>
                        <div>
                            {message !== '' && (
                                <InputAlerts text={message} onClose={() => setMessage('')}/>
                            )}                        </div>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="space-y-5"
                        >

                            <div>
                                <label className="font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmail}
                                    required
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="font-medium">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        onChange={handlePassword}
                                        value={password}
                                        className="w-full mt-2 px-3 py-2 pr-10 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 mt-2 flex items-center"
                                    >
                                        {showPassword ? <AiOutlineEye size={22}/> : <AiOutlineEyeInvisible size={22}/>}

                                    </button>
                                </div>
                            </div>
                            <button
                                className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
                                onClick={handleLoginButton}>
                                Login
                            </button>
                            <button
                                className="mt-2 mx-auto block w-fit text-indigo-600 hover:text-indigo-500 hover:underline"

                                onClick={handleForgotPassButton}>Forgot your password?
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <footer className="mt-auto w-full">
                <Footer/>
            </footer>
        </div>
    );
}

export default Login;
