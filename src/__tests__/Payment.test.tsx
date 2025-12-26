import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePayment } from '../../hooks/usePayment';

// 1. Mock the Auth Context
const mockUpgradeTier = vi.fn();
const mockUser = { id: 'test-user', subscriptionTier: 'free' };

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        upgradeTier: mockUpgradeTier,
    }),
}));

// 2. Mock Config
vi.mock('../../services/subscriptionConfig', () => ({
    SUBSCRIPTION_CONFIG: {
        FEES: { LIFETIME_ACCESS: 5 },
        pro: { price: 10, name: 'Pro' },
    },
}));

// 3. Mock Payment Service
vi.mock('../../services/payment', () => ({
    getPaymentProvider: vi.fn(),
}));

describe('usePayment Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default to Mock Mode
        vi.stubEnv('VITE_USE_REAL_PAYMENTS', 'false');
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => usePayment());
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.showMockModal).toBe(false);
    });

    it('should trigger Mock Mode when VITE_USE_REAL_PAYMENTS is false', async () => {
        const { result } = renderHook(() => usePayment());

        await act(async () => {
            await result.current.initiateCheckout('price_123', 'pro');
        });

        // Check if Mock Modal state is engaged
        expect(result.current.showMockModal).toBe(true);
        expect(result.current.mockDetails.tier).toBe('pro');
        expect(result.current.mockDetails.price).toBe(10);
    });

    it('should call upgradeTier when Mock Payment succeeds', async () => {
        const { result } = renderHook(() => usePayment());

        // Setup state first
        await act(async () => {
            await result.current.initiateCheckout('price_123', 'pro');
        });

        // Simulate Success
        await act(async () => {
            await result.current.handleMockSuccess();
        });

        expect(mockUpgradeTier).toHaveBeenCalledWith('pro');
        expect(result.current.showMockModal).toBe(false);
    });
});
