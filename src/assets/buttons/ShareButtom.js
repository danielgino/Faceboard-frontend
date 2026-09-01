import React from 'react';
import { Button } from "../../components/common/Button";

// Fidelity reconciliation: the Design System's composer publish control is
// a plain primary button ("Post"), not an animated paper-plane button -
// per the explicit new instruction, visual animation is not business logic
// and is no longer preserved for its own sake. External prop contract
// (onClick, text, loading) is unchanged, so AddPost.js - the only
// consumer - needed no changes.
const ShareButton = ({ onClick, text, loading }) => (
    <Button onClick={onClick} loading={loading} className="px-6">
        {loading ? "Posting..." : text}
    </Button>
);

export default ShareButton;
