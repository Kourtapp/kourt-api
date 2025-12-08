
import { useAuthStore } from '@/stores/authStore';

export function usePremium() {
    const { profile } = useAuthStore();

    const isPremium = profile?.subscription === 'premium' || profile?.subscription === 'pro';
    const isPro = profile?.subscription === 'pro';

    return {
        isPremium,
        isPro,
        tier: profile?.subscription || 'free',
    };
}
