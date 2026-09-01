import logoPNG from "../../assets/photos/logo/logoPNG.png"
import {
    ABOUT_PAGE,
    DANIEL_FACEBOOK_ACCOUNT,
    DANIEL_GITHUB_ACCOUNT,
    DANIEL_INSTAGRAM_ACCOUNT,
    DANIEL_LINKEDIN_ACCOUNT
} from "../../utils/Utils";
import {useNavigate} from "react-router-dom";
import {Button} from "../common/Button";

const SOCIAL_LINKS = [
    {href: DANIEL_LINKEDIN_ACCOUNT, icon: "fa-brands fa-linkedin", color: "#1169ac", label: "LinkedIn"},
    {href: DANIEL_GITHUB_ACCOUNT, icon: "fa-brands fa-github", color: "#000000", label: "GitHub"},
    {href: DANIEL_FACEBOOK_ACCOUNT, icon: "fa-brands fa-square-facebook", color: "#145fe1", label: "Facebook"},
    {href: DANIEL_INSTAGRAM_ACCOUNT, icon: "fa-brands fa-instagram", color: "#ac3e8f", label: "Instagram"},
];

function Footer({compact = false})  {
    const navigate=useNavigate();

    if (compact) {
        return (
            <footer className="w-full border-t border-dsNeutral-200 bg-dsNeutral-canvas text-dsNeutral-600">
                <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 md:px-14">
                    <div className="flex min-w-0 items-center gap-3">
                        <img
                            src={logoPNG}
                            alt="Faceboard"
                            width="84"
                            height="20"
                            loading="lazy"
                            className="hidden h-4 w-auto flex-none object-contain opacity-80 sm:block"
                        />
                        <span className="hidden h-1 w-1 flex-none rounded-full bg-dsNeutral-300 md:block" aria-hidden="true"/>
                        <span className="hidden truncate text-[13px] leading-[1.3] text-dsNeutral-500 md:block">
                            Built for learning &amp; development — not for general public use.
                        </span>
                        <Button
                            variant="text"
                            onClick={() => navigate(ABOUT_PAGE)}
                            className="flex-none text-[13px]"
                        >
                            About
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <ul className="flex items-center gap-2">
                            {SOCIAL_LINKS.map(({href, icon, color, label}) => (
                                <li key={label}
                                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-dsNeutral-200 bg-dsNeutral-surface transition-transform hover:-translate-y-0.5">
                                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                                        <i className={icon} style={{color, fontSize: "13px"}}></i>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <span className="whitespace-nowrap text-[13px] leading-[1.3] text-dsNeutral-500">© {new Date().getFullYear()} Daniel Gino</span>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="text-dsNeutral-900 bg-dsNeutral-surface px-4 py-5 max-w-screen-xl mx-auto md:px-8">
            <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto sm:text-center">
                <img src={logoPNG}
                     className="w-40 sm:mx-auto"
                     alt="Faceboard Logo"/>
                <p className="leading-relaxed mt-2 text-[16px] text-dsNeutral-600">
                    Dear user, please note that this site was built for learning and development purposes,
                    the site is still under construction and is not built for
                    the general public but for use as a skills benchmark.
                </p>

                <Button
                    variant="text"
                    onClick={event => navigate(ABOUT_PAGE)}
                    className="text-[16px]"
                >
                    About
                </Button>
            </div>

            <div className="mt-8 items-center justify-between sm:flex">
                <div className="mt-4 sm:mt-0 text-[15px] text-dsNeutral-600">
                    &copy; {new Date().getFullYear()} Develop By Daniel Gino.
                </div>
                <div className="mt-6 sm:mt-0">
                    <ul className="flex items-center space-x-4">
                        {SOCIAL_LINKS.map(({href, icon, color, label}) => (
                            <li key={label} className="w-10 h-10 border border-dsNeutral-200 rounded-full flex items-center justify-center">
                                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                                    <i className={`${icon} fa-2xl`} style={{color, fontSize: "2.15em"}}></i>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <style>{`
                .svg-icon path,
                .svg-icon polygon,
                .svg-icon rect {
                    fill: currentColor;
                }
            `}</style>
        </footer>
    );
}

export default Footer;
