import React, { useEffect, useRef, useState } from "react";
import Stories from "react-insta-stories";
import { X, Plus } from "lucide-react";
import { useStories } from "../../context/StoryProvider";
import { useUser } from "../../context/UserProvider";
import { WithHeader } from "react-insta-stories";
import { Avatar as PrimitiveAvatar } from "../common/Avatar";
import openStoryUploadDialog from "../profile/StoryUploadDialog";
import {useIsMobile} from "../../hooks/useIsMobile";

// Fidelity reconciliation (Phase G): rail rebuilt against the Design
// System's AddStory/StoryPreview rail (#stories) - 64px avatar, plus-badge
// on the current user's own circle, ring color distinguishing it from
// friends' story circles. Every handler/effect below (grouping, Escape/Tab
// trap, focus entry/return, onAllStoriesEnd sequencing) is unchanged - see
// the ledger for the one item intentionally NOT touched here: there is no
// per-story viewed/unviewed data in StoryProvider to key a ring color off,
// so every friend circle uses the design's single "has a story" ring
// treatment - not a MISSING DESIGN STATE this pass invents new business
// logic to fill. (Phase J: the stories.reduce below is now safe against a
// non-array response - StoryProvider.fetchStories normalizes the payload
// to an array before it reaches this component.)
const RING_MINE = { boxShadow: "0 0 0 3px #fff, 0 0 0 5px oklch(88% 0.007 266)" };
const RING_FRIEND = { boxShadow: "0 0 0 3px #fff, 0 0 0 5px oklch(46% 0.18 275)" };

function StoryBar() {
    const [showStories, setShowStories] = useState(false);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(null);
    const { stories, loading, uploadStory, fetchStories } = useStories();
    const { user } = useUser();
    // Phase J: migrated off Utils.js's static (module-load-time) isMobile,
    // which never updated on resize/rotation - see useIsMobile.js's own
    // HOOK-003 comment for the other call sites that already made this move.
    const isMobile = useIsMobile();

    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);

    const groupedStories = stories.reduce((acc, story) => {
        if (!acc[story.fullName]) {
            acc[story.fullName] = {
                profilePictureUrl: story.profilePictureUrl,
                fullName: story.fullName,
                stories: [],
            };
        }

        acc[story.fullName].stories.push({
            content: ({ action, isPaused }) => (
                <WithHeader story={{
                    header: {
                        heading: story.fullName,
                        profileImage: story.profilePictureUrl
                    }
                }} globalHeader="">
                    <div >
                        <img
                            src={story.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        {story.caption && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    background: "rgba(0, 0, 0, 0.6)",
                                    color: "white",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    maxWidth: "80%",
                                }}
                            >
                                {story.caption}
                            </div>
                        )}
                    </div>
                </WithHeader>
            )
        });

        return acc;
    }, {});

    const storyGroups = Object.values(groupedStories);

    const handleStoryClick = (index) => {
        setCurrentGroupIndex(index);
        setShowStories(true);
    };

    const closeStoryViewer = () => {
        setShowStories(false);
        setCurrentGroupIndex(null);
    };

    // Phase 9: the story viewer is a custom fixed overlay (no modal library),
    // so Escape-to-close has to be added explicitly - native dialog/library
    // modals elsewhere in the app (SweetAlert2, yet-another-react-lightbox)
    // already provide this themselves.
    //
    // Phase 12: also traps Tab within the dialog. react-insta-stories
    // exposes no ref/focus API (checked its installed type defs/README -
    // its props are all content/timing/callbacks, nothing focus-related),
    // and its own tap-to-navigate zones aren't native focusable elements
    // (keyboardNavigation defaults to false, and this call site doesn't
    // enable it). Rather than coupling to any of that, the trap queries
    // generically for whatever IS focusable inside the dialog at trap time
    // - the same library-agnostic approach already used in LikeList - so it
    // stays correct regardless of what react-insta-stories (or a future
    // library swap) renders internally.
    useEffect(() => {
        if (!showStories) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeStoryViewer();
                return;
            }
            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll(
                    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showStories]);

    // Focus entry/return for the same custom overlay.
    useEffect(() => {
        if (showStories) {
            previouslyFocusedElementRef.current = document.activeElement;
            closeButtonRef.current?.focus();
        } else {
            previouslyFocusedElementRef.current?.focus?.();
        }
    }, [showStories]);

    const safeStories = (storyGroups[currentGroupIndex]?.stories || []).filter(
        (s) => typeof s.content === "function"
    );

    return (
        <div className="relative bg-white border border-dsNeutral-100 shadow-ds-low rounded-ds-lg my-5
  w-full mx-auto
  max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl
  overflow-x-hidden">
            <div className="w-full overflow-x-auto overflow-y-hidden px-3 sm:px-4">
                <div className="flex items-center gap-4 py-3 min-w-fit">

                    <button
                        type="button"
                        className="flex flex-col items-center justify-center gap-1.5 cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                        onClick={() => openStoryUploadDialog(uploadStory, fetchStories)}
                    >
                        <div className="relative">
                            <PrimitiveAvatar
                                src={user.profilePictureUrl}
                                name={user.fullName}
                                alt="Your story"
                                size={64}
                                style={RING_MINE}
                            />
                            <span
                                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-dsBrand-600 border-2 border-white flex items-center justify-center"
                                aria-hidden="true">
                                <Plus size={12} strokeWidth={2.75} className="text-white" />
                            </span>
                        </div>
                        <span className="text-center text-[11px] font-medium text-dsNeutral-600 w-16 truncate">
                            Your story
                        </span>
                    </button>

                    {loading && stories.length === 0 && (
                        <div className="flex items-center gap-4" aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-dsNeutral-100 animate-pulse" />
                                    <div className="w-10 h-2 rounded bg-dsNeutral-100 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    )}

                    {storyGroups.map((userGroup, index) => (
                        <button
                            type="button"
                            key={index}
                            className="flex flex-col items-center gap-1.5 cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                            onClick={() => handleStoryClick(index)}
                        >
                            <PrimitiveAvatar
                                src={userGroup.profilePictureUrl}
                                name={userGroup.fullName}
                                alt={userGroup.fullName}
                                size={64}
                                style={RING_FRIEND}
                                className="hover:scale-105 transition duration-200"
                            />
                            <span className="text-center text-[11px] font-medium text-dsNeutral-600 w-16 truncate">
                                {userGroup.fullName}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {showStories && currentGroupIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{background: "oklch(21% 0.014 266)"}}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Story viewer"
                    ref={dialogRef}
                >
                    <div className="relative">
                        <Stories
                            stories={safeStories}
                            defaultInterval={3000}
                            width={isMobile ? "100vw" : "30vw"}
                            height={isMobile ? "100vw" : "45vw"}
                            onAllStoriesEnd={() => {
                                setShowStories(false);
                                setTimeout(() => {
                                    const nextIndex = currentGroupIndex + 1;
                                    if (nextIndex < storyGroups.length) {
                                        const nextStories = storyGroups[nextIndex]?.stories || [];
                                        if (nextStories.length > 0) {
                                            setCurrentGroupIndex(nextIndex);
                                            setShowStories(true);
                                        }
                                    } else {
                                        setCurrentGroupIndex(null);
                                    }
                                }, 200);
                            }}
                        />
                        <button
                            type="button"
                            className="absolute top-4 right-4 z-[10000] bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            onClick={closeStoryViewer}
                            aria-label="Close story"
                            ref={closeButtonRef}
                        >
                            <X size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}

export default StoryBar;
