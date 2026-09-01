import FaceboardLogo from "../assets/photos/logo/FaceboardLogo.png";
import React from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "../components/common/Button";


function Page404(){
    const navigate = useNavigate();


    return (
        <main>
            <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-dvh md:px-8">
                <div className="max-w-lg mx-auto text-center">
                    <div className="pb-6">

                        <img className="w-[200px] md:w-[500px] h-auto object-contain mx-auto"
                             src={FaceboardLogo} alt="Faceboard logo"/>
                    </div>
                    <h3 className="text-ds-display text-dsNeutral-900">
                        Page not found
                    </h3>
                    <p className="text-ds-body text-dsNeutral-600 mt-3">
                        Sorry, the page you are looking for could not be found or has been removed.
                    </p>
                    <Button className="mt-6" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </div>
            </div>
        </main>

    )
}

export default Page404