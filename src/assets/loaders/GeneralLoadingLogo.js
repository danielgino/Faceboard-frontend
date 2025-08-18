import LogoLoading from "../photos/logo/LogoLoading.png";
import React from "react";


function GeneralLoadingLogo(){

    return (
        <div className="w-full h-screen flex items-center justify-center bg-transparent">
            <div className="text-center">
                <img
                    src={LogoLoading}
                    alt="Faceboard Logo"
                    className="w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] mx-auto mb-6 animate-pulse"
                />

            </div>
        </div>
    )
}
export default GeneralLoadingLogo