import Feed from "../components/layout/Feed";
import UserDetails from "../components/profile/UserDetails";
import { useParams } from "react-router-dom";
import {fluid} from "../components/layout/navFluid";

// Profile/Feed large-screen balance (Phase G): the UserDetails column grows
// gently past its old flat lg:max-w-sm/xl:max-w-md/2xl:max-w-lg ceiling
// (384/448/512px) so it doesn't read as a narrow sliver next to the feed on
// 1920/2560 monitors, capped well short of competing with the feed column
// for space - same fluid-width philosophy already established for the
// navigation shell and MainLayout's content column.
const PROFILE_COLUMN_WIDTH = fluid(384, 560);

function Profile() {
    const { userId } = useParams();
    return (
        // Layout repair: rebuilt as an explicit CSS Grid instead of
        // lg:flex-row-reverse + w-full/flex-shrink-0. The flex version had a
        // real bug - the Details wrapper's unconditional `w-full` class
        // resolves to `flex-basis: 100%` (width becomes the flex-basis
        // whenever flex-basis itself is left at its default `auto`), and
        // `lg:flex-shrink-0` then refused to let it shrink back down, so it
        // claimed the entire row and crushed the Feed sibling to its
        // min-content width, positioned via `mx-auto` centering an
        // oversized inner element inside that crushed sliver - which is
        // what actually produced the "Sidebar overlap" look (Feed's content
        // was being centered relative to a near-zero-width box, pushing it
        // far enough left to visually sit under the Sidebar). Grid template
        // columns don't have that width-vs-flex-basis ambiguity: each
        // column's size comes from the track definition, not from a class
        // on the item competing with the container's own sizing algorithm.
        // `minmax(0,1fr)` (not bare `1fr`) lets the Feed track shrink below
        // its content's min-content size instead of overflowing when the
        // two columns don't both fit. The Details track is sourced from a
        // CSS custom property (not `auto`) - `auto` sizes to the *content's*
        // max-content width, which turned out to come from UserDetails'
        // own inner Gallery/Friends grid rather than PROFILE_COLUMN_WIDTH
        // (measured a constant ~361px regardless of viewport, ignoring the
        // intended fluid growth entirely). An explicit track size removes
        // that content-dependent guessing. Details stays first in DOM
        // (reading order: who this is, then their feed) via
        // `col-start-2`/`col-start-1` placing it visually on the right
        // without reordering the DOM the way flex-row-reverse did.
        //
        // Threshold micro-pass: two-column mode activates at `2xl`
        // (compiled 1320px), not `lg` (960px). Measured in a real browser
        // across the project's actual compiled breakpoints (sm 540/md 720/
        // lg 960/xl 1140/2xl 1320): at lg the Feed column was only 221px
        // wide, 271px at 1024px, still just 362px at xl(1140) - a cramped,
        // technically-fits-but-doesn't-read-professionally PostCard width
        // in every case. At 2xl(1320) Feed starts at a healthy 504px and
        // only grows from there, so two-column mode never activates until
        // it can look intentional rather than merely fit. Below 2xl, the
        // single-column stack (Details cards, then Feed) is a fully
        // legitimate reflow, not a fallback to avoid.
        <div
            className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_var(--profile-detail-width)] gap-8 w-full items-start"
            style={{"--profile-detail-width": PROFILE_COLUMN_WIDTH}}
        >
            <div className="w-full min-w-0 2xl:col-start-2 2xl:row-start-1">
                <UserDetails otherUserId={userId}/>
            </div>
            <div className="w-full min-w-0 2xl:col-start-1 2xl:row-start-1">
                <Feed userId={userId} className="pointer-events-auto"/>
            </div>
        </div>
    );
}

export default Profile;
