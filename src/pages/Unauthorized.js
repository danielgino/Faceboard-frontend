import React from "react";
import {useNavigate} from "react-router-dom";
import {LOGIN_PAGE} from "../utils/Utils";


function Unauthorized(){
   const navigate = useNavigate();

   return (
       <main>
          <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8">
             <div className="max-w-lg mx-auto space-y-3 text-center">
                <h3 className="text-indigo-600 font-semibold">
                   401 Error
                </h3>
                <p className="text-indigo-800  text-4xl font-semibold sm:text-5xl">
                   Access Denied
                </p>
                <p className="text-gray-600">
                   It looks like you don't have permission to this page. Please log in.  </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                   <button
                       onClick={() => navigate(LOGIN_PAGE)}
                       className="mt-6 px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition"
                   >
                      Back To Login
                   </button>

                </div>
             </div>
          </div>
       </main>
   )
}

export default Unauthorized