import { render, screen } from '@testing-library/react';

// This was previously CRA's unmodified default test (`renders learn react link`),
// which asserted text App.js never actually renders - it was never updated after
// the project was scaffolded, so it never verified anything about this app.
//
// Rendering the real <App/> here isn't a viable smoke test: App.js nests ~9
// context providers (UserProvider, LightboxProvider, SearchProvider,
// FriendshipProvider, NotificationProvider, MessageProvider, WebSocketProvider,
// StoryProvider, PostProvider) inside a live react-router-dom <Router>, each with
// its own network/localStorage/WebSocket side effects - exercising it meaningfully
// would require mocking most of the app rather than testing it. Page404 is the
// app's catch-all route (path="*" in App.js) and has no such dependencies beyond
// a single router hook, so it's used here as a stable, low-dependency smoke test
// that basic rendering in this environment still works, verified against real,
// user-facing content rather than an implementation detail.
//
// virtual:true is required alongside the mock: react-router-dom@7's package.json
// "main" points at a file absent from the installed version, which the
// exports-map-blind Jest 27 resolver (bundled with this project's react-scripts@5)
// can't work around - see the same workaround in src/pages/chat/__tests__/ChatMessageRendering.test.js.
jest.mock("react-router-dom", () => ({
    useNavigate: () => jest.fn(),
}), { virtual: true });

const Page404 = require("./pages/Page404").default;

test("renders the app's catch-all not-found page with its real, user-facing content", () => {
    render(<Page404 />);

    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
});
