import React from "react";
import { Info } from "lucide-react";
import DemoNeonBorder from "./DemoNeonBorder";
import "../../assets/styles/DemoNeonBorder.css";

// Demo Mode: shown only when the logged-in user is the shared public demo account
// (UserDTO.demo, backend dto/UserDTO.java - serialized as "demo" on /auth/me) - never for real
// users. Purely informational: the actual read-only enforcement is entirely backend-side
// (DemoAccessFilter/ROLE_DEMO), matching the app's existing rule that frontend gating is UX
// only, never the security boundary.
function DemoModeBanner() {
    return (
        <div className="demo-neon-border demo-neon-border--banner mb-4 flex items-start gap-3 rounded-ds-lg border border-dsBrand-100 bg-dsBrand-50 p-3.5 sm:items-center">
            <DemoNeonBorder variant="banner" />
            <Info size={18} strokeWidth={2} className="mt-0.5 flex-none text-dsBrand-600 sm:mt-0" />
            <div className="flex-1">
                <p className="text-ds-body text-dsNeutral-600">
                    <span className="font-semibold text-dsBrand-700">
                        Demo Mode
                    </span>
                    {" — "}
                    This demo uses isolated sample data and local demo media, not Faceboard's real
                    user data. You can explore sample posts, profiles, conversations and
                    notifications. Actions such as liking, posting, adding friends, sharing, sending
                    messages, editing your profile or uploading images are disabled.
                </p>

                <span className="mt-1 block font-semibold text-dsBrand-700">
                    Register now to use full Faceboard features with your own account and data.
                </span>
            </div>
        </div>
    );
}

export default DemoModeBanner;
