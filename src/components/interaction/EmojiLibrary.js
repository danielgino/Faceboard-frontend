import {useState} from "react";
import EmojiPicker from "emoji-picker-react";
import RandomIcons from "../../Icons/RandomIcons";


function EmojiLibrary({onEmojiClick, icon: Icon, triggerClassName, triggerLabel = "Choose emoji"}){
    const [showEmoji,setShowEmoji]=useState(false)

    const handleToggle = () => setShowEmoji(prev => !prev);

    return(
        <div
            className="relative"
            onKeyDown={(e) => { if (e.key === "Escape") setShowEmoji(false); }}
        >
            {Icon ? (
                <button
                    type="button"
                    onClick={handleToggle}
                    className={triggerClassName}
                    aria-label={triggerLabel}
                    aria-haspopup="dialog"
                    aria-expanded={showEmoji}
                >
                    <Icon size={20}/>
                </button>
            ) : (
                <RandomIcons.EmojiIcon onClick={handleToggle}/>
            )}
            {showEmoji && (
                <div className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
                    <EmojiPicker
                        onEmojiClick={(emoji)=>{
                        if (onEmojiClick){
                        onEmojiClick(emoji)
                        }
                        setShowEmoji(false)
                        }}/>
                </div>
            )}
        </div>

    )
}

export default EmojiLibrary
