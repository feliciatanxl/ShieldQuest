import '@testing-library/jest-dom';

// JSDOM mock for window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});
