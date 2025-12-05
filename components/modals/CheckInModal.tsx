import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  matchInfo: {
    title: string;
    location: string;
    dateTime: string;
    hostName: string;
    sport: string;
    currentPlayers: number;
    maxPlayers: number;
  };
}

export function CheckInModal({
  visible,
  onClose,
  onConfirm,
  matchInfo,
}: CheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setConfirmed(true);
      // Auto close after success animation
      setTimeout(() => {
        setConfirmed(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmed(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-neutral-300 rounded-full" />
          </View>

          {confirmed ? (
            // Success State
            <View className="px-6 py-8 items-center">
              <View className="w-20 h-20 bg-lime-100 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="check" size={48} color="#84CC16" />
              </View>
              <Text className="text-2xl font-bold text-black mb-2">Check-in Confirmado!</Text>
              <Text className="text-neutral-500 text-center mb-4">
                Você entrou na partida. Te vemos lá!
              </Text>
              <View className="flex-row items-center gap-2 bg-lime-100 px-4 py-2 rounded-full">
                <MaterialIcons name="add" size={18} color="#65A30D" />
                <Text className="text-lime-700 font-bold">+100 XP</Text>
              </View>
            </View>
          ) : (
            // Confirmation State
            <>
              {/* Header */}
              <View className="px-6 pt-2 pb-4">
                <Text className="text-xl font-bold text-black text-center">
                  Confirmar Participação
                </Text>
              </View>

              {/* Match Info Card */}
              <View className="mx-6 mb-6 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                {/* Sport Badge */}
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="bg-black px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">{matchInfo.sport}</Text>
                  </View>
                  <Text className="text-neutral-500 text-sm">
                    {matchInfo.currentPlayers}/{matchInfo.maxPlayers} jogadores
                  </Text>
                </View>

                {/* Title */}
                <Text className="text-lg font-bold text-black mb-3">{matchInfo.title}</Text>

                {/* Location */}
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="location-on" size={18} color="#525252" />
                  <Text className="text-neutral-700">{matchInfo.location}</Text>
                </View>

                {/* DateTime */}
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="event" size={18} color="#525252" />
                  <Text className="text-neutral-700">{matchInfo.dateTime}</Text>
                </View>

                {/* Host */}
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="person" size={18} color="#525252" />
                  <Text className="text-neutral-700">
                    Organizado por <Text className="font-semibold">{matchInfo.hostName}</Text>
                  </Text>
                </View>
              </View>

              {/* XP Reward */}
              <View className="mx-6 mb-6 flex-row items-center justify-center gap-2 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
                <MaterialIcons name="emoji-events" size={20} color="#F59E0B" />
                <Text className="text-amber-800">
                  Você ganhará <Text className="font-bold">+100 XP</Text> por participar
                </Text>
              </View>

              {/* Terms */}
              <View className="mx-6 mb-4">
                <Text className="text-xs text-neutral-500 text-center">
                  Ao confirmar, você se compromete a comparecer no horário.{'\n'}
                  Não comparecer pode afetar sua reputação no app.
                </Text>
              </View>

              {/* Buttons */}
              <View className="px-6 pb-8 flex-row gap-3">
                <Pressable
                  onPress={handleClose}
                  disabled={loading}
                  className="flex-1 py-4 bg-neutral-100 rounded-2xl items-center"
                >
                  <Text className="font-semibold text-neutral-700">Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-4 bg-lime-500 rounded-2xl items-center flex-row justify-center gap-2"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <MaterialIcons name="check" size={20} color="#000" />
                      <Text className="font-bold text-black">Confirmar</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
