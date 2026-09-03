import { DEMO_STORIES, getDemoStories } from "../demoStories";

// Verifies the single source of truth for Demo Story mock data directly, independent of
// StoryProvider/StoryBar wiring - see those components' own tests for the integration behavior.

test("getDemoStories returns exactly 4 stories", () => {
    expect(getDemoStories()).toHaveLength(4);
    expect(DEMO_STORIES).toHaveLength(4);
});

test("every Story image URL is local (/demo-assets/stories/...), never Cloudinary or external", () => {
    for (const story of getDemoStories()) {
        expect(story.imageUrl.startsWith("/demo-assets/stories/")).toBe(true);
        expect(story.imageUrl.toLowerCase()).not.toContain("cloudinary");
        expect(story.imageUrl.toLowerCase()).not.toMatch(/^https?:\/\//);
    }
});

test("every Story avatar URL is a local Demo profile asset, never Cloudinary or external", () => {
    for (const story of getDemoStories()) {
        expect(story.profilePictureUrl.startsWith("/demo-assets/profiles/")).toBe(true);
        expect(story.profilePictureUrl.toLowerCase()).not.toContain("cloudinary");
    }
});

test("the 4 authors are exactly Demo User, Alex Rivera, Jamie Chen, and Sam Okafor", () => {
    const names = getDemoStories().map((s) => s.fullName).sort();
    expect(names).toEqual(["Alex Rivera", "Demo User", "Jamie Chen", "Sam Okafor"]);
});

test("each story has a stable, unique mock id", () => {
    const ids = getDemoStories().map((s) => s.id);
    expect(new Set(ids).size).toBe(4);
    ids.forEach((id) => expect(typeof id).toBe("string"));
});

test("no story carries an expiresAt/createdAt field a real Story consumer could use to hide it", () => {
    for (const story of getDemoStories()) {
        expect(story.expiresAt).toBeUndefined();
        expect(story.createdAt).toBeUndefined();
    }
});
