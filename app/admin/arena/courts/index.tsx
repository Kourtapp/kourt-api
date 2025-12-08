
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Court, Arena } from '@/types/database.types';

export default function ManageCourtsScreen() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [courts, setCourts] = useState<Court[]>([]);
    const [arena, setArena] = useState<Arena | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // 1. Get Arena
            const { data: arenaData } = await supabase
                .from('arenas')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (!arenaData) {
                Alert.alert('Erro', 'Arena não encontrada.');
                router.back();
                return;
            }
            setArena(arenaData);

            // 2. Get Courts for this Arena (or owned by user previously)
            // We look for courts with arena_id OR owner_id as fallback for legacy
            const { data: courtsData, error } = await supabase
                .from('courts')
                .select('*')
                .or(`arena_id.eq.${arenaData.id}, owner_id.eq.${user.id}`)
                .order('name');

            if (courtsData) setCourts(courtsData);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Excluir Quadra', 'Tem certeza? Isso não pode ser desfeito.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.from('courts').delete().eq('id', id);
                    if (!error) fetchData();
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
            <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-neutral-100">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text className="text-xl font-bold">Quadras</Text>
                </View>
                <Pressable
                    onPress={() => router.push('/admin/arena/courts/create' as any)}
                    className="w-10 h-10 bg-black rounded-lg items-center justify-center"
                >
                    <MaterialIcons name="add" size={24} color="#fff" />
                </Pressable>
            </View>

            <ScrollView className="flex-1 p-5">
                {courts.length === 0 ? (
                    <View className="items-center py-10">
                        <Text className="text-neutral-400 text-center mb-4">Nenhuma quadra cadastrada.</Text>
                        <Pressable onPress={() => router.push('/admin/arena/courts/create' as any)}>
                            <Text className="text-blue-600 font-bold">Cadastrar primeira quadra</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="gap-4">
                        {courts.map((court) => (
                            <View key={court.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex-row justify-between items-center shadow-sm">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 bg-neutral-100 rounded-lg mr-3 items-center justify-center overflow-hidden">
                                        {court.images && court.images[0] ? (
                                            <Image source={{ uri: court.images[0] }} className="w-full h-full" />
                                        ) : (
                                            <MaterialIcons name="sports-tennis" size={24} color="#9ca3af" />
                                        )}
                                    </View>
                                    <View>
                                        <Text className="font-bold text-base">{court.name}</Text>
                                        <Text className="text-neutral-500 text-xs uppercase">{court.sport} · {court.type}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-2">
                                    <Pressable
                                        className="p-2"
                                        onPress={() => router.push({ pathname: '/admin/arena/courts/create', params: { id: court.id } } as any)}
                                    >
                                        <MaterialIcons name="edit" size={20} color="#666" />
                                    </Pressable>
                                    <Pressable
                                        className="p-2"
                                        onPress={() => handleDelete(court.id)}
                                    >
                                        <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
