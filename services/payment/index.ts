import { MockProvider } from './MockProvider';
import { StripeProvider } from './StripeProvider';
import { PaymentProvider } from './types';

const USE_REAL_PAYMENTS = import.meta.env.VITE_USE_REAL_PAYMENTS === 'true';

export const getPaymentProvider = (): PaymentProvider => {
    if (USE_REAL_PAYMENTS) {
        return StripeProvider;
    }
    return MockProvider;
};
