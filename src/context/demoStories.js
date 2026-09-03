// Demo Mode Stories: GET /api/stories/friends and POST /api/stories/upload are not on the Demo
// allowlist, so these are pure frontend-local mock data with no backend involvement at all (see
// StoryProvider.js for how this is wired in).
//
// Permanence: plain JS objects, not database rows - never written by StoryService.uploadStory,
// never touched by the hourly `deleteExpiredStories` sweep (they have no `expiresAt`, unlike the
// real Story entity, since nothing here ever filters them by age), unaffected by a deploy/restart.
//
// Shape mirrors backend dto/StoryDTO.java, limited to the fields StoryBar.js actually reads
// (fullName, profilePictureUrl, imageUrl, caption) plus a stable mock `id`.
export const DEMO_STORIES = [
    {
        id: "demo-story-01",
        fullName: "Demo User",
        profilePictureUrl: "/demo-assets/profiles/demo-user.jpeg",
        imageUrl: "/demo-assets/stories/demo-story-01.jpg",
        caption: "Exploring Faceboard today!",
    },
    {
        id: "demo-story-02",
        fullName: "Alex Rivera",
        profilePictureUrl: "/demo-assets/profiles/alex-rivera.jpeg",
        imageUrl: "/demo-assets/stories/demo-story-02.jpg",
        caption: "Lunch Time! ",
    },
    {
        id: "demo-story-03",
        fullName: "Jamie Chen",
        profilePictureUrl: "/demo-assets/profiles/jamie-chen.jpeg",
        imageUrl: "/demo-assets/stories/demo-story-03.jpg",
        caption: "Pizza break 🍕",
    },
    {
        id: "demo-story-04",
        fullName: "Sam Okafor",
        profilePictureUrl: "/demo-assets/profiles/sam-okafor.jpeg",
        imageUrl: "/demo-assets/stories/demo-story-04.jpg",
        caption: "Burger time! 🍔",
    },
];

export function getDemoStories() {
    return DEMO_STORIES;
}
