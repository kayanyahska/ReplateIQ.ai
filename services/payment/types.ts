
export interface PaymentResult {
    success: boolean;
    sessionId?: string;
    error?: string;
}

export interface PaymentProvider {
    /**
     * Initiates the Checkout flow.
     * @param priceId The Stripe Price ID (e.g., price_123xyz)
     * @param userId The User's ID to metadata
     */
    initiateCheckout(priceId: string, userId: string): Promise<PaymentResult>;
}
