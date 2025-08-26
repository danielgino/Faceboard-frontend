import logoPNG from "../../assets/photos/logo/logoPNG.png"
import {
    ABOUT_PAGE,
    DANIEL_FACEBOOK_ACCOUNT,
    DANIEL_GITHUB_ACCOUNT,
    DANIEL_INSTAGRAM_ACCOUNT,
    DANIEL_LINKEDIN_ACCOUNT
} from "../../utils/Utils";
import {useNavigate} from "react-router-dom";

function Footer()  {
    const navigate=useNavigate();

    return (
        <footer className="text-gray-800 bg-white px-4 py-5 max-w-screen-xl mx-auto md:px-8">
            <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto sm:text-center">
                <img src={logoPNG}
                     className="w-40 sm:mx-auto"
                     alt="Faceboard Logo"/>
                <p className="leading-relaxed mt-2 text-[15px]">
                    Dear user, please note that this site was built for learning and development purposes,
                    the site is still under construction and is not built for
                    the general public but for use as a skills benchmark.
                </p>

                <button
                    type="button"
                    onClick={event => navigate(ABOUT_PAGE)}
                    className="text-md text-indigo-600 hover:underline"
                >
                    About
                </button>
            </div>

            <div className="mt-8 items-center justify-between sm:flex">
                <div className="mt-4 sm:mt-0">
                    &copy; {new Date().getFullYear()} Develop By Daniel Gino.
                </div>
                <div className="mt-6 sm:mt-0">
                    <ul className="flex items-center space-x-4">
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_LINKEDIN_ACCOUNT} target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-linkedin fa-2xl" style={{color: "#1169ac"}}></i>
                            </a>
                        </li>
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_GITHUB_ACCOUNT} target="_blank">
                                <i className="fa-brands fa-github fa-2xl" style={{color: "#000000"}}></i>
                            </a>
                        </li>
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_FACEBOOK_ACCOUNT} target="_blank">
                                <i className="fa-brands fa-square-facebook fa-2xl" style={{color: "#145fe1"}}></i>
                            </a>
                        </li>
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_INSTAGRAM_ACCOUNT} target="_blank">
                                <i className="fa-brands fa-instagram fa-2xl" style={{color: "#ac3e8f"}}></i>
                            </a>
                        </li>
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
