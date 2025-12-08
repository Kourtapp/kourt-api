
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { ArenaSchedule } from '@/types/database.types';

const DAYS_OF_WEEK = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Segunda-feira' },
    { id: 2, name: 'Terça-feira' },
    { id: 3, name: 'Quarta-feira' },
    { id: 4, name: 'Quinta-feira' },
    { id: 5, name: 'Sexta-feira' },
    { id: 6, name: 'Sábado' },
];

export default function ManageScheduleScreen() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<ArenaSchedule[]>([]);
    const [arenaId, setArenaId] = useState<string | null>(null);

    // Edit State
    const [editingDay, setEditingDay] = useState<number | null>(null);
    const [isClosed, setIsClosed] = useState(false);
    const [openTime, setOpenTime] = useState('08:00');
    const [closeTime, setCloseTime] = useState('22:00');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, [user]);

    const fetchSchedules = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Get Arena
            const { data: arena } = await supabase.from('arenas').select('id').eq('owner_id', user.id).single();
            if (!arena) {
                Alert.alert('Erro', 'Arena não encontrada.');
                router.back();
                return;
            }
            setArenaId(arena.id);

            // Get Schedules
            const { data: scheds } = await supabase
                .from('arena_schedules')
                .select('*')
                .eq('arena_id', arena.id)
                .is('specific_date', null); // Only fetching recurring weekly schedules for now

            if (scheds) {
                setSchedules(scheds);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getDaySchedule = (dayId: number) => {
        return schedules.find(s => s.day_of_week === dayId);
    };

    const openEditor = (dayId: number) => {
        const current = getDaySchedule(dayId);
        setEditingDay(dayId);
        setIsClosed(current?.is_closed ?? false);
        setOpenTime(current?.open_time?.slice(0, 5) ?? '08:00');
        setCloseTime(current?.close_time?.slice(0, 5) ?? '22:00');
    };

    const handleSave = async () => {
        if (!arenaId || editingDay === null) return;
        setSaving(true);

        try {
            const payload = {
                arena_id: arenaId,
                day_of_week: editingDay,
                is_closed: isClosed,
                open_time: openTime, // Postgres takes 'HH:MM' fine for TIME type usually
                close_time: closeTime,
                price_modifier: 1.0
            };

            const existing = getDaySchedule(editingDay);

            if (existing) {
                const { error } = await supabase
                    .from('arena_schedules')
                    .update(payload)
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('arena_schedules')
                    .insert(payload);
                if (error) throw error;
            }

            await fetchSchedules();
            setEditingDay(null);

        } catch (error: any) {
            Alert.alert('Erro ao salvar', error.message);
        } finally {
            setSaving(false);
        }
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
            <View className="bg-white px-5 py-4 flex-row items-center border-b border-neutral-100">
                <Pressable onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text className="text-xl font-bold">Agenda & Horários</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <Text className="text-neutral-500 mb-4 text-sm">
                    Defina os horários de funcionamento padrão da sua arena.
                </Text>

                <View className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {DAYS_OF_WEEK.map((day, index) => {
                        const schedule = getDaySchedule(day.id);
                        const isConfigured = !!schedule;
                        const closed = schedule?.is_closed;

                        return (
                            <Pressable
                                key={day.id}
                                onPress={() => openEditor(day.id)}
                                className={`p-4 flex-row items-center justify-between ${index < 6 ? 'border-b border-neutral-100' : ''} active:bg-neutral-50`}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className={`w-2 h-2 rounded-full ${isConfigured ? (closed ? 'bg-red-500' : 'bg-green-500') : 'bg-neutral-300'}`} />
                                    <Text className="font-bold text-base">{day.name}</Text>
                                </View>

                                <View className="flex-row items-center gap-2">
                                    {!isConfigured ? (
                                        <Text className="text-neutral-400 text-sm italic">Não configurado</Text>
                                    ) : closed ? (
                                        <Text className="text-red-500 text-sm font-semibold">FECHADO</Text>
                                    ) : (
                                        <Text className="text-neutral-700 font-semibold">
                                            {schedule?.open_time?.slice(0, 5)} - {schedule?.close_time?.slice(0, 5)}
                                        </Text>
                                    )}
                                    <MaterialIcons name="chevron-right" size={20} color="#D4D4D4" />
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Modal Editor */}
            <Modal visible={editingDay !== null} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">
                                {editingDay !== null ? DAYS_OF_WEEK[editingDay].name : ''}
                            </Text>
                            <Pressable onPress={() => setEditingDay(null)}>
                                <MaterialIcons name="close" size={24} color="#000" />
                            </Pressable>
                        </View>

                        {/* Open/Closed Toggle */}
                        <Pressable
                            onPress={() => setIsClosed(!isClosed)}
                            className={`flex-row items-center justify-between p-4 rounded-xl border mb-6 ${isClosed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                        >
                            <Text className={`font-bold ${isClosed ? 'text-red-700' : 'text-green-700'}`}>
                                {isClosed ? 'ARENA FECHADA' : 'ARENA ABERTA'}
                            </Text>
                            <View className={`w-6 h-6 rounded-full border items-center justify-center ${isClosed ? 'bg-red-500 border-red-500' : 'bg-white border-green-500'}`}>
                                {isClosed && <MaterialIcons name="check" size={16} color="#fff" />}
                            </View>
                        </Pressable>

                        {!isClosed && (
                            <View className="flex-row gap-4 mb-8">
                                <View className="flex-1">
                                    <Text className="text-neutral-500 text-xs font-bold uppercase mb-2">Abertura</Text>
                                    <TextInput
                                        className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center text-xl font-bold"
                                        value={openTime}
                                        onChangeText={setOpenTime}
                                        placeholder="08:00"
                                        keyboardType="numbers-and-punctuation"
                                        maxLength={5}
                                    />
                                </View>
                                <View className="items-center justify-center pt-6">
                                    <Text className="text-neutral-400">-</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-neutral-500 text-xs font-bold uppercase mb-2">Fechamento</Text>
                                    <TextInput
                                        className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center text-xl font-bold"
                                        value={closeTime}
                                        onChangeText={setCloseTime}
                                        placeholder="22:00"
                                        keyboardType="numbers-and-punctuation"
                                        maxLength={5}
                                    />
                                </View>
                            </View>
                        )}

                        <Pressable
                            onPress={handleSave}
                            disabled={saving}
                            className="w-full bg-black py-4 rounded-xl items-center"
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Salvar Horário</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
