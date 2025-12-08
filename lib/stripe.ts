// Stripe publishable key
// In development, we use test keys; in production, use live keys
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Stripe API configuration
export const STRIPE_CONFIG = {
  merchantIdentifier: 'merchant.com.kourt.app',
  urlScheme: 'kourt',
};
