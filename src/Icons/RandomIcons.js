import React from "react";
import {Pencil, X, MessageSquare, Share2, ImageIcon, Smile, MoreHorizontal, Trash2} from "lucide-react";

// Fidelity reconciliation: every glyph below now matches the exact Lucide
// icon named in the Claude Design System's iconGroups (Actions: heart,
// message-square, share-2, more-horizontal, pencil, trash-2, send, smile,
// camera) instead of the hand-drawn custom SVGs this file used before.
// Interactive wrapping (button/onClick) is now owned by each consumer
// (Post.js, Comment.js, AddPost.js, EmojiLibrary.js) rather than baked in
// here, matching the design's own flat icon+label composition and
// removing the previous hover-reveal tooltip bubbles that weren't part of
// the design.
const RandomIcons = {
        // Presentational only - consumers own the interactive wrapper
        // (button/label) so this can't create a nested/redundant tab stop.
        Edit: ({className = "size-6", stroke = "currentColor"}) => (
            <Pencil className={className} stroke={stroke} strokeWidth={1.75}/>
        ),
        Delete: ({className = "size-6", stroke = "currentColor"}) => (
            <X className={className} stroke={stroke} strokeWidth={1.75}/>
        ),

        // Presentational only - Post.js owns the interactive wrapper
        // (button/onClick), matching how Comment is exported below.
        Share: ({className = "w-[18px] h-[18px]"}) => (
            <Share2 className={className} strokeWidth={1.75}/>
        ),

        Comment: ({className = "w-[18px] h-[18px]"}) => (
            <MessageSquare className={className} strokeWidth={1.75}/>
        ),

        // Presentational only - AddPost.js's own label already owns the
        // role="button"/tabIndex/onClick/onKeyDown for file-input activation;
        // wrapping this in its own button/IconButton created a second, dead
        // tab stop nested inside that label.
        PhotoIcon : ({className = "h-5 w-5"})=>(
            <ImageIcon className={className} strokeWidth={1.75}/>
        ),

        EmojiIcon: ({onClick})=>(
            <button type="button" onClick={onClick} className="rounded-full p-2 hover:bg-dsNeutral-100 transition" aria-label="Add emoji">
                <Smile className="h-5 w-5" strokeWidth={1.75}/>
            </button>
        ),
        MoreIcon: ({className = "size-6"})=> (
            <MoreHorizontal className={className} strokeWidth={1.75}/>
        ),
        TrashIcon: ({ className = "" })=> (
            <Trash2 className={className} strokeWidth={1.75}/>
        ),
    }
;

export default RandomIcons;
