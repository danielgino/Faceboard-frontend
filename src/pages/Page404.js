import FaceboardLogo from "../assets/photos/logo/FaceboardLogo.png";
import React from "react";
import {useNavigate} from "react-router-dom";


function Page404(){
    const navigate = useNavigate();


    return (
        <main>
            <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8">
                <div className="max-w-lg mx-auto text-center">
                    <div className="pb-6">

                        <img className="w-[500px] h-auto object-contain mx-auto"
                             src={FaceboardLogo} alt="Faceboard logo"/>
                    </div>
                    <h3 className="text-indigo-800 text-4xl font-semibold sm:text-5xl">
                        Page not found
                    </h3>
                    <p className="text-gray-800 mt-3">
                        Sorry, the page you are looking for could not be found or has been removed.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </main>

    )
}

export default Page404