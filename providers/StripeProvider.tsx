import { ReactNode } from 'react';
import { StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

interface Props {
  children: ReactNode;
}

export function StripeProvider({ children }: Props) {
  return (
    <NativeStripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.kourt.app"
    >
      <>{children}</>
    </NativeStripeProvider>
  );
}
