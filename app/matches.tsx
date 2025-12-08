import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

interface Match {
  id: string;
  sport: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  max_players: number;
  current_players: number;
}

export default function MatchesScreen() {
  const { profile } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchMatches();
  }, [profile?.id]);

  const fetchMatches = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('match_players')
        .select(`
          match:matches (
            id,
            sport,
            date,
            time,
            venue,
            status,
            max_players
          )
        `)
        .eq('user_id', profile.id);

      if (error) throw error;

      const matchesData = data
        ?.map((item: any) => item.match)
        .filter((m: any) => m !== null) || [];

      setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingMatches = matches.filter(m => new Date(m.date) >= now);
  const pastMatches = matches.filter(m => new Date(m.date) < now);
  const displayedMatches = tab === 'upcoming' ? upcomingMatches : pastMatches;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Minhas Partidas</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-5 mt-4 bg-white rounded-xl p-1 border border-neutral-200">
        <Pressable
          onPress={() => setTab('upcoming')}
          className={`flex-1 py-3 rounded-lg ${tab === 'upcoming' ? 'bg-black' : ''}`}
        >
          <Text className={`text-center font-medium ${tab === 'upcoming' ? 'text-white' : 'text-neutral-500'}`}>
            Proximas ({upcomingMatches.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('past')}
          className={`flex-1 py-3 rounded-lg ${tab === 'past' ? 'bg-black' : ''}`}
        >
          <Text className={`text-center font-medium ${tab === 'past' ? 'text-white' : 'text-neutral-500'}`}>
            Historico ({pastMatches.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#84cc16" className="mt-10" />
        ) : displayedMatches.length === 0 ? (
          <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
            <MaterialIcons name="sports-tennis" size={48} color="#A3A3A3" />
            <Text className="text-lg font-semibold text-neutral-700 mt-4">
              {tab === 'upcoming' ? 'Nenhuma partida agendada' : 'Nenhuma partida no historico'}
            </Text>
            <Text className="text-sm text-neutral-500 text-center mt-2">
              {tab === 'upcoming'
                ? 'Crie uma partida ou entre em uma existente'
                : 'Suas partidas passadas aparecerao aqui'}
            </Text>
            {tab === 'upcoming' && (
              <Pressable
                onPress={() => router.push('/match/create' as any)}
                className="mt-4 px-6 py-3 bg-black rounded-xl"
              >
                <Text className="text-white font-semibold">Criar partida</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View className="gap-3">
            {displayedMatches.map((match) => (
              <Pressable
                key={match.id}
                onPress={() => router.push(`/match/${match.id}` as any)}
                className="bg-white rounded-2xl border border-neutral-200 p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-lime-100 rounded-xl items-center justify-center">
                      <MaterialIcons name="sports-tennis" size={24} color="#84cc16" />
                    </View>
                    <View>
                      <Text className="font-semibold text-black">{match.sport}</Text>
                      <Text className="text-sm text-neutral-500">{match.venue}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-medium text-black">{formatDate(match.date)}</Text>
                    <Text className="text-xs text-neutral-500">{match.time}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="p-5 bg-white border-t border-neutral-100">
        <Pressable
          onPress={() => router.push('/match/create' as any)}
          className="bg-black rounded-xl py-4 flex-row items-center justify-center gap-2"
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text className="text-white font-semibold">Nova partida</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
