import { Ghost } from "lucide-react";
import { motion } from "framer-motion";

// Design System (#feedback) EmptyState: ghost icon, muted, compact - kept
// the same Ghost glyph (already an exact match from an earlier phase) but
// corrected the surrounding surface, which had ballooned to p-32 (128px)
// padding and a 64px icon, well past what the design's compact proportions
// (24px padding, 26px icon) scale to even for a full-width feed placement.
export default function NoPostsYet({title,text}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center"
        >
            <div className="w-full max-w-2xl px-6 py-14 bg-white border border-dsNeutral-100 rounded-ds-lg shadow-ds-low flex flex-col items-center gap-3">
                <Ghost className="w-8 h-8 text-dsNeutral-200" strokeWidth={1.75} />
                <p className="text-ds-card-title text-dsNeutral-900">{title}</p>
                <p className="text-ds-body text-dsNeutral-500">{text}</p>
            </div>
        </motion.div>
    );
}
