
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function SejaPremiumCard() {
    return (
        <Pressable
            onPress={() => router.push('/subscription' as any)}
            className="mx-5 mb-6 overflow-hidden rounded-2xl"
        >
            <LinearGradient
                colors={['#0a0a0a', '#1a1a1a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5 flex-row items-center border border-neutral-800"
            >
                {/* Left Icon with Glow */}
                <View className="mr-4">
                    <View className="w-12 h-12 rounded-xl bg-amber-500/20 items-center justify-center border border-amber-500/30">
                        <MaterialIcons name="workspace-premium" size={24} color="#FBBF24" />
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-white font-bold text-lg mr-2">Kourt Premium</Text>
                        <View className="bg-amber-500 rounded px-1.5 py-0.5">
                            <Text className="text-[10px] font-bold text-black">PRO</Text>
                        </View>
                    </View>
                    <Text className="text-neutral-400 text-xs leading-5">
                        Desbloqueie estatísticas, ranking global e jogue sem taxas.
                    </Text>
                </View>

                {/* Right Arrow */}
                <View className="bg-neutral-800 p-2 rounded-full ml-2">
                    <MaterialIcons name="chevron-right" size={20} color="#FBBF24" />
                </View>
            </LinearGradient>
        </Pressable>
    );
}
