import React from "react";
import { Lock } from "lucide-react";

// Demo Mode: small inline notice for a specific disabled control group (e.g. Settings' profile
// fields, profile picture, password). Distinct from DemoModeBanner (page-level, shown once near
// the top of Feed) - this is scoped to sit directly below the specific controls it explains, per
// component. Purely informational, like DemoModeBanner: the actual enforcement is backend-side.
function DemoReadOnlyNotice({ message = "Demo Mode — profile details cannot be edited." }) {
    return (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-ds-caption text-dsNeutral-500">
            <Lock size={13} strokeWidth={2} className="flex-none text-dsNeutral-500" />
            {message}
        </p>
    );
}

export default DemoReadOnlyNotice;
