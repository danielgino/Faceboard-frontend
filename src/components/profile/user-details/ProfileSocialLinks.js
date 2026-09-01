import {Tooltip} from "@material-tailwind/react";
import {Facebook, Instagram, Github} from "lucide-react";
import {FACEBOOK_URL_REGEX, INSTAGRAM_URL_REGEX} from "../../../utils/Utils";

// Fidelity reconciliation (Phase G): icon-badge treatment matches the rest
// of this migration's icon language (PersonalDetailRow, Notification rows,
// Swal icons) instead of oversized Font Awesome brand glyphs with gradient
// text. No design equivalent exists for a social-links row (#profile shows
// no such component) - real, existing content kept and reconciled into the
// established icon-badge language rather than removed.
//
// F2 render-time defense: only ever render a social link as clickable
// when it's set AND satisfies the same HTTPS + exact-domain policy
// enforced on save (FACEBOOK_URL_REGEX/INSTAGRAM_URL_REGEX, which also
// match "" since the field itself is optional - hence the separate
// non-empty check here). This also protects against any legacy stored
// value that predates that policy.
function SocialBadge({href, icon: Icon, tooltip, colorClass}) {
    const content = (
        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-dsNeutral-100 transition ${href ? `hover:bg-dsNeutral-200 ${colorClass}` : "text-dsNeutral-300 cursor-not-allowed"}`}>
            <Icon size={18} strokeWidth={1.75}/>
        </span>
    );
    return (
        <Tooltip content={tooltip}>
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label={tooltip}>{content}</a> : content}
        </Tooltip>
    );
}

function ProfileSocialLinks({facebookUrl, instagramUrl}) {
    const isValidFacebookUrl = !!facebookUrl && FACEBOOK_URL_REGEX.test(facebookUrl);
    const isValidInstagramUrl = !!instagramUrl && INSTAGRAM_URL_REGEX.test(instagramUrl);

    return (
        <div className="flex justify-center gap-3 pt-3 pb-1">
            <SocialBadge href={isValidFacebookUrl ? facebookUrl : null} icon={Facebook} tooltip={isValidFacebookUrl ? "Facebook Profile" : "No Info Yet"} colorClass="text-[#1877F2]"/>
            <SocialBadge href={isValidInstagramUrl ? instagramUrl : null} icon={Instagram} tooltip={isValidInstagramUrl ? "Follow on Instagram" : "No Info Yet"} colorClass="text-[#E1306C]"/>
            <SocialBadge href={null} icon={Github} tooltip="Coming soon" colorClass=""/>
        </div>
    );
}

export default ProfileSocialLinks;
