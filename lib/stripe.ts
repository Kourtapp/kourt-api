// Stripe publishable key
// In development, we use test keys; in production, use live keys
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Stripe API configuration
export const STRIPE_CONFIG = {
  merchantIdentifier: 'merchant.com.kourt.app',
  urlScheme: 'kourt',
};

import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

// Stripe service for payment operations
export const stripeService = {
  // Create a PaymentIntent via Supabase Edge Function
  async createPaymentIntent({
    amount,
    bookingId,
  }: {
    amount: number;
    bookingId: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount, currency: 'brl', bookingId },
    });

    if (error || !data?.clientSecret) {
      console.error('Error creating payment intent:', error);
      throw new Error(error?.message || 'Failed to create payment intent');
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.id,
    };
  },

  // Handle payment failure - update booking status
  async handlePaymentFailure(bookingId: string, errorMessage: string): Promise<void> {
    console.error(`Payment failed for booking ${bookingId}:`, errorMessage);

    // Update booking status to payment_failed
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'payment_failed' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking status:', error);
    }

    Alert.alert('Pagamento falhou', errorMessage);
  },

  // Confirm payment success - update booking status
  async confirmPaymentSuccess(bookingId: string, paymentIntentId: string): Promise<void> {
    console.log(`Payment succeeded for booking ${bookingId}, intent: ${paymentIntentId}`);

    // Update booking with payment info
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to confirm payment');
    }
  },
};
