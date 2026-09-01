import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { fluid } from '../../components/layout/navFluid';

// Fidelity reconciliation (Navigation micro-pass): the design's Desktop
// Header shows a rounded-full search pill (bg canvas, Lucide `search`,
// "Search Faceboard" placeholder) - this was still the pre-migration custom
// SVG magnifier/rectangle shape, never touched by the token-only passes.
// Controlled-input contract unchanged: the caller (Search.js) still owns
// `value`, `onChange` is forwarded directly, `onKeyDown` still runs before
// the Enter/onSearch convenience behavior, and `...rest` still forwards
// combobox ARIA attributes straight onto the input.
const SearchInput = ({value, onChange, onKeyDown, onSearch, ...rest}) => {
    const handleKeyDown = (e) => {
        onKeyDown?.(e);
        if (e.key === 'Enter') {
            onSearch?.(value);
        }
    };

    return (
        <div className="flex items-center relative w-full h-full">
            <SearchIcon aria-hidden="true" size={14} strokeWidth={1.75} className="absolute left-3.5 text-dsNeutral-500 pointer-events-none z-[1]" />
            <input
                id="query"
                style={{ height: fluid(36, 42) }}
                className="w-full pl-9 pr-4 rounded-full border-0 bg-dsNeutral-canvas outline-none text-ds-body text-dsNeutral-900 transition placeholder:text-dsNeutral-500 focus:bg-white focus:ring-4 focus:ring-dsFocusRing"
                type="search"
                placeholder="Search Faceboard"
                name="searchbar"
                autoComplete="off"
                aria-label="Search"
                value={value ?? ''}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                {...rest}
            />
        </div>
    );
}

export default SearchInput;
