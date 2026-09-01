import {Heart, MessageSquare} from "lucide-react";
import logoPNG from "../../assets/photos/logo/logoPNG.png";
import Footer from "../layout/Footer";
import {ALT_RANDOM_USERS} from "../../utils/Utils";

// Reused from the pre-redesign Login/SignUp pages — same existing avatar assets,
// just applied consistently across the brand panel and the feed preview.
// Note: the original 5-image set included a uifaces.co URL that no longer resolves
// (that demo service has been shut down); it's dropped here rather than shipping a
// visibly broken avatar in a more prominent spot. The remaining 4 are the same URLs.
const AVATARS = [
    "https://randomuser.me/api/portraits/women/79.jpg",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=a72ca28288878f8404a795f39642a46f",
    "https://randomuser.me/api/portraits/men/86.jpg",
    "https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e",
];

export const AuthAvatarCluster = ({size = "md", caption}) => {
    const dim = size === "sm" ? "h-7 w-7" : "h-10 w-10";
    return (
        <div className="flex items-center gap-3.5">
            <div className="flex -space-x-2.5">
                {AVATARS.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt={ALT_RANDOM_USERS}
                        loading="lazy"
                        className={`${dim} flex-none rounded-full border-2 border-white object-cover shadow-sm`}
                        style={{zIndex: AVATARS.length - i}}
                    />
                ))}
            </div>
            {caption && <p className="text-sm font-medium text-dsNeutral-600">{caption}</p>}
        </div>
    );
};

const ShareIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"/>
    </svg>
);

function FeedPreviewCard({variant, name, time, text, avatar}) {
    const isBack = variant === "back";
    return (
        <div
            className={
                isBack
                    ? "absolute -left-8 -top-7 hidden w-[230px] rotate-[-5deg] rounded-2xl border border-dsNeutral-200/70 bg-dsNeutral-surface p-3.5 opacity-90 shadow-[0_1px_2px_rgba(16,22,43,.05),0_16px_32px_-18px_rgba(31,29,90,.28)] xl:block"
                    : "relative w-[210px] rounded-2xl border border-dsNeutral-200/70 bg-dsNeutral-surface p-3.5 shadow-[0_1px_2px_rgba(16,22,43,.05),0_16px_32px_-18px_rgba(31,29,90,.28)] xl:w-[270px] xl:p-4"
            }
        >
            <div className="flex items-center gap-2.5">
                <img src={avatar} alt="" loading="lazy" className="h-8 w-8 flex-none rounded-full object-cover"/>
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight text-dsNeutral-900">{name}</p>
                    <p className="text-[11.5px] leading-tight text-dsNeutral-500">{time}</p>
                </div>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-snug text-dsNeutral-600">{text}</p>
            {!isBack && (
                <div className="mt-2.5 h-14 overflow-hidden rounded-lg bg-gradient-to-br from-dsBrand-100 to-dsBrand-50 xl:h-[76px]">
                    {/* Illustrative micro-chart inside the feed-preview mockup, not a
                        real UI surface - the two fills are kept as literal hex (not ds
                        tokens) since they're decorative art layered over the
                        dsBrand-100/50 gradient background above, not text/surface color. */}
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full opacity-60">
                        <polygon points="0,40 20,14 38,30 55,8 72,26 100,40" fill="#4f46e5" opacity="0.35"/>
                        <polygon points="0,40 30,24 60,34 100,18 100,40" fill="#241f5c" opacity="0.35"/>
                    </svg>
                </div>
            )}
            <div className="mt-2.5 flex items-center gap-3 text-dsNeutral-500">
                {/* Like + Comment reuse the exact icons the real post component uses
                    (lucide `Heart` — see src/Icons/HeartIcon.js — and lucide
                    `MessageSquare` — see Post.js), stroked to match the Share icon
                    beside them. `items-center` keeps all three on one baseline;
                    each keeps its own glyph proportions. */}
                <Heart className="h-4 w-4" strokeWidth={1.8}/>
                <MessageSquare className="h-4 w-4" strokeWidth={1.8}/>
                {!isBack && <ShareIcon className="h-4 w-4"/>}
            </div>
        </div>
    );
}

/**
 * Shared shell for Login/SignUp: asymmetric brand panel (lg+) + auth panel,
 * with the compact footer pinned to the bottom of the same viewport.
 */
function AuthLayout({brandHeading, brandSubtext, avatarCaption = "A few familiar faces are already here.", children}) {
    return (
        <div className="flex min-h-dvh flex-col bg-dsNeutral-surface">
            <main className="mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 overflow-x-hidden">
                <div className="relative hidden overflow-hidden bg-dsBrand-50 lg:flex lg:flex-[0_0_58%] lg:items-center">
                    <div className="relative z-10 w-full py-14 pl-12 pr-8 xl:py-16 xl:pl-[72px] xl:pr-10">
                        <div className="max-w-[420px] xl:max-w-[440px]">
                            <img
                                src={logoPNG}
                                alt="Faceboard logo"
                                width="168"
                                height="50"
                                className="mb-9 h-auto w-36 object-contain xl:mb-11 xl:w-[168px]"
                            />
                            <h1 className="text-[32px] font-bold leading-[1.16] tracking-tight text-dsBrand-800 xl:text-[40px]">
                                {brandHeading}
                            </h1>
                            <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-dsNeutral-600 xl:text-base">
                                {brandSubtext}
                            </p>
                            <div className="mt-7">
                                <AuthAvatarCluster caption={avatarCaption}/>
                            </div>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-10 right-10 z-10 xl:bottom-14 xl:right-14">
                        <FeedPreviewCard variant="back" name="Jonas Dahl" time="1d" text="Sunday hike crew, who's in?" avatar={AVATARS[3]}/>
                        <FeedPreviewCard variant="front" name="Maya Lindqvist" time="3h" text="Back in the city — coffee this week?" avatar={AVATARS[0]}/>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-10 sm:px-8 lg:border-l lg:border-dsNeutral-200 lg:px-10 lg:py-12">
                    <div className="w-full max-w-[440px]">{children}</div>
                </div>
            </main>
            <Footer compact/>
        </div>
    );
}

export default AuthLayout;
