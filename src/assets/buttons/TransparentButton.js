import React from 'react';
import styled from 'styled-components';

const TransparentButton = ({text,fontSize}) => {
    return (
        <StyledWrapper fontSize={fontSize}>
            <button>
                <p>{text}</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    button {
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        cursor: pointer;
    }

    button {
        --primary-color: #111;
        --hovered-color: #c84747;
        position: relative;
        display: flex;
        font-weight: 600;
        font-size: ${props => props.fontSize || '14px'}
        gap: 0.5rem;
        align-items: center;
    }

    button p {
        margin: 0;
        position: relative;
        font-size: ${props => props.fontSize || '14px'}
        color: #131320;
    }

    button::after {
        position: absolute;
        content: "";
        width: 0;
        left: 0;
        bottom: -7px;
        background: black;
        height: 2px;
        transition: 0.3s ease-out;
    }

    button p::before {
        position: absolute;
        /*   box-sizing: border-box; */
        content: ${props => props.text || '14px'};
        width: 0%;
        inset: 0;
        color: #212127;
        overflow: hidden;
        transition: 0.3s ease-out;
    }

    button:hover::after {
        width: 100%;
    }

    button:hover p::before {
        width: 100%;
    }

    button:hover svg {
        transform: translateX(4px);
        color: #0f0f27;
    }

    button svg {
        color: #31314e;
        transition: 0.2s;
        position: relative;
        width: 15px;
        transition-delay: 0.2s;
    }`;

export default TransparentButton;
