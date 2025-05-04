import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchProvider";
import { Avatar } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { PROFILE_PAGE } from "../utils/Utils";
import React from "react";

function SearchPage() {
    const navigate = useNavigate();
    const { searchResults } = useSearch();

    return (
        <div className="w-full px-6 py-8 bg-gray-100 min-h-screen">
            <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
                Search Results
            </h1>

            {searchResults.length === 0 ? (
                <p className="text-center text-gray-500">No users found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4 hover:shadow-xl transition"
                        >
                            <Avatar
                                src={user.profilePictureUrl}
                                alt={user.fullName}
                                className="w-16 h-16"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {user.fullName}
                                </h2>
                                <Link
                                    to={PROFILE_PAGE(user.id)}
                                    className="mt-2 text-blue-500 hover:underline block"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchPage;
