// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Several existing tests render via react-dom/client's createRoot directly
// (rather than @testing-library/react) and rely on this flag being set so
// React's act() environment detection doesn't warn on every render/unmount.
// Setting it once here (rather than per test file) is redundant with the
// couple of files that already set it themselves, but that's harmless -
// this just makes it consistent for every test file, including the ones
// that don't set it individually.
global.IS_REACT_ACT_ENVIRONMENT = true;
