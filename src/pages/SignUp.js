
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {ALT_RANDOM_USERS, GenderEnum, getAge, LOGIN_PAGE, SIGNUP_API} from "../utils/Utils";
import Swal from 'sweetalert2'
import {PasswordInput} from "../assets/inputs/PasswordInput";
import {GlobalInput} from "../assets/inputs/GlobalInput";
import logoPNG from "../assets/photos/logo/logoPNG.png";
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
                if (!/\S+@\S+\.\S+/.test(value)) {
                    message = "Invalid email";
                }
                break;

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

    const register = async (e) => {
            e.preventDefault();
        const isValid = Object.values(errors).every(error => !error);
        const allFieldsFilled = Object.values(formData).every(value => value !== "");
        if (!isValid || !allFieldsFilled) {
            await Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please fix the errors in the form before submitting.",
            });
            return;
        }
        try {
            const response = await fetch(SIGNUP_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData}),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                console.log(errorMessage.message)
                await Swal.fire({
                    title: "Error!",
                    text: `Registration failed: ${Object.values(errorMessage)[0]}`,
                    icon: "error"
                });
                throw new Error(errorMessage.message);
            }

            const result = await response.text();
            console.log("User registered successfully:", result);
            await Swal.fire({
                title: "Good job!",
                text: "Registration successful!",
                icon: "success"
            });
            handleBackToLogin();
        } catch (err) {
            console.error("Error registering user:", err);
            // await Swal.fire({
            //     title: "Error!",
            //     text: `Registration failed: ${err.message}`,
            //     icon: "error"
            // });

        }

    }
    const handleBackToLogin=()=>{
        navigate(LOGIN_PAGE)
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <main className="w-full flex">
                <div className="relative flex-1 hidden items-center justify-center h-screen bg-indigo-50 lg:flex">
                    <div className="relative z-10 w-full max-w-md">
                        <img className="w-[400px] h-auto object-contain"
                             src={logoPNG} alt="Faceboard logo"/>
                        <div className=" mt-16 space-y-3">
                            <h3 className="text-indigo-400 text-3xl font-bold">Start find new friendships</h3>
                            <p className="text-gray-900">
                                Create an account and get access to all features
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
                                <img alt={ALT_RANDOM_USERS}
                                    src="https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e"
                                    className="w-10 h-10 rounded-full border-2 border-white"/>
                                <p className="text-sm text-gray-900 font-medium translate-x-5">
                                    Join all our users
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
                <div className="flex-1 flex justify-center items-start min-h-[100svh] overflow-y-auto py-6
                lg:items-center lg:h-screen lg:py-0">
                    <div className="w-full max-w-md space-y-8 px-4 bg-white text-gray-600 sm:px-0">
                        <div className="">
                            <div className="mt-5 space-y-2">
                                <img src={logoPNG}  className="lg:hidden w-[200px] h-auto object-contain block mx-auto"
                                     alt="Faceboard Logo"/>

                                <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Sign up</h3>
                                <p className="">Already have an account?
                                    <a onClick={handleBackToLogin}
                                       className="font-medium text-indigo-600 hover:text-indigo-500">Log
                                        in</a></p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="block w-full h-px bg-gray-300"></span>
                            <p className="inline-block w-fit text-sm bg-white px-2 absolute -top-2 inset-x-0 mx-auto">Or
                                continue with</p>
                        </div>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="space-y-3"
                        >
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <GlobalInput
                                        label="Name"
                                        name="name"
                                        onChange={handleChange}
                                        value={formData.name}
                                        type="text"
                                        error={errors.name}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <GlobalInput
                                        label="Lastname"
                                        name="lastname"
                                        onChange={handleChange}
                                        value={formData.lastname}
                                        type="text"
                                        error={errors.lastname}/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="gender" className="block mb-1 font-medium">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg text-gray-700"
                                >
                                    <option value="">Select Gender</option>
                                    <option value={GenderEnum.MALE}>Male</option>
                                    <option value={GenderEnum.FEMALE}>Female</option>

                                </select>
                                {errors.gender && (
                                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                                )}
                            </div>

                            <div>
                                <GlobalInput
                                    label="Username"
                                    name="username"
                                    onChange={handleChange}
                                    value={formData.username}
                                    type="text"
                                    error={errors.username}/>
                            </div>

                            <div>
                                <GlobalInput
                                    label="Email"
                                    name="email"
                                    onChange={handleChange}
                                    value={formData.email}
                                    type="email"
                                    error={errors.email}/>

                            </div>

                            <div>
                                <PasswordInput
                                    name="password"
                                    label="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                />
                            </div>

                            <div>
                                <PasswordInput
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                />

                            </div>
                            <div>
                                <label className="font-medium">
                                    Birth Date
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={formData.birthDate}
                                    name="birthDate"
                                    type="date"
                                    required
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                />
                                {errors.birthDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                                )}
                            </div>
                            <button
                                onClick={register}
                                className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
                            >
                                Create account
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SignUp