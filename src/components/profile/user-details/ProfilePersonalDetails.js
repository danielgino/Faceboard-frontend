import {Mail, CalendarDays, Venus, Mars} from "lucide-react";
import {GenderEnum, formatFullDate} from "../../../utils/Utils";

// Design System (#profile) PersonalDetailRow: 32px icon badge + stacked
// label/value. Renders nothing when the value is missing, so callers don't
// need to litter the JSX with their own falsy checks per field.
function PersonalDetailRow({icon: Icon, label, value}) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2.5 py-1.5">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-dsNeutral-100 text-dsNeutral-600">
                <Icon className="h-[15px] w-[15px]" strokeWidth={1.75}/>
            </span>
            <div className="min-w-0 break-words">
                <p className="text-ds-caption text-dsNeutral-500">{label}</p>
                <p className="text-ds-label font-medium text-dsNeutral-900">{value}</p>
            </div>
        </div>
    );
}

// `email` is intentionally received pre-resolved: UserDetails is the only
// place that decides self-vs-other-user visibility for it (never derivable
// from `gender`/`birthDate` alone), so that security-relevant decision stays
// visible at the orchestration level instead of being duplicated here.
function ProfilePersonalDetails({gender, birthDate, email}) {
    const genderLabel = gender === GenderEnum.MALE ? "Male"
        : gender === GenderEnum.FEMALE ? "Female"
        : null;
    const genderIcon = gender === GenderEnum.MALE ? Mars : Venus;

    const birthDateValue = new Date(birthDate);
    // Deterministic locale (not the browser's own) - see formatFullDate's
    // own comment in Utils.js for why `undefined` previously produced
    // inconsistent, sometimes visually mis-ordered output across viewers.
    const birthdayLabel = birthDate && !isNaN(birthDateValue)
        ? formatFullDate(birthDateValue)
        : null;

    const hasPersonalDetails = !!genderLabel || !!birthdayLabel || !!email;
    if (!hasPersonalDetails) return null;

    return (
        <div className="mt-3 flex flex-col gap-1 border-t border-dsNeutral-100 pt-3 text-left">
            <PersonalDetailRow icon={genderIcon} label="Gender" value={genderLabel}/>
            <PersonalDetailRow icon={CalendarDays} label="Birthday" value={birthdayLabel}/>
            <PersonalDetailRow icon={Mail} label="Email" value={email}/>
        </div>
    );
}

export default ProfilePersonalDetails;
