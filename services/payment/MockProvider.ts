import { PaymentProvider, PaymentResult } from './types';

export const MockProvider: PaymentProvider = {
    async initiateCheckout(priceId: string, userId: string): Promise<PaymentResult> {
        console.log(`[Mock Payment] User ${userId} buying ${priceId}`);
        const confirmed = window.confirm(`[MOCK CHECKOUT]\n\nPrice ID: ${priceId}\n\nClick OK to simulate success.`);

        if (confirmed) {
            return { success: true, sessionId: 'mock_session_123' };
        }
        return { success: false, error: "User cancelled" };
    }
};
