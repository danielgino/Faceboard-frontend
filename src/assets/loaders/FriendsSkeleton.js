// src/assets/loaders/FriendsSkeleton.jsx
export default function FriendsSkeleton({ count = 12 }) {
    return (
        <div className="px-6 pt-6 bg-gray-100 w-full min-h-screen">
            <div className="flex flex-wrap justify-center gap-6" aria-busy="true" aria-live="polite">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="w-40 shadow-md rounded-lg bg-white animate-pulse">
                        <div className="h-40 w-full bg-gray-200 rounded-md mb-3" />
                        <div className="px-3">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
