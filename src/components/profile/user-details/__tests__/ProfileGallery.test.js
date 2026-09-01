import React from "react";
import { render, screen, within } from "@testing-library/react";
import ProfileGallery from "../ProfileGallery";

// Phase 13 micro-close regression: the "View all" control used to be a
// <button> nested inside a <Link> (two interactive elements for one
// control). The Link itself now owns the interactive semantics.

// react-router-dom@7's package.json can't be resolved by this project's
// Jest resolver at all (see the same workaround/explanation in
// UserDetailsSocialLinks.test.js); ProfileGallery only renders <Link>.
jest.mock("react-router-dom", () => ({
    Link: ({ to, children, className }) => <a href={typeof to === "string" ? to : "#"} className={className}>{children}</a>,
}), { virtual: true });

jest.mock("../../../../context/LightBoxContext", () => ({
    useLightbox: () => ({ openLightbox: jest.fn() }),
}));

test("'View all' is a single link, not a button nested inside a link", () => {
    const images = ["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg"];
    render(<ProfileGallery images={images} userId={1} />);

    const viewAllLink = screen.getByRole("link", { name: /view all/i });
    expect(viewAllLink).toHaveAttribute("href", "/album/1");
    expect(within(viewAllLink).queryByRole("button")).not.toBeInTheDocument();
});

// Cleanup Batch 2: with 4 or fewer images (including zero), ProfileGallery
// intentionally renders no album link at all - "View all" only appears once
// there's a next page of photos to see (images.length > 4). The empty state
// is a static placeholder image + "No photos uploaded yet" message instead,
// so there is no interactive element to assert "single link, not a nested
// button" against; the meaningful invariant here is that the empty state
// renders with no link (and thus no nested-button hazard) at all.
test("empty gallery renders the 'no photos yet' placeholder with no album link", () => {
    render(<ProfileGallery images={[]} userId={1} />);

    expect(screen.getByText(/no photos uploaded yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
