import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function CreateTournamentScreen() {
  const { profile } = useAuthStore();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [maxTeams, setMaxTeams] = useState('8');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [description, setDescription] = useState('');

  const sports = ['Beach Tennis', 'Padel', 'Tenis', 'Futevolei', 'Volei'];

  const handleCreate = () => {
    if (!name || !sport) {
      Alert.alert('Erro', 'Preencha os campos obrigatorios');
      return;
    }

    Alert.alert(
      'Em breve',
      'A criacao de torneios estara disponivel em breve!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Criar Torneio</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View className="bg-amber-100 rounded-2xl p-4 mb-6 flex-row items-center gap-3">
          <MaterialIcons name="info" size={24} color="#f59e0b" />
          <Text className="flex-1 text-sm text-amber-800">
            Torneios estarao disponiveis em breve. Preencha o formulario para ser notificado quando lancarmos!
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl border border-neutral-200 p-5">
          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Nome do torneio *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Torneio de Verao"
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Esporte *</Text>
            <View className="flex-row flex-wrap gap-2">
              {sports.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSport(s)}
                  className={`px-4 py-2 rounded-full ${
                    sport === s ? 'bg-black' : 'bg-neutral-100'
                  }`}
                >
                  <Text className={sport === s ? 'text-white' : 'text-neutral-700'}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Numero de equipes</Text>
            <View className="flex-row gap-2">
              {['4', '8', '16', '32'].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => setMaxTeams(num)}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    maxTeams === num ? 'bg-black' : 'bg-neutral-100'
                  }`}
                >
                  <Text className={maxTeams === num ? 'text-white font-medium' : 'text-neutral-700'}>
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Taxa de inscricao (R$)</Text>
            <TextInput
              value={entryFee}
              onChangeText={setEntryFee}
              placeholder="0 para gratuito"
              keyboardType="numeric"
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Premiacao (R$)</Text>
            <TextInput
              value={prizePool}
              onChangeText={setPrizePool}
              placeholder="Valor total da premiacao"
              keyboardType="numeric"
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-neutral-700 mb-2">Descricao</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Regras, local, horario..."
              multiline
              numberOfLines={4}
              className="bg-neutral-100 rounded-xl px-4 py-3 min-h-[100px]"
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-5 bg-white border-t border-neutral-100">
        <Pressable
          onPress={handleCreate}
          className="bg-black rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold">Notifique-me quando lancar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
