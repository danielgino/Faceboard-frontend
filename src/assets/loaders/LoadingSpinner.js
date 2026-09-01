import { Loader2 } from "lucide-react";

// Design System (#feedback) Spinner: a spinning loader-2 glyph, not a bare
// CSS border ring. Consumers pass size via `w-*/h-*` and color via
// `text-*` (was `border-*` for the old border-ring technique) in the same
// `className` prop, so the external API (one className passthrough) is
// unchanged - only the color-class convention each caller uses changed.
function LoadingSpinner({className = ""}) {
    return <Loader2 className={`animate-spin ${className}`} strokeWidth={2.5}/>;
}

export default LoadingSpinner;
