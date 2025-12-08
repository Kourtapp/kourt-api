
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Tournament {
    id: string;
    title: string;
    sport: string;
    start_date: string;
    status: 'open' | 'ongoing' | 'finished';
    max_participants: number;
    entry_fee: number;
}

export default function TournamentListScreen() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchTournaments();
        }, [])
    );

    const fetchTournaments = async () => {
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .order('start_date', { ascending: true });

            if (data) setTournaments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        open: 'bg-green-100 text-green-700',
        ongoing: 'bg-amber-100 text-amber-700',
        finished: 'bg-neutral-100 text-neutral-500',
    };

    const statusLabels = {
        open: 'Inscrições Abertas',
        ongoing: 'Em Andamento',
        finished: 'Finalizado',
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-neutral-100">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text className="text-xl font-bold">Torneios</Text>
                </View>
                <Pressable
                    onPress={() => router.push('/tournaments/create' as any)}
                    className="bg-black px-4 py-2 rounded-full flex-row items-center"
                >
                    <MaterialIcons name="add" size={18} color="#fff" />
                    <Text className="text-white font-bold ml-1 text-xs uppercase">Criar</Text>
                </Pressable>
            </View>

            <ScrollView className="flex-1 p-5">
                {/* Banner */}
                <View className="bg-blue-600 rounded-2xl p-6 mb-6 relative overflow-hidden">
                    <View className="relative z-10">
                        <Text className="text-white/80 font-bold uppercase text-xs mb-1">Kourt Series</Text>
                        <Text className="text-white text-2xl font-black mb-2">Prove que você é{"\n"}o melhor.</Text>
                        <Pressable className="bg-white px-4 py-2 rounded-lg self-start">
                            <Text className="font-bold text-blue-900">Saiba mais</Text>
                        </Pressable>
                    </View>
                    <MaterialIcons name="emoji-events" size={120} color="white" style={{ opacity: 0.1, position: 'absolute', right: -20, bottom: -20 }} />
                </View>

                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : tournaments.length === 0 ? (
                    <View className="items-center py-10">
                        <Text className="text-neutral-400 text-center mb-4">Nenhum torneio encontrado.</Text>
                        <Text className="text-neutral-400 text-center text-xs">Crie o primeiro torneio da sua região!</Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {tournaments.map((t) => (
                            <Pressable
                                key={t.id}
                                onPress={() => router.push({ pathname: '/tournaments/[id]', params: { id: t.id } } as any)}
                                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm active:bg-neutral-50"
                            >
                                {/* Status Bar */}
                                <View className={`px-4 py-2 flex-row justify-between items-center bg-neutral-50 border-b border-neutral-100`}>
                                    <Text className="text-xs font-bold text-neutral-500 uppercase">{t.sport}</Text>
                                    <View className={`px-2 py-0.5 rounded ${statusColors[t.status].split(' ')[0]}`}>
                                        <Text className={`text-[10px] font-bold uppercase ${statusColors[t.status].split(' ')[1]}`}>
                                            {statusLabels[t.status]}
                                        </Text>
                                    </View>
                                </View>

                                <View className="p-4">
                                    <Text className="text-lg font-bold mb-1">{t.title}</Text>
                                    <Text className="text-neutral-500 text-sm mb-4">
                                        {format(new Date(t.start_date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                                    </Text>

                                    <View className="flex-row items-center justify-between border-t border-neutral-50 pt-3">
                                        <View className="flex-row items-center gap-1">
                                            <MaterialIcons name="people" size={16} color="#666" />
                                            <Text className="text-neutral-600 text-sm font-semibold">{t.max_participants} vagas</Text>
                                        </View>
                                        <View className="flex-row items-center gap-1">
                                            <MaterialIcons name="attach-money" size={16} color="#666" />
                                            <Text className="text-neutral-600 text-sm font-semibold">
                                                {t.entry_fee > 0 ? `R$ ${t.entry_fee}` : 'Grátis'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
