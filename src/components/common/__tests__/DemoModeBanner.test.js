import React from "react";
import { render, screen } from "@testing-library/react";
import DemoModeBanner from "../DemoModeBanner";

// Neon-border polish: DemoModeBanner is purely informational (see the component's own comment) -
// these tests confirm the animated glow attaches via className only, alongside the existing
// wording/markup, with no new interactive element and nothing about its content changed.

test("renders the existing Demo Mode wording and icon, with the neon-border classes on the outer element", () => {
    const { container } = render(<DemoModeBanner />);

    expect(screen.getByText("Demo Mode")).toBeInTheDocument();
    expect(screen.getByText(/isolated sample data and local demo media/i)).toBeInTheDocument();

    const outer = container.firstChild;
    expect(outer.className).toContain("demo-neon-border");
    expect(outer.className).toContain("demo-neon-border--banner");
    // The pre-existing banner styling (background/border/rounding) must still be present.
    expect(outer.className).toContain("bg-dsBrand-50");
    expect(outer.className).toContain("border-dsBrand-100");
});

test("the banner introduces no interactive/clickable element of its own", () => {
    render(<DemoModeBanner />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
});

test("the runner is a decorative, aria-hidden SVG perimeter outline - not a rotating background", () => {
    const { container } = render(<DemoModeBanner />);

    const svg = container.querySelector("svg.demo-neon-border-svg--banner");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg.querySelectorAll("rect.demo-neon-border-track")).toHaveLength(1);
    expect(svg.querySelectorAll("rect.demo-neon-border-runner")).toHaveLength(1);
});
