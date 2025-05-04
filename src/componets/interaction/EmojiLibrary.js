import {useState} from "react";
import EmojiPicker from "emoji-picker-react";
import RandomIcons from "../../Icons/RandomIcons";


function EmojiLibrary({onEmojiClick}){
    const [showEmoji,setShowEmoji]=useState(false)
    return(
        <div>
            <RandomIcons.EmojiIcon onClick={()=>setShowEmoji(prev=>!prev)}/>
            {showEmoji && (
                <div className="absolute z-10 mt-2">
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