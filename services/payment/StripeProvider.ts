import { loadStripe } from '@stripe/stripe-js';
import { PaymentProvider, PaymentResult } from './types';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Stripe lazily or only if key is present
const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = key ? loadStripe(key) : null;

export const StripeProvider: PaymentProvider = {
    async initiateCheckout(priceId: string, userId: string): Promise<PaymentResult> {
        if (!stripePromise) {
            console.error("Stripe Publishable Key is missing.");
            return { success: false, error: "Stripe configuration missing. Check VITE_STRIPE_PUBLISHABLE_KEY." };
        }

        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to initialize.");

        try {
            // 1. Call Backend to create session
            const functions = getFunctions();
            const createSession = httpsCallable(functions, 'createStripeCheckoutSession');

            const { data } = await createSession({ priceId, userId });
            const { sessionId } = data as { sessionId: string };

            // 2. Redirect to Stripe
            const { error } = await (stripe as any).redirectToCheckout({ sessionId });

            if (error) {
                return { success: false, error: error.message };
            }

            // This line is rarely reached as the browser redirects
            return { success: true };

        } catch (error: any) {
            console.error("Payment Error:", error);
            return { success: false, error: error.message || "Payment initiation failed" };
        }
    }
};
