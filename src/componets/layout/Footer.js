
import logoPNG from "../../assets/logo/logoPNG.png"
import {
    DANIEL_FACEBOOK_ACCOUNT,
    DANIEL_GITHUB_ACCOUNT,
    DANIEL_INSTAGRAM_ACCOUNT,
    DANIEL_LINKEDIN_ACCOUNT
} from "../../utils/Utils";

function Footer()  {

    const footerNavs = [
        {
            href: 'javascript:void()',
            name: 'About'
        },
        {
            href: 'javascript:void()',
            name: 'Blog'
        },
        {
            href: 'javascript:void()',
            name: ''
        },

        {
            href: 'javascript:void()',
            name: 'Careers'
        },

        {
            href: 'javascript:void()',
            name: 'Support'
        }
    ]

    return (
        <footer className="text-gray-500 bg-white px-4 py-5 max-w-screen-xl mx-auto md:px-8">
            <div className="max-w-lg sm:mx-auto sm:text-center">
                <img src={logoPNG} className="w-32 sm:mx-auto"  alt=""/>
                <p className="leading-relaxed mt-2 text-[15px]">
                    Dear user, please note that this site was built for learning and development purposes, therefore it is not accessible to those with disabilities.                </p>
            </div>
            <ul className="items-center justify-center mt-8 space-y-5 sm:flex sm:space-x-4 sm:space-y-0">
                {
                    footerNavs.map((item, idx) => (
                        <li className=" hover:text-gray-800">
                            <a key={idx} href={item.href}>
                                { item.name }
                            </a>
                        </li>
                    ))
                }
            </ul>
            <div className="mt-8 items-center justify-between sm:flex">
                <div className="mt-4 sm:mt-0">
                    &copy; {new Date().getFullYear()} Develop By Daniel Gino.
                </div>
                <div className="mt-6 sm:mt-0">
                    <ul className="flex items-center space-x-4">
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_LINKEDIN_ACCOUNT} target="_blank"
                               rel="noopener noreferrer">
                                <i className="fa-brands fa-linkedin fa-xl" style={{color: "#1169ac"}}></i>
                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_GITHUB_ACCOUNT} target="_blank">
                            <i className="fa-brands fa-github fa-xl" style={{color: "#000000"}}></i>
                        </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_FACEBOOK_ACCOUNT} target="_blank">
                                <i className="fa-brands fa-square-facebook fa-xl" style={{color: "#145fe1"}}></i>
                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={DANIEL_INSTAGRAM_ACCOUNT} target="_blank">
                                <i className="fa-brands fa-instagram fa-xl" style={{color: "#ac3e8f"}}></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <style jsx>{`
                .svg-icon path,
                .svg-icon polygon,
                .svg-icon rect {
                    fill: currentColor;
                }
            `}</style>
        </footer>
    )
}

export default Footer
