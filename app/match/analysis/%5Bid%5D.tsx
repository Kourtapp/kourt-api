import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function MatchAnalysisScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate AI processing time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#84CC16" />
                <Text className="text-white mt-4 font-bold text-lg">Processando vídeo...</Text>
                <Text className="text-neutral-400 mt-2 text-sm">Analisando movimentos e jogadas</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 py-4 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.replace('/(tabs)')}
                        className="w-10 h-10 bg-neutral-800 rounded-full items-center justify-center"
                    >
                        <MaterialIcons name="close" size={24} color="#fff" />
                    </Pressable>
                    <Text className="text-white font-bold text-lg">Análise da Partida</Text>
                    <Pressable className="w-10 h-10 bg-neutral-800 rounded-full items-center justify-center">
                        <MaterialIcons name="share" size={20} color="#fff" />
                    </Pressable>
                </View>

                {/* Video Preview (Mock) */}
                <View className="w-full h-56 bg-black relative mb-6">
                    <View className="absolute inset-0 items-center justify-center">
                        <MaterialIcons name="play-circle-outline" size={64} color="rgba(255,255,255,0.8)" />
                    </View>
                    <View className="absolute bottom-4 left-4 bg-lime-500 px-2 py-1 rounded">
                        <Text className="text-black text-xs font-bold">HIGHLIGHTS IA</Text>
                    </View>
                </View>

                {/* Key Metrics */}
                <View className="px-5 mb-8">
                    <Text className="text-white font-bold text-xl mb-4">Métricas Principais</Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                            <MaterialIcons name="speed" size={24} color="#84CC16" />
                            <Text className="text-neutral-400 text-xs mt-2">Velocidade Máx.</Text>
                            <Text className="text-white text-2xl font-bold">108 <Text className="text-sm font-normal">km/h</Text></Text>
                        </View>
                        <View className="flex-1 bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                            <MaterialIcons name="directions-run" size={24} color="#3B82F6" />
                            <Text className="text-neutral-400 text-xs mt-2">Distância</Text>
                            <Text className="text-white text-2xl font-bold">2.4 <Text className="text-sm font-normal">km</Text></Text>
                        </View>
                        <View className="flex-1 bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                            <MaterialIcons name="local-fire-department" size={24} color="#F59E0B" />
                            <Text className="text-neutral-400 text-xs mt-2">Calorias</Text>
                            <Text className="text-white text-2xl font-bold">450</Text>
                        </View>
                    </View>
                </View>

                {/* Heatmap Section */}
                <View className="px-5 mb-8">
                    <Text className="text-white font-bold text-xl mb-4">Mapa de Calor</Text>
                    <View className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700 items-center">
                        {/* Mock Court Representation */}
                        <View className="w-full h-48 bg-neutral-700 rounded-xl relative overflow-hidden">
                            {/* Court Lines */}
                            <View className="absolute inset-x-8 inset-y-4 border-2 border-white/20" />
                            <View className="absolute top-1/2 left-8 right-8 h-0.5 bg-white/20" />

                            {/* Heat Spots (Simulated) */}
                            <LinearGradient
                                colors={['rgba(239, 68, 68, 0.6)', 'transparent']}
                                style={{ position: 'absolute', top: 40, left: 48, width: 80, height: 80, borderRadius: 40 }}
                            />
                            <LinearGradient
                                colors={['rgba(239, 68, 68, 0.4)', 'transparent']}
                                style={{ position: 'absolute', bottom: 48, right: 64, width: 96, height: 96, borderRadius: 48 }}
                            />
                        </View>
                        <View className="flex-row items-center gap-2 mt-4">
                            <View className="w-3 h-3 rounded-full bg-red-500" />
                            <Text className="text-neutral-400 text-xs">Alta atividade</Text>
                            <View className="w-3 h-3 rounded-full bg-neutral-600 ml-4" />
                            <Text className="text-neutral-400 text-xs">Baixa atividade</Text>
                        </View>
                    </View>
                </View>

                {/* AI Insights */}
                <View className="px-5 mb-8">
                    <Text className="text-white font-bold text-xl mb-4">Insights da IA</Text>
                    <View className="gap-3">
                        <View className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700 flex-row gap-4">
                            <View className="w-10 h-10 bg-lime-500/20 rounded-full items-center justify-center">
                                <MaterialIcons name="check" size={20} color="#84CC16" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold mb-1">Ótimo posicionamento</Text>
                                <Text className="text-neutral-400 text-sm">
                                    Você dominou o fundo da quadra em 70% do tempo, forçando erros do adversário.
                                </Text>
                            </View>
                        </View>
                        <View className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700 flex-row gap-4">
                            <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center">
                                <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold mb-1">Dica de melhoria</Text>
                                <Text className="text-neutral-400 text-sm">
                                    Tente antecipar mais as bolas curtas. Sua velocidade de reação caiu no 2º set.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}
