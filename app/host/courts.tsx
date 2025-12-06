import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

interface CourtSuggestion {
  id: string;
  name: string;
  type: string;
  sports: string[];
  city: string;
  state?: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  address?: string;
}

export default function HostCourtsScreen() {
  const { user } = useAuthStore();
  const [courts, setCourts] = useState<CourtSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('court_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourts(data || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { dot: 'bg-green-500', text: 'Ativa' };
      case 'pending':
        return { dot: 'bg-amber-500', text: 'Em andamento' };
      case 'rejected':
        return { dot: 'bg-red-500', text: 'Rejeitada' };
      default:
        return { dot: 'bg-gray-500', text: status };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#222" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
        <Text className="text-2xl font-bold text-[#222]">Suas quadras</Text>
        <View className="flex-row gap-3">
          <Pressable className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="search" size={24} color="#222" />
          </Pressable>
          <Pressable className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="filter-list" size={24} color="#222" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/court/add')}
            className="w-10 h-10 items-center justify-center"
          >
            <MaterialIcons name="add" size={24} color="#222" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {courts.length > 0 ? (
          <View className="p-6 gap-4">
            {courts.map((court) => {
              const status = getStatusStyle(court.status);
              return (
                <Pressable
                  key={court.id}
                  className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden"
                  onPress={() => router.push(`/court/${court.id}` as any)}
                >
                  {/* Image */}
                  <View className="h-40 bg-[#F5F5F5] relative">
                    {court.photos && court.photos.length > 0 ? (
                      <Image
                        source={{ uri: court.photos[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <MaterialIcons name="image" size={48} color="#B0B0B0" />
                      </View>
                    )}
                    {/* Status Badge */}
                    <View className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full flex-row items-center gap-2">
                      <View className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <Text className="text-xs font-medium text-[#222]">
                        {status.text}
                      </Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View className="p-4">
                    <Text className="text-xs text-[#717171] mb-2">
                      Criado em {formatDate(court.created_at)}
                    </Text>

                    {/* Mini Map Placeholder */}
                    <View className="h-16 bg-[#F5F5F5] rounded-xl mb-3 flex-row items-center px-3">
                      <MaterialIcons name="location-on" size={18} color="#717171" />
                      <Text className="text-sm text-[#717171] ml-2" numberOfLines={1}>
                        {court.address || `${court.city}`}
                      </Text>
                    </View>

                    <Text className="text-lg font-semibold text-[#222] mb-1">
                      {court.name}
                    </Text>
                    <Text className="text-sm text-[#717171]">
                      {court.sports?.join(', ')} - {court.city}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-20 h-20 border-2 border-[#E5E5E5] rounded-2xl items-center justify-center mb-6">
              <MaterialIcons name="other-houses" size={32} color="#B0B0B0" />
            </View>
            <Text className="text-xl font-semibold text-[#222] text-center mb-2">
              Nenhuma quadra cadastrada
            </Text>
            <Text className="text-sm text-[#717171] text-center leading-5 mb-6">
              Cadastre sua primeira quadra e comece a receber reservas.
            </Text>
            <Pressable
              onPress={() => router.push('/court/add')}
              className="bg-[#222] px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Adicionar Quadra</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
