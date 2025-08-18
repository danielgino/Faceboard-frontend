
import React from "react";

export default function CardSkeletonLoader() {
    return (
        <div className="animate-pulse w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="h-40 bg-gray-300 rounded-md mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
    );
}
