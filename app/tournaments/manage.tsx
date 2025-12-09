import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

type TabType = 'ativos' | 'encerrados';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  date: string;
  status: 'draft' | 'open' | 'in_progress' | 'finished';
  participants: number;
  maxParticipants: number;
  prize?: string;
}

// Mock data
const mockTournaments: Tournament[] = [];

export default function ManageTournamentsScreen() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('ativos');

  const activeTournaments = mockTournaments.filter(
    (t) => t.status !== 'finished'
  );
  const finishedTournaments = mockTournaments.filter(
    (t) => t.status === 'finished'
  );

  const tournaments =
    activeTab === 'ativos' ? activeTournaments : finishedTournaments;

  const getStatusStyle = (status: Tournament['status']) => {
    switch (status) {
      case 'draft':
        return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Rascunho' };
      case 'open':
        return { bg: 'bg-green-50', text: 'text-green-700', label: 'Inscrições Abertas' };
      case 'in_progress':
        return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Em Andamento' };
      case 'finished':
        return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Encerrado' };
      default:
        return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: status };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-1 -ml-1">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Meus Torneios</Text>
        <Pressable
          onPress={() => router.push('/tournaments/create' as any)}
          className="w-10 h-10 bg-[#EC4899] rounded-full items-center justify-center"
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-neutral-100">
        <Pressable
          onPress={() => setActiveTab('ativos')}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === 'ativos' ? 'border-[#EC4899]' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'ativos' ? 'text-[#EC4899]' : 'text-neutral-500'
            }`}
          >
            Ativos ({activeTournaments.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('encerrados')}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === 'encerrados' ? 'border-[#EC4899]' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'encerrados' ? 'text-[#EC4899]' : 'text-neutral-500'
            }`}
          >
            Encerrados ({finishedTournaments.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {tournaments.length > 0 ? (
          <View className="p-5 gap-4">
            {tournaments.map((tournament) => {
              const status = getStatusStyle(tournament.status);
              return (
                <Pressable
                  key={tournament.id}
                  onPress={() => router.push(`/tournaments/${tournament.id}` as any)}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 active:bg-neutral-50"
                >
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="font-bold text-black text-lg">
                        {tournament.name}
                      </Text>
                      <Text className="text-sm text-neutral-500 mt-0.5">
                        {tournament.sport} • {tournament.date}
                      </Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${status.bg}`}>
                      <Text className={`text-xs font-medium ${status.text}`}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View className="flex-row gap-4 pt-3 border-t border-neutral-100">
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="group" size={16} color="#737373" />
                      <Text className="text-sm text-neutral-600">
                        {tournament.participants}/{tournament.maxParticipants}
                      </Text>
                    </View>
                    {tournament.prize && (
                      <View className="flex-row items-center gap-1.5">
                        <MaterialIcons name="emoji-events" size={16} color="#F59E0B" />
                        <Text className="text-sm text-neutral-600">
                          {tournament.prize}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-20 h-20 bg-amber-50 rounded-2xl items-center justify-center mb-6">
              <MaterialIcons name="emoji-events" size={40} color="#F59E0B" />
            </View>
            <Text className="text-xl font-semibold text-black text-center mb-2">
              {activeTab === 'ativos'
                ? 'Nenhum torneio ativo'
                : 'Nenhum torneio encerrado'}
            </Text>
            <Text className="text-sm text-neutral-500 text-center leading-5 mb-6">
              {activeTab === 'ativos'
                ? 'Crie seu primeiro torneio e atraia jogadores para sua arena!'
                : 'Seus torneios finalizados aparecerão aqui.'}
            </Text>
            {activeTab === 'ativos' && (
              <Pressable
                onPress={() => router.push('/tournaments/create' as any)}
                className="bg-[#EC4899] px-6 py-3 rounded-xl flex-row items-center gap-2"
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text className="text-white font-semibold">Criar Torneio</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
