import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
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
  location?: string;
  is_featured?: boolean;
  is_organizer?: boolean;
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

  // Mock featured tournament for design
  const featuredTournament = {
    id: 'featured',
    title: 'Copa Beach Tennis SP',
    sport: 'BeachTennis',
    date: '15-17 Dezembro',
    location: 'Arena Ibirapuera',
    participants: 64,
    prize: 'R$ 5.000',
  };

  // Mock upcoming tournaments
  const upcomingTournaments = [
    {
      id: '1',
      title: 'Torneio de Inverno',
      sport: 'BeachTennis',
      date: '20 Dez · 14:00',
      location: 'Quadra Central',
      participants: '12/16',
      status: 'open' as const,
    },
    {
      id: '2',
      title: 'Liga Padel Masters',
      sport: 'Padel',
      date: '22 Dez · 09:00',
      location: 'Padel Club',
      participants: '8/8',
      status: 'full' as const,
      isOrganizer: true,
    },
    {
      id: '3',
      title: 'Desafio de Verão',
      sport: 'BeachTennis',
      date: '28 Dez · 16:00',
      location: 'Praia Grande',
      participants: '24/32',
      status: 'open' as const,
    },
  ];

  const getStatusBadge = (status: string, isOrganizer?: boolean) => {
    if (isOrganizer) {
      return (
        <View className="bg-purple-100 px-2 py-0.5 rounded">
          <Text className="text-purple-600 text-xs font-bold">ORGANIZADOR</Text>
        </View>
      );
    }
    switch (status) {
      case 'open':
        return (
          <View className="bg-green-100 px-2 py-0.5 rounded">
            <Text className="text-green-600 text-xs font-bold">ABERTO</Text>
          </View>
        );
      case 'full':
        return (
          <View className="bg-amber-100 px-2 py-0.5 rounded">
            <Text className="text-amber-600 text-xs font-bold">LOTADO</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Torneios</Text>
        <TouchableOpacity onPress={() => router.push('/tournaments/create' as any)}>
          <MaterialIcons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Featured Tournament */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={() => router.push(`/tournaments/${featuredTournament.id}` as any)}
            className="bg-black rounded-2xl p-5 relative overflow-hidden"
          >
            <View className="absolute top-4 right-4">
              <View className="bg-amber-500 px-2 py-1 rounded">
                <Text className="text-white text-xs font-bold">DESTAQUE</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
                <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
              </View>
              <Text className="text-white/60 text-xs uppercase tracking-wider">
                {featuredTournament.sport}
              </Text>
            </View>

            <Text className="text-white text-2xl font-bold mb-2">
              {featuredTournament.title}
            </Text>

            <View className="flex-row items-center gap-4 mb-4">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="calendar-today" size={14} color="rgba(255,255,255,0.6)" />
                <Text className="text-white/60 text-sm">{featuredTournament.date}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="location-on" size={14} color="rgba(255,255,255,0.6)" />
                <Text className="text-white/60 text-sm">{featuredTournament.location}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-4 border-t border-white/10">
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="people" size={16} color="rgba(255,255,255,0.8)" />
                  <Text className="text-white/80 font-medium">
                    {featuredTournament.participants} jogadores
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="emoji-events" size={16} color="#F59E0B" />
                  <Text className="text-amber-500 font-bold">{featuredTournament.prize}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Tournaments */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            PRÓXIMOS TORNEIOS
          </Text>

          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View className="gap-3">
              {upcomingTournaments.map((tournament) => (
                <TouchableOpacity
                  key={tournament.id}
                  onPress={() => router.push(`/tournaments/${tournament.id}` as any)}
                  className="bg-white rounded-2xl border border-neutral-200 p-4"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-bold text-black text-lg">{tournament.title}</Text>
                        {getStatusBadge(tournament.status, tournament.isOrganizer)}
                      </View>
                      <Text className="text-neutral-500 text-sm">{tournament.sport}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4 mb-3">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="calendar-today" size={14} color="#A3A3A3" />
                      <Text className="text-neutral-500 text-sm">{tournament.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="location-on" size={14} color="#A3A3A3" />
                      <Text className="text-neutral-500 text-sm">{tournament.location}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="people" size={16} color="#525252" />
                      <Text className="text-neutral-600 font-medium">{tournament.participants}</Text>
                    </View>
                    <TouchableOpacity className="bg-black px-4 py-2 rounded-full">
                      <Text className="text-white font-semibold text-sm">
                        {tournament.status === 'full' ? 'Ver' : 'Participar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Create Tournament CTA */}
        <View className="px-5 mb-8">
          <TouchableOpacity
            onPress={() => router.push('/tournaments/create' as any)}
            className="bg-neutral-100 rounded-2xl p-5 items-center"
          >
            <View className="w-12 h-12 bg-black rounded-full items-center justify-center mb-3">
              <MaterialIcons name="add" size={24} color="#fff" />
            </View>
            <Text className="font-bold text-black mb-1">Criar Torneio</Text>
            <Text className="text-neutral-500 text-sm text-center">
              Organize seu próprio campeonato
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
