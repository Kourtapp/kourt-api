import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBookingStore } from '@/stores/useBookingStore';

export default function ConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { court, date, time, duration, reset } = useBookingStore();

  const calculateEndTime = (startTime: string, hours: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const endHour = h + hours;
    return `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleGoHome = () => {
    reset();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-5">
        {/* Success Icon */}
        <View className="w-24 h-24 bg-lime-500 rounded-full items-center justify-center mb-6">
          <MaterialIcons name="check" size={48} color="#1A2E05" />
        </View>

        <Text className="text-2xl font-bold text-black text-center mb-2">
          Reserva Confirmada!
        </Text>
        <Text className="text-sm text-neutral-500 text-center mb-8">
          Sua reserva foi realizada com sucesso.
        </Text>

        {/* Booking Details */}
        <View className="w-full bg-neutral-50 rounded-2xl p-5 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-lime-100 rounded-xl items-center justify-center">
              <MaterialIcons name="sports-tennis" size={24} color="#84CC16" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-black">
                {court?.name || 'Quadra'}
              </Text>
              <Text className="text-sm text-neutral-500">
                {court?.sport || 'Esporte'}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="event" size={20} color="#737373" />
              <View>
                <Text className="text-xs text-neutral-500">Data</Text>
                <Text className="text-sm font-medium text-black">
                  {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : 'Data não selecionada'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <MaterialIcons name="schedule" size={20} color="#737373" />
              <View>
                <Text className="text-xs text-neutral-500">Horário</Text>
                <Text className="text-sm font-medium text-black">
                  {time ? `${time} - ${calculateEndTime(time, duration)}` : 'Horário não selecionado'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <MaterialIcons name="location-on" size={20} color="#737373" />
              <View>
                <Text className="text-xs text-neutral-500">Local</Text>
                <Text className="text-sm font-medium text-black">
                  {court?.address || 'Endereço'}
                </Text>
              </View>
            </View>
          </View>

          <View className="h-px bg-neutral-200 my-4" />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-neutral-600">Valor</Text>
            <Text className="text-lg font-bold text-lime-600">
              {court?.is_free ? 'Gratuito' : `R$ ${((court?.price_per_hour || 0) * duration).toFixed(2)}`}
            </Text>
          </View>
        </View>

        {/* XP Gained */}
        <View className="w-full bg-black rounded-2xl p-4 mb-8 flex-row items-center">
          <View className="w-12 h-12 bg-lime-500 rounded-xl items-center justify-center">
            <MaterialIcons name="star" size={24} color="#1A2E05" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-lime-500 font-bold">+25 XP</Text>
            <Text className="text-white/60 text-sm">Reserva realizada!</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="w-full gap-3">
          <Pressable
            onPress={() => router.push({ pathname: '/match/create', params: { bookingId } } as any)}
            className="w-full py-4 bg-[#1a2634] rounded-2xl flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="group-add" size={20} color="#FFF" />
            <Text className="text-white font-semibold">Criar Partida</Text>
          </Pressable>

          <Pressable
            onPress={handleGoHome}
            className="w-full py-4 bg-neutral-100 rounded-2xl flex-row items-center justify-center"
          >
            <Text className="text-[#1a2634] font-semibold">Voltar ao Início</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
