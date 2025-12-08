
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Court } from '@/types/database.types';

export default function CreateCourtScreen() {
    const { id } = useLocalSearchParams(); // If ID exists, it's edit mode
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);

    const [formData, setFormData] = useState({
        name: '',
        sport: 'Beach Tennis',
        type: 'covered' as 'covered' | 'uncovered',
        price_per_hour: '0',
        description: '',
    });

    useEffect(() => {
        if (id) fetchCourt();
    }, [id]);

    const fetchCourt = async () => {
        const { data } = await supabase.from('courts').select('*').eq('id', id).single();
        if (data) {
            setFormData({
                name: data.name,
                sport: data.sport,
                type: data.is_indoor ? 'covered' : 'uncovered', // Mapper legacy field
                price_per_hour: data.price_per_hour?.toString() || '0',
                description: data.description || '',
            });
        }
        setInitialLoading(false);
    };

    const handleSave = async () => {
        if (!formData.name) return Alert.alert('Erro', 'Nome é obrigatório');
        if (!user) return;

        setLoading(true);
        try {
            // Get Arena ID first
            const { data: arena } = await supabase.from('arenas').select('id').eq('owner_id', user.id).single();
            if (!arena) throw new Error('Crie uma arena antes de adicionar quadras.');

            const payload = {
                name: formData.name,
                sport: formData.sport,
                is_indoor: formData.type === 'covered',
                price_per_hour: parseFloat(formData.price_per_hour),
                description: formData.description,
                arena_id: arena.id,
                owner_id: user.id, // Keep legacy support
                type: 'private', // Default for SaaS
                address: 'Arena Address', // should inherit from arena but required by constraint maybe?
                city: 'Unknown',
                country: 'Brasil'
            };

            if (id) {
                // Update
                const { error } = await supabase.from('courts').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase.from('courts').insert(payload);
                if (error) throw error;
            }

            router.back();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao salvar');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <View className="flex-1 bg-white" />;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="close" size={24} color="#000" />
                    </Pressable>
                    <Text className="text-xl font-bold">{id ? 'Editar Quadra' : 'Nova Quadra'}</Text>
                </View>
                <Pressable onPress={handleSave} disabled={loading}>
                    <Text className="text-blue-600 font-bold text-lg">Salvar</Text>
                </Pressable>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="mb-5">
                    <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Nome da Quadra</Text>
                    <TextInput
                        className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                        placeholder="Ex: Quadra 1 (Central)"
                        value={formData.name}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                    />
                </View>

                <View className="mb-5">
                    <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Esporte</Text>
                    <View className="flex-row gap-2">
                        {['Beach Tennis', 'Padel', 'Tênis'].map(sport => (
                            <Pressable
                                key={sport}
                                onPress={() => setFormData({ ...formData, sport })}
                                className={`px-4 py-2 rounded-full border ${formData.sport === sport ? 'bg-black border-black' : 'bg-white border-neutral-200'}`}
                            >
                                <Text className={formData.sport === sport ? 'text-white font-bold' : 'text-neutral-600'}>{sport}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View className="mb-5">
                    <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Cobertura</Text>
                    <View className="flex-row gap-4 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
                        <Pressable
                            onPress={() => setFormData({ ...formData, type: 'covered' })}
                            className={`flex-1 py-2 items-center rounded-lg ${formData.type === 'covered' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={formData.type === 'covered' ? 'font-bold' : 'text-neutral-500'}>Coberta</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setFormData({ ...formData, type: 'uncovered' })}
                            className={`flex-1 py-2 items-center rounded-lg ${formData.type === 'uncovered' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={formData.type === 'uncovered' ? 'font-bold' : 'text-neutral-500'}>Aberta</Text>
                        </Pressable>
                    </View>
                </View>

                <View className="mb-5">
                    <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Preço por Hora (R$)</Text>
                    <TextInput
                        className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={formData.price_per_hour}
                        onChangeText={t => setFormData({ ...formData, price_per_hour: t })}
                    />
                </View>

                {loading && <ActivityIndicator className="mt-4" color="#000" />}
            </ScrollView>
        </SafeAreaView>
    );
}
