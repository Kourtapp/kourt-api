import { Link, Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View className="flex-1 items-center justify-center bg-white px-5">
                <Text className="text-2xl font-bold text-black mb-2">Página não encontrada</Text>
                <Text className="text-base text-gray-500 text-center mb-8">
                    A tela que você está procurando não existe ou o link expirou.
                </Text>

                <Link href="/(tabs)" asChild>
                    <TouchableOpacity className="bg-black px-6 py-3 rounded-full">
                        <Text className="text-white font-semibold">Voltar para o Início</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </>
    );
}
