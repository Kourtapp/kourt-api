import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [matchReminders, setMatchReminders] = useState(true);
  const [newInvites, setNewInvites] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const notificationSettings = [
    {
      title: 'Partidas',
      items: [
        { label: 'Lembretes de partidas', description: 'Receba avisos antes das suas partidas', value: matchReminders, onChange: setMatchReminders },
        { label: 'Novos convites', description: 'Quando alguem te convidar para jogar', value: newInvites, onChange: setNewInvites },
      ],
    },
    {
      title: 'Mensagens',
      items: [
        { label: 'Mensagens do chat', description: 'Novas mensagens em partidas', value: chatMessages, onChange: setChatMessages },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Promocoes e novidades', description: 'Ofertas especiais e atualizacoes', value: promotions, onChange: setPromotions },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Notificacoes</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Push Notifications Master Toggle */}
        <View className="mx-5 mt-6 bg-white rounded-2xl border border-neutral-200 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-black">Notificacoes Push</Text>
              <Text className="text-sm text-neutral-500 mt-1">
                Ative para receber alertas no seu dispositivo
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E5E5E5', true: '#84CC16' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Notification Categories */}
        {notificationSettings.map((section) => (
          <View key={section.title} className="mt-6">
            <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
              {section.title}
            </Text>
            <View className="bg-white mx-5 rounded-2xl border border-neutral-200 overflow-hidden">
              {section.items.map((item, index) => (
                <View
                  key={item.label}
                  className={`flex-row items-center p-4 ${
                    index < section.items.length - 1 ? 'border-b border-neutral-100' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="font-medium text-black">{item.label}</Text>
                    <Text className="text-sm text-neutral-500 mt-0.5">{item.description}</Text>
                  </View>
                  <Switch
                    value={item.value && pushEnabled}
                    onValueChange={item.onChange}
                    disabled={!pushEnabled}
                    trackColor={{ false: '#E5E5E5', true: '#84CC16' }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
