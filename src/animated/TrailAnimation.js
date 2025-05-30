import React, { useState } from 'react'
import { useTrail, a } from '@react-spring/web'
import styles from './TrailAnimation.module.css'
import {WEBSITE_NAME} from "../utils/Utils";

const Trail = ({ open, children }) => {
    const items = React.Children.toArray(children)
    const trail = useTrail(items.length, {
        config: { mass: 5, tension: 2000, friction: 200 },
        opacity: open ? 1 : 0,
        x: open ? 0 : 20,
        height: open ? 110 : 0,
        from: { opacity: 0, x: 20, height: 0 },
    })

    return (
        <div>
            {trail.map(({ height, ...style }, index) => (
                <a.div key={index} className={styles.trailsText} style={style}>
                    <a.div style={{ height }}>{items[index]}</a.div>
                </a.div>
            ))}
        </div>
    )
}

const TrailAnimation = () => {
    const [open, set] = useState(true)

    return (
        <div className={styles.container} onClick={() => set(state => !state)}>
            <Trail open={open}>
                <span>{WEBSITE_NAME}</span>
                <span>You did</span>
                <span>The Right</span>
                <span>Choice..</span>
            </Trail>
        </div>
    )
}

export default TrailAnimation
