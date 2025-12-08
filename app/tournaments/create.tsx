
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function CreateTournamentScreen() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        sport: 'Beach Tennis',
        max_participants: '16',
        entry_fee: '0',
        description: '',
        start_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD simple for MVP
        start_time: '09:00'
    });

    const handleCreate = async () => {
        if (!formData.title) return Alert.alert('Erro', 'Título é obrigatório');
        if (!user) return;

        setLoading(true);
        try {
            const dateTime = `${formData.start_date}T${formData.start_time}:00`;

            const { error } = await supabase.from('tournaments').insert({
                organizer_id: user.id,
                title: formData.title,
                sport: formData.sport,
                description: formData.description,
                start_date: dateTime,
                max_participants: parseInt(formData.max_participants),
                entry_fee: parseFloat(formData.entry_fee),
                status: 'open',
                type: 'elimination'
            });

            if (error) throw error;

            Alert.alert('Sucesso', 'Torneio criado! Agora divulgue para os jogadores.', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao criar torneio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center">
                <Pressable onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="close" size={24} color="#000" />
                </Pressable>
                <Text className="text-xl font-bold">Novo Torneio</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="mb-5">
                    <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Nome do Evento</Text>
                    <TextInput
                        className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-lg font-bold"
                        placeholder="Ex: 1º Open de Verão"
                        value={formData.title}
                        onChangeText={t => setFormData({ ...formData, title: t })}
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

                <View className="flex-row gap-4 mb-5">
                    <View className="flex-1">
                        <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Data (AAAA-MM-DD)</Text>
                        <TextInput
                            className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                            placeholder="2024-12-25"
                            value={formData.start_date}
                            onChangeText={t => setFormData({ ...formData, start_date: t })}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Hora (HH:MM)</Text>
                        <TextInput
                            className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                            placeholder="09:00"
                            value={formData.start_time}
                            onChangeText={t => setFormData({ ...formData, start_time: t })}
                        />
                    </View>
                </View>

                <View className="flex-row gap-4 mb-5">
                    <View className="flex-1">
                        <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Vagas</Text>
                        <TextInput
                            className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                            keyboardType="numeric"
                            value={formData.max_participants}
                            onChangeText={t => setFormData({ ...formData, max_participants: t })}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Taxa (R$)</Text>
                        <TextInput
                            className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                            keyboardType="numeric"
                            placeholder="0.00"
                            value={formData.entry_fee}
                            onChangeText={t => setFormData({ ...formData, entry_fee: t })}
                        />
                    </View>
                </View>

                <View className="mb-5">
                    <Text className="label mb-2 font-bold text-neutral-500 text-xs uppercase">Descrição</Text>
                    <TextInput
                        className="input bg-neutral-50 p-4 rounded-xl border border-neutral-200 h-24"
                        multiline
                        textAlignVertical="top"
                        placeholder="Detalhes sobre premiação, regras, etc."
                        value={formData.description}
                        onChangeText={t => setFormData({ ...formData, description: t })}
                    />
                </View>

                <Pressable
                    onPress={handleCreate}
                    disabled={loading}
                    className="w-full bg-blue-600 py-4 rounded-xl items-center mt-4"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Publicar Torneio</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
