
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function CreateArenaScreen() {
    const { user, refreshProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
    });

    const handleCreate = async () => {
        if (!formData.name || !formData.address) {
            Alert.alert('Erro', 'Nome e endereço são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            if (!user) throw new Error('Usuário não autenticado');

            // 1. Create Arena
            const { error: arenaError } = await supabase
                .from('arenas')
                .insert({
                    owner_id: user.id,
                    name: formData.name,
                    description: formData.description,
                    address: formData.address,
                    phone: formData.phone,
                });

            if (arenaError) throw arenaError;

            // 2. Update user profile to is_host = true
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_host: true })
                .eq('id', user.id);

            if (profileError) throw profileError;

            await refreshProfile();

            Alert.alert('Sucesso!', 'Sua arena foi criada.', [
                { text: 'OK', onPress: () => router.replace('/admin/arena' as any) }
            ]);

        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao criar arena');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center">
                <Pressable onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text className="text-xl font-bold">Nova Arena</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="mb-6">
                    <Text className="text-sm font-bold text-neutral-500 mb-2 uppercase">Nome da Arena</Text>
                    <TextInput
                        className="w-full bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-base"
                        placeholder="Ex: Arena Beach Point"
                        value={formData.name}
                        onChangeText={(t) => setFormData({ ...formData, name: t })}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-neutral-500 mb-2 uppercase">Endereço Completo</Text>
                    <TextInput
                        className="w-full bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-base"
                        placeholder="Rua, Número, Bairro, Cidade"
                        value={formData.address}
                        onChangeText={(t) => setFormData({ ...formData, address: t })}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-neutral-500 mb-2 uppercase">Telefone / WhatsApp</Text>
                    <TextInput
                        className="w-full bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-base"
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({ ...formData, phone: t })}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-neutral-500 mb-2 uppercase">Descrição</Text>
                    <TextInput
                        className="w-full bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-base h-32"
                        placeholder="Conte um pouco sobre sua estrutura..."
                        multiline
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={(t) => setFormData({ ...formData, description: t })}
                    />
                </View>

                <Pressable
                    onPress={handleCreate}
                    disabled={loading}
                    className="w-full bg-black py-4 rounded-xl items-center flex-row justify-center gap-2 mt-4"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Criar Arena</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
