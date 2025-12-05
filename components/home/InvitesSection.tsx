// components/home/InvitesSection.tsx
import { View, Text, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Invite {
  id: string;
  senderName: string;
  senderAvatarUrl?: string;
  message: string;
  location: string;
  dateTime: string;
  timeAgo: string;
  participantsCount: number;
  maxParticipants: number;
  participantAvatars: string[];
  likesCount: number;
  commentsCount: number;
}

interface InvitesSectionProps {
  invites: Invite[];
  onJoin: (inviteId: string) => void;
}

export function InvitesSection({ invites, onJoin }: InvitesSectionProps) {
  if (invites.length === 0) return null;

  return (
    <View className="mt-6 px-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 bg-lime-500 rounded-full" />
          <Text className="text-black font-bold text-lg">
            Convites para você
          </Text>
        </View>
        <Pressable onPress={() => router.push('/social')}>
          <Text className="text-neutral-500">Ver todos</Text>
        </Pressable>
      </View>

      {/* Invites List */}
      <View className="gap-4">
        {invites.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            onJoin={() => onJoin(invite.id)}
          />
        ))}
      </View>
    </View>
  );
}

function InviteCard({
  invite,
  onJoin,
}: {
  invite: Invite;
  onJoin: () => void;
}) {
  return (
    <View className="bg-white border border-neutral-200 rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          {/* Sender Avatar */}
          <View className="w-11 h-11 bg-neutral-200 rounded-full overflow-hidden">
            {invite.senderAvatarUrl ? (
              <Image
                source={{ uri: invite.senderAvatarUrl }}
                className="w-full h-full"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <MaterialIcons name="person" size={24} color="#A3A3A3" />
              </View>
            )}
          </View>

          {/* Sender Info */}
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-black font-bold">{invite.senderName}</Text>
              <View className="bg-black px-2 py-0.5 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  Convite
                </Text>
              </View>
            </View>
            <Text className="text-neutral-500 text-sm">{invite.timeAgo}</Text>
          </View>
        </View>

        {/* More Options */}
        <Pressable>
          <MaterialIcons name="more-vert" size={20} color="#A3A3A3" />
        </Pressable>
      </View>

      {/* Message */}
      <Text className="text-black text-base mb-3">{invite.message}</Text>

      {/* Location Card */}
      <View className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 mb-3">
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="location-on" size={16} color="#525252" />
          <Text className="text-black font-medium">{invite.location}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="event" size={16} color="#525252" />
          <Text className="text-neutral-600">{invite.dateTime}</Text>
        </View>
      </View>

      {/* Participants */}
      <View className="flex-row items-center mb-4">
        {/* Avatar Stack */}
        <View className="flex-row">
          {invite.participantAvatars.slice(0, 3).map((avatar, index) => (
            <View
              key={index}
              className="w-8 h-8 bg-neutral-200 rounded-full border-2 border-white items-center justify-center"
              style={{ marginLeft: index > 0 ? -8 : 0, zIndex: 3 - index }}
            >
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <MaterialIcons name="person" size={16} color="#A3A3A3" />
              )}
            </View>
          ))}
          {/* More Spots */}
          {invite.maxParticipants - invite.participantsCount > 0 && (
            <View
              className="w-8 h-8 bg-white border-2 border-dashed border-neutral-300 rounded-full items-center justify-center"
              style={{ marginLeft: -8 }}
            >
              <MaterialIcons name="add" size={16} color="#A3A3A3" />
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          {/* Like */}
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="favorite-border" size={20} color="#525252" />
            <Text className="text-neutral-600">{invite.likesCount}</Text>
          </View>
          {/* Comment */}
          <View className="flex-row items-center gap-1">
            <MaterialIcons
              name="chat-bubble-outline"
              size={20}
              color="#525252"
            />
            <Text className="text-neutral-600">{invite.commentsCount}</Text>
          </View>
        </View>

        {/* Join Button */}
        <Pressable
          onPress={onJoin}
          className="flex-row items-center gap-2 bg-black px-5 py-2.5 rounded-full"
        >
          <MaterialIcons name="sports-tennis" size={18} color="#FFF" />
          <Text className="text-white font-semibold">Entrar</Text>
        </Pressable>
      </View>
    </View>
  );
}
