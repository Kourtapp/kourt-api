
import { supabase } from '@/lib/supabase';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

export const paymentService = {
    // Inicializa o PaymentSheet (UI de pagamento do Stripe)
    async initializePaymentSheet(amount: number, currency: string = 'brl') {
        // 1. Obter Client Secret do Backend (Supabase Function)
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
            body: { amount, currency },
        });

        if (error || !data?.clientSecret) {
            console.error('Erro ao obter client secret:', error);
            // Fallback para teste local SEM backend (apenas para validar UI se a função falhar)
            // Em produção, isso deve falhar.
            Alert.alert('Erro', 'Não foi possível iniciar o pagamento. Verifique se a Function está rodando.');
            return false;
        }

        const { clientSecret, customerId, ephemeralKey } = data;

        // 2. Inicializar o PaymentSheet no App
        const { error: sheetError } = await initPaymentSheet({
            merchantDisplayName: 'Kourt',
            customerId,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: clientSecret,
            // Configuração para testes
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: 'Kourt User',
            }
        });

        if (sheetError) {
            console.error('Erro ao inicializar PaymentSheet:', sheetError);
            return false;
        }

        return true;
    },

    // Abre o modal de pagamento
    async openPaymentSheet() {
        const { error } = await presentPaymentSheet();

        if (error) {
            if (error.code === 'Canceled') {
                // Usuário cancelou
                return { success: false, status: 'canceled' };
            }
            return { success: false, error: error.message };
        }

        return { success: true };
    }
};
