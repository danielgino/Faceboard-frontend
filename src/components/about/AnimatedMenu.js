import React from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

export default function FlowingMenu({ items = [], className = "" }) {
    return (
        <div className={`w-full h-full overflow-hidden ${className}`}>
            <nav className="flex flex-col h-full m-0 p-0">
                {items.map((item, idx) => (
                    <MenuItem key={idx} {...item} />
                ))}
            </nav>
        </div>
    );
}

function MenuItem({ link, route, onClick, text, image }) {
    const itemRef = React.useRef(null);
    const marqueeRef = React.useRef(null);
    const marqueeInnerRef = React.useRef(null);

    const animationDefaults = { duration: 0.6, ease: 'expo' };

    const findClosestEdge = (mouseX, mouseY, width, height) => {
        const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
        const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
        return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
    };

    const runEnter = (edge) => {
        gsap.timeline({ defaults: animationDefaults })
            .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
            .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
            .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
    };

    const runLeave = (edge) => {
        gsap.timeline({ defaults: animationDefaults })
            .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
            .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' });
    };

    const handleMouseEnter = (ev) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
        runEnter(edge);
    };

    const handleMouseLeave = (ev) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
        runLeave(edge);
    };

    const handlePress = (ev) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        if (route || onClick || link) return;
        const isOpen = getComputedStyle(marqueeRef.current).transform.includes('matrix(1, 0, 0, 1, 0, 0)');
        if (isOpen) runLeave('bottom'); else runEnter('top');
    };

    const repeatedMarqueeContent = Array.from({ length: 4 }).map((_, idx) => (
        <React.Fragment key={idx}>
      <span className="uppercase font-medium leading-[1.2] px-2 text-base sm:text-lg md:text-2xl text-[#060010]">
        {text}
      </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 my-4 mx-4 rounded-md bg-contain bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${image})` }}
            />
        </React.Fragment>
    ));

    const isExternal = link && /^https?:\/\//i.test(link);
    const Clickable = route ? Link : onClick ? 'button' : 'a';
    const clickableProps = route
        ? { to: route }
        : onClick
            ? { type: 'button', onClick }
            : { href: link || '#', ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}) };

    return (
        <div
            ref={itemRef}
            className="
        relative overflow-hidden text-center border-t border-white/20
        h-12 sm:h-14 md:h-16 lg:h-20
      "
        >
            <Clickable
                {...clickableProps}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onPointerUp={handlePress}
                className="
          flex items-center justify-center h-full relative cursor-pointer uppercase
          no-underline font-semibold text-white
          text-lg sm:text-xl md:text-2xl lg:text-3xl
          hover:text-[#060010] focus:text-white focus-visible:text-[#060010]
        "
                aria-label={text}
            >
                {text}
            </Clickable>

            <div
                ref={marqueeRef}
                className="
          absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-white
          translate-y-[101%]
        "
            >
                <div ref={marqueeInnerRef} className="h-full w-[200%] flex">
                    <div className="flex items-center relative h-full w-[200%] will-change-transform animate-marquee">
                        {repeatedMarqueeContent}
                    </div>
                </div>
            </div>
        </div>
    );
}
