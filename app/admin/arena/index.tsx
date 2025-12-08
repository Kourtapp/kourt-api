
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

interface Arena {
    id: string;
    name: string;
    owner_id: string;
    cover_photo_url: string | null;
}

export default function ArenaDashboardScreen() {
    const { user } = useAuthStore();
    const [arena, setArena] = useState<Arena | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArena();
    }, [user]);

    const fetchArena = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('arenas')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (data) {
                setArena(data);
            }
        } catch (error) {
            console.log('Error fetching arena:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        {
            label: 'Gerenciar Quadras',
            subtitle: 'Adicionar ou editar quadras',
            icon: 'sports-tennis',
            route: '/admin/arena/courts'
        },
        {
            label: 'Agenda e Bloqueios',
            subtitle: 'Gerenciar horários disponíveis',
            icon: 'event',
            route: '/admin/arena/schedule'
        },
        {
            label: 'Reservas',
            subtitle: 'Ver histórico e confirmar',
            icon: 'list-alt',
            route: '/admin/arena/bookings'
        },
        {
            label: 'Financeiro',
            subtitle: 'Relatórios de ganhos',
            icon: 'attach-money',
            route: '/admin/arena/finance'
        },
    ];

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!arena) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text className="text-xl font-bold">Arena Manager</Text>
                </View>

                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-6">
                        <MaterialIcons name="stadium" size={40} color="#000" />
                    </View>
                    <Text className="text-2xl font-bold text-center mb-2">Cadastre sua Arena</Text>
                    <Text className="text-neutral-500 text-center mb-8">
                        Gerencie reservas, quadras e ganhe visibilidade para seu negócio.
                    </Text>
                    <Pressable
                        className="w-full bg-black py-4 rounded-xl items-center"
                        onPress={() => router.push('/admin/arena/create' as any)}
                    >
                        <Text className="text-white font-bold text-lg">Criar Arena</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-neutral-100">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <View>
                        <Text className="text-lg font-bold">{arena.name}</Text>
                        <Text className="text-xs text-green-600">● Online</Text>
                    </View>
                </View>
                <Pressable className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                    <MaterialIcons name="settings" size={20} color="#000" />
                </Pressable>
            </View>

            <ScrollView className="flex-1 p-5">
                {/* Quick Stats */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                        <Text className="text-neutral-500 text-xs mb-1">Reservas Hoje</Text>
                        <Text className="text-2xl font-bold">12</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                        <Text className="text-neutral-500 text-xs mb-1">Faturamento Hoje</Text>
                        <Text className="text-2xl font-bold text-green-600">R$ 840</Text>
                    </View>
                </View>

                {/* Menu Grid */}
                <Text className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-wider">Gestão</Text>
                <View className="gap-3 mb-8">
                    {menuItems.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => router.push(item.route as any)}
                            className="bg-white p-4 rounded-xl flex-row items-center border border-neutral-100 active:bg-neutral-50"
                        >
                            <View className="w-12 h-12 bg-neutral-50 rounded-lg items-center justify-center mr-4">
                                <MaterialIcons name={item.icon as any} size={24} color="#000" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-base">{item.label}</Text>
                                <Text className="text-neutral-400 text-sm">{item.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
                        </Pressable>
                    ))}
                </View>

                {/* Recent Activity */}
                <Text className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-wider">Atividade Recente</Text>
                <View className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                    {[1, 2, 3].map((_, i) => (
                        <View key={i} className={`p-4 flex-row items-center justify-between ${i < 2 ? 'border-b border-neutral-100' : ''}`}>
                            <View>
                                <Text className="font-semibold">Reserva #2839</Text>
                                <Text className="text-xs text-neutral-500">Quadra 1 · 18:00 - 19:00</Text>
                            </View>
                            <View className="bg-green-100 px-2 py-1 rounded">
                                <Text className="text-xs font-bold text-green-700">Confirmado</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
