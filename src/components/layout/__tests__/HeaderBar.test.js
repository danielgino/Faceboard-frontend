import React from "react";
import { render, screen } from "@testing-library/react";
import HeaderBar from "../HeaderBar";

// Phase 9 micro-close: the header's avatar/name block was
// Typography as="a" href="#" with no onClick - a dead anchor, purely
// presentational despite looking clickable. It's now a real react-router
// Link to the signed-in user's own profile page.

// react-router-dom@7's package.json can't be resolved by this project's
// Jest resolver at all (see the same workaround/explanation in
// UserDetailsSocialLinks.test.js); HeaderBar renders <Link> and calls
// useNavigate (unused by this test, but required to import cleanly).
jest.mock("react-router-dom", () => ({
    // Cleanup Batch 2: must pass through the rest of the props (aria-label
    // in particular) - HeaderBar renders two Links (mobile + desktop
    // identity block) whose only accessible name comes from aria-label,
    // not visible text, so a mock that drops it makes both anchors
    // unnamed/unfindable by role+name.
    Link: ({ to, children, ...rest }) => <a href={typeof to === "string" ? to : "#"} {...rest}>{children}</a>,
    useNavigate: () => jest.fn(),
    // Phase D: HeaderBar now reads the current route to render active-item
    // styling. Fixed at "/" (not any of HeaderBar's own nav targets), so
    // none of its items render as active in this test.
    useLocation: () => ({ pathname: "/" }),
}), { virtual: true });

jest.mock("../../interaction/Search", () => () => <div>search</div>);
jest.mock("../../interaction/Notification", () => () => <div>notification</div>);

const mockUser = { id: 42, fullName: "Ada Lovelace", profilePictureUrl: "" };
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

jest.mock("../../../hooks/useLogout", () => ({
    useLogout: () => jest.fn(),
}));

test("the identity block links to the signed-in user's own profile, not a dead '#' anchor", () => {
    render(<HeaderBar />);

    // Two identity links exist (a mobile-only and a desktop-only variant,
    // toggled by responsive classes jsdom doesn't evaluate) - both must
    // point at the signed-in user's own profile.
    const identityLinks = screen.getAllByRole("link", { name: /ada lovelace/i });
    expect(identityLinks.length).toBeGreaterThan(0);
    identityLinks.forEach((link) => expect(link).toHaveAttribute("href", "/profile/42"));
});

test("desktop nav list, inline search, and mobile-only icons all switch mode at md (768), not lg (1024)", () => {
    // jsdom doesn't evaluate media queries, so this only guards the class
    // contract itself (regression-proofing against an accidental partial
    // revert to lg:) — the actual rendered behavior at each width is
    // verified separately with a real browser.
    const { container } = render(<HeaderBar />);

    // The nav-item row is a <nav>, not a <div>, in the current markup.
    const desktopNavWrapper = screen.getByText(/feed/i).closest("nav.hidden");
    expect(desktopNavWrapper).toHaveClass("md:flex");
    expect(desktopNavWrapper).not.toHaveClass("lg:flex");

    // The search wrapper now switches on "md:block" (not "md:flex").
    const searchWrapper = screen.getByText("search").parentElement;
    expect(searchWrapper).toHaveClass("md:block");
    expect(searchWrapper).not.toHaveClass("lg:block");

    // The mobile-icons wrapper is spaced via a preceding flex-1 spacer, not
    // an "ml-auto" class on itself - select it by its actual "md:hidden" class.
    const mobileIconsWrapper = screen.getByLabelText("Search").closest("div.md\\:hidden");
    expect(mobileIconsWrapper).toHaveClass("md:hidden");
    expect(mobileIconsWrapper).not.toHaveClass("lg:hidden");

    expect(container.innerHTML).not.toMatch(/\blg:/);
});
