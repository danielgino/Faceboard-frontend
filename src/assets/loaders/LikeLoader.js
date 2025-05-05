import { Spinner } from "@material-tailwind/react";

function LikeLoader() {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-[360px] h-[410px] flex flex-col justify-center items-center animate-fade-in">
                <Spinner className="h-16 w-16 mb-6 text-blue-500 animate-spin" />
                <p className="text-gray-800 text-xl font-bold">Loading Likes❤️</p>
            </div>
        </div>
    );
}

export default LikeLoader;
