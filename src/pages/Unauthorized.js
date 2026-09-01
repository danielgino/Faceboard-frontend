import React from "react";
import {useNavigate} from "react-router-dom";
import {LOGIN_PAGE} from "../utils/Utils";
import {Button} from "../components/common/Button";


function Unauthorized(){
   const navigate = useNavigate();

   return (
       <main>
          <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8">
             <div className="max-w-lg mx-auto space-y-3 text-center">
                <h3 className="text-ds-label text-dsDestructive">
                   401 Error
                </h3>
                <p className="text-ds-display text-dsNeutral-900">
                   Access Denied
                </p>
                <p className="text-ds-body text-dsNeutral-600">
                   It looks like you don't have permission to this page. Please log in.  </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                   <Button className="mt-6" onClick={() => navigate(LOGIN_PAGE)}>
                      Back To Login
                   </Button>

                </div>
             </div>
          </div>
       </main>
   )
}

export default Unauthorized