import React from 'react';
import styled from 'styled-components';

const StyleButton = ({onClick,text}) => {
    return (
        <StyledWrapper>
            <div>
                <button onClick={onClick} className="animated-button">
                    <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                    </svg>
                    <span className="text">{text} </span>
                    <span className="circle" />
                    <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                    </svg>
                </button>
                <br /><br />
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    height: 100%;

    .animated-button {
        height: 95%;

        position: relative;
        display: flex;
        align-items: center;
        gap: 4px;

        padding: 6px 25px;
        border: 4px solid;
        border-color: transparent;
        font-size: 14px;
        background-color: #f2f6fa;
        border-radius: 70px;
        font-weight: 600;
        color: rgb(1, 18, 18);
        box-shadow: 0 0 0 2px rgb(0, 0, 0);
        cursor: pointer;
        overflow: hidden;
        transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .animated-button svg {
        position: absolute;
        width: 24px;
        fill: rgb(0, 0, 0);
        z-index: 9;
        transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .animated-button .arr-1 {
        right: 12px;
    }

    .animated-button .arr-2 {
        left: -25%;
    }

    .animated-button .circle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background-color: rgb(140, 149, 151);
        border-radius: 50%;
        opacity: 0;
        transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .animated-button .text {
        position: relative;
        z-index: 1;
        transform: translateX(-12px);
        transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .animated-button:hover {
        box-shadow: 0 0 0 12px transparent;
        color: #212121;
        border-radius: 50px;
    }

    .animated-button:hover .arr-1 {
        right: -25%;
    }

    .animated-button:hover .arr-2 {
        left: 16px;
    }

    .animated-button:hover .text {
        transform: translateX(12px);
    }

    .animated-button:hover svg {
        fill: #212121;
    }

    .animated-button:active {
        scale: 0.95;
        box-shadow: 0 0 0 4px #676753;
    }

    .animated-button:hover .circle {
        width: 220px;
        height: 220px;
        opacity: 1;
    }`;

export default StyleButton;
