// Jest setup file for additional configuration
import '@testing-library/jest-dom';

// Mock import.meta for Vite compatibility
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
        VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'test-key',
      },
    },
  },
});

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver (typed)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(_: IntersectionObserverCallback, __?: IntersectionObserverInit) {}
  disconnect(): void {}
  observe(_: Element): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve(_: Element): void {}
}
(global as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver (typed)
class MockResizeObserver implements ResizeObserver {
  constructor(_: ResizeObserverCallback) {}
  disconnect(): void {}
  observe(_: Element, __?: ResizeObserverOptions): void {}
  unobserve(_: Element): void {}
}
(global as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;