import { FACEBOOK_URL_REGEX, INSTAGRAM_URL_REGEX } from "../Utils";

// F2 fix: single source of truth for the social-link policy used by both
// Settings.js (input validation) and UserDetails.js (render-time gate).
// HTTPS-only, exact facebook.com/instagram.com host, empty string allowed.

describe("F2 - FACEBOOK_URL_REGEX / INSTAGRAM_URL_REGEX policy", () => {
    test("valid https:// URLs are accepted", () => {
        expect(FACEBOOK_URL_REGEX.test("https://facebook.com/john")).toBe(true);
        expect(FACEBOOK_URL_REGEX.test("https://www.facebook.com/john.doe")).toBe(true);
        expect(INSTAGRAM_URL_REGEX.test("https://instagram.com/john")).toBe(true);
        expect(INSTAGRAM_URL_REGEX.test("https://www.instagram.com/john.doe")).toBe(true);
    });

    test("empty values remain accepted", () => {
        expect(FACEBOOK_URL_REGEX.test("")).toBe(true);
        expect(INSTAGRAM_URL_REGEX.test("")).toBe(true);
    });

    test("scheme-less URLs are rejected", () => {
        expect(FACEBOOK_URL_REGEX.test("facebook.com/john")).toBe(false);
        expect(FACEBOOK_URL_REGEX.test("www.facebook.com/john")).toBe(false);
        expect(INSTAGRAM_URL_REGEX.test("instagram.com/john")).toBe(false);
    });

    test("http:// is rejected (HTTPS-only policy)", () => {
        expect(FACEBOOK_URL_REGEX.test("http://facebook.com/john")).toBe(false);
        expect(INSTAGRAM_URL_REGEX.test("http://instagram.com/john")).toBe(false);
    });

    test("javascript:, data:, protocol-relative, malformed, and deceptive-domain URLs remain rejected", () => {
        const badFacebook = [
            "javascript:alert(1)",
            "javascript://facebook.com/%0aalert(1)",
            "data:text/html,<script>alert(1)</script>",
            "//facebook.com/john",
            "https://facebook.com.evil.com/john",
            "https://evil.com/facebook.com/john",
            " https://facebook.com/john",
            "https://facebook.com/john ",
            "HTTPS://facebook.com/john",
        ];
        badFacebook.forEach((value) => {
            expect(FACEBOOK_URL_REGEX.test(value)).toBe(false);
        });

        const badInstagram = [
            "javascript:alert(1)",
            "data:text/html,<script>alert(1)</script>",
            "//instagram.com/john",
            "https://instagram.com.evil.com/john",
        ];
        badInstagram.forEach((value) => {
            expect(INSTAGRAM_URL_REGEX.test(value)).toBe(false);
        });
    });

    test("a facebook-shaped URL never satisfies the instagram policy and vice versa", () => {
        expect(INSTAGRAM_URL_REGEX.test("https://facebook.com/john")).toBe(false);
        expect(FACEBOOK_URL_REGEX.test("https://instagram.com/john")).toBe(false);
    });
});
