import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

// Mocking IntersectionObserver which is often used by UI libraries but missing in jsdom
const IntersectionObserverMock = function () {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };
};

window.IntersectionObserver = IntersectionObserverMock as any;
