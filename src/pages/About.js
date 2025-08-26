import Iridescence from "../components/about/GalaxyBackground";
import TiltedCard from "../components/about/AboutCard";
import LogoLoading from "../assets/photos/logo/LogoLoading.png";
import github from "../assets/photos/github.png";
import linkedin from "../assets/photos/linkedin.png";
import mail from "../assets/photos/mail.png";
import FlowingMenu from "../components/about/AnimatedMenu";
import Footer from "../components/layout/Footer";
import {DANIEL_EMAIL, DANIEL_GITHUB_ACCOUNT, DANIEL_LINKEDIN_ACCOUNT, LOGIN_PAGE} from "../utils/Utils";

function About() {
    const menuItems = [
        { link: DANIEL_GITHUB_ACCOUNT, text: "GitHub",   image: github },
        { link: DANIEL_LINKEDIN_ACCOUNT, text: "LinkedIn", image: linkedin },
        { link: `mailto:${DANIEL_EMAIL}`, text: "Email",     image: mail },
        { route: LOGIN_PAGE, text: "Back to Login", image: LogoLoading },
    ];

    return (
        <div>
        <section className="relative w-full min-h-[420px]  h-[100vh] lg:h-[100vh]  overflow-hidden bg-black">
            <Iridescence className="absolute inset-0 z-0" />
            <div className="relative z-10 p-6 sm:p-10 h-full">
                   <div className="mx-auto max-w-screen-md">
                       <div className="mt-4 flex flex-col items-center">
                           <TiltedCard imageSrc={LogoLoading}
                                       imageWidth="clamp(240px, 80vw, 640px)"
                                       imageHeight="clamp(140px, 45vw, 360px)"/>
                           <p className="mt-2 text-white/80 font-semibold text-white max-w-2xl text-sm md:text-base">
                               This site was developed by Daniel Gino. Feel free to contact me with any problems.
                           </p>
                       </div>

                       <div className="mt-6 lg:mt-0">
                       <FlowingMenu items={menuItems}/>
                    </div>
            </div>
        </div>

        </section>
            <Footer/>
        </div>
    );
}

export default About;
