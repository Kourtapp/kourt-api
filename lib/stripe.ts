import { Alert } from 'react-native';
import { supabase } from './supabase';

// Stripe publishable key (test mode)
// Replace with your actual Stripe publishable key
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface CreatePaymentParams {
  amount: number; // in cents
  currency?: string;
  bookingId: string;
  customerId?: string;
}

export const stripeService = {
  /**
   * Create a PaymentIntent via Supabase Edge Function
   */
  async createPaymentIntent(
    params: CreatePaymentParams,
  ): Promise<PaymentIntentResponse> {
    const { amount, currency = 'brl', bookingId, customerId } = params;

    try {
      const { data, error } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            amount,
            currency,
            bookingId,
            customerId,
          },
        },
      );

      if (error) {
        throw new Error(error.message || 'Failed to create payment intent');
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      throw new Error(err.message || 'Failed to create payment intent');
    }
  },

  /**
   * Confirm payment was successful and update booking status
   */
  async confirmPaymentSuccess(
    bookingId: string,
    paymentIntentId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_id: paymentIntentId,
          payment_method: 'card',
        })
        .eq('id', bookingId);

      if (error) {
        throw new Error('Failed to update booking status');
      }
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      throw err;
    }
  },

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(
    bookingId: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
        })
        .eq('id', bookingId);

      Alert.alert('Pagamento falhou', errorMessage);
    } catch (err) {
      console.error('Error handling payment failure:', err);
    }
  },

  /**
   * Request refund for a booking
   */
  async requestRefund(
    bookingId: string,
    paymentIntentId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('create-refund', {
        body: {
          paymentIntentId,
          bookingId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to process refund');
      }

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          status: 'cancelled',
        })
        .eq('id', bookingId);

      return true;
    } catch (err: any) {
      console.error('Error requesting refund:', err);
      Alert.alert('Erro', 'Não foi possível processar o reembolso');
      return false;
    }
  },
};
