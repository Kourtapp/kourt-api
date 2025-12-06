import { View, Text, ScrollView, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

type RegistrationStatus = 'not_registered' | 'registered' | 'paid' | 'checked_in';

export default function TournamentDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { confirmPayment } = useStripe();

    const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('not_registered');
    const [showPayment, setShowPayment] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // Mock data - in a real app, fetch based on ID
    const tournament = {
        id,
        title: 'Copa Beach Tennis SP',
        sport: 'Beach Tennis',
        date: '15-17 Dezembro',
        time: '09:00 - 18:00',
        location: 'Arena Beach Ibirapuera',
        address: 'Av. Pedro Álvares Cabral, s/n',
        prize: 'R$ 5.000',
        participants: 32,
        maxParticipants: 64,
        entryFee: 150.00,
        entryFeeFormatted: 'R$ 150,00',
        level: 'Todos os níveis',
        description: 'O maior torneio de Beach Tennis de São Paulo! Venha competir com os melhores atletas da região em uma estrutura profissional. Premiação em dinheiro para a categoria PRO e brindes para as demais categorias.',
        rules: [
            'Fase de grupos + Eliminatórias',
            'Sets de 6 games',
            'Obrigatório uso de camiseta do evento',
            'Chegar 30min antes do horário',
        ],
    };

    // Create payment intent for check-in
    const createPaymentIntent = async () => {
        try {
            const amountInCents = Math.round(tournament.entryFee * 100);

            const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                body: {
                    amount: amountInCents,
                    currency: 'brl',
                    metadata: {
                        type: 'tournament',
                        tournamentId: id,
                        userId: user?.id,
                    },
                },
            });

            if (error) throw error;
            setClientSecret(data.clientSecret);
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao iniciar pagamento');
        }
    };

    const handleRegister = () => {
        Alert.alert(
            'Confirmar Inscrição',
            `Deseja se inscrever no torneio ${tournament.title}?\n\nValor: ${tournament.entryFeeFormatted}\n\nApós a inscrição, você deverá fazer o check-in e pagar para confirmar sua participação.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: () => {
                        setRegistrationStatus('registered');
                        Alert.alert(
                            'Inscrição Realizada!',
                            'Agora faça o check-in para confirmar sua participação e efetuar o pagamento.',
                            [{ text: 'OK' }]
                        );
                    },
                },
            ]
        );
    };

    const handleCheckIn = async () => {
        setShowPayment(true);
        if (!clientSecret) {
            await createPaymentIntent();
        }
    };

    const handlePayment = async () => {
        if (!clientSecret) {
            Alert.alert('Erro', 'Pagamento não inicializado');
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
            });

            if (error) {
                Alert.alert('Pagamento Falhou', error.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent?.status === 'Succeeded') {
                setRegistrationStatus('paid');
                setShowPayment(false);
                Alert.alert(
                    'Pagamento Confirmado! 🎉',
                    'Sua inscrição está confirmada. Boa sorte no torneio!',
                    [{ text: 'OK' }]
                );
            }
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao processar pagamento');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = () => {
        switch (registrationStatus) {
            case 'registered':
                return (
                    <View className="px-3 py-1.5 bg-amber-100 rounded-full flex-row items-center gap-1">
                        <MaterialIcons name="schedule" size={14} color="#D97706" />
                        <Text className="text-xs font-bold text-amber-700">Aguardando Check-in</Text>
                    </View>
                );
            case 'paid':
                return (
                    <View className="px-3 py-1.5 bg-green-100 rounded-full flex-row items-center gap-1">
                        <MaterialIcons name="check-circle" size={14} color="#16A34A" />
                        <Text className="text-xs font-bold text-green-700">Confirmado</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View className="h-48 bg-neutral-900 relative">
                    <View className="absolute inset-0 bg-black/40 z-10" />
                    <View className="absolute top-4 left-4 z-20">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </Pressable>
                    </View>
                    <View className="absolute bottom-0 left-0 right-0 p-5 z-20">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="px-2 py-1 bg-lime-500 rounded-md">
                                <Text className="text-xs font-bold text-lime-950">{tournament.sport}</Text>
                            </View>
                            <View className="px-2 py-1 bg-amber-500 rounded-md">
                                <Text className="text-xs font-bold text-black">PREMIAÇÃO {tournament.prize}</Text>
                            </View>
                        </View>
                        <Text className="text-2xl font-bold text-white">{tournament.title}</Text>
                    </View>
                </View>

                <View className="p-5">
                    {/* Info Grid */}
                    <View className="flex-row flex-wrap gap-4 mb-6">
                        <View className="w-[47%] flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                            <MaterialIcons name="event" size={20} color="#525252" />
                            <View>
                                <Text className="text-xs text-neutral-500">Data</Text>
                                <Text className="text-sm font-semibold text-black">{tournament.date}</Text>
                            </View>
                        </View>
                        <View className="w-[47%] flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                            <MaterialIcons name="schedule" size={20} color="#525252" />
                            <View>
                                <Text className="text-xs text-neutral-500">Horário</Text>
                                <Text className="text-sm font-semibold text-black">{tournament.time}</Text>
                            </View>
                        </View>
                        <View className="w-full flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                            <MaterialIcons name="location-on" size={20} color="#525252" />
                            <View className="flex-1">
                                <Text className="text-xs text-neutral-500">Local</Text>
                                <Text className="text-sm font-semibold text-black">{tournament.location}</Text>
                                <Text className="text-xs text-neutral-400">{tournament.address}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-black mb-2">Sobre o Torneio</Text>
                        <Text className="text-neutral-600 leading-5">{tournament.description}</Text>
                    </View>

                    {/* Rules */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-black mb-3">Regras Principais</Text>
                        <View className="gap-2">
                            {tournament.rules.map((rule, idx) => (
                                <View key={idx} className="flex-row items-center gap-2">
                                    <View className="w-1.5 h-1.5 bg-lime-500 rounded-full" />
                                    <Text className="text-neutral-600">{rule}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Participants */}
                    <View className="mb-8">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-bold text-black">Participantes</Text>
                            <Text className="text-neutral-500">
                                {tournament.participants}/{tournament.maxParticipants} inscritos
                            </Text>
                        </View>
                        <View className="h-3 bg-neutral-100 rounded-full overflow-hidden mb-4">
                            <View
                                className="h-full bg-lime-500 rounded-full"
                                style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                            />
                        </View>

                        {/* Avatars placeholder */}
                        <View className="flex-row items-center">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <View
                                    key={i}
                                    className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white -ml-3 first:ml-0 items-center justify-center"
                                >
                                    <MaterialIcons name="person" size={20} color="#A3A3A3" />
                                </View>
                            ))}
                            <View className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-white -ml-3 items-center justify-center">
                                <Text className="text-xs font-bold text-neutral-500">+{tournament.participants - 5}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Payment Modal */}
            {showPayment && (
                <View className="absolute inset-0 bg-black/50 z-50">
                    <View className="flex-1 justify-end">
                        <View className="bg-white rounded-t-3xl p-5 pb-8">
                            {/* Header */}
                            <View className="flex-row items-center justify-between mb-6">
                                <Text className="text-xl font-bold text-black">Check-in & Pagamento</Text>
                                <Pressable onPress={() => setShowPayment(false)}>
                                    <MaterialIcons name="close" size={24} color="#737373" />
                                </Pressable>
                            </View>

                            {/* Summary */}
                            <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-neutral-600">Torneio</Text>
                                    <Text className="font-semibold text-black">{tournament.title}</Text>
                                </View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-neutral-600">Data</Text>
                                    <Text className="font-medium text-black">{tournament.date}</Text>
                                </View>
                                <View className="h-px bg-neutral-200 my-3" />
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-base font-bold text-black">Total</Text>
                                    <Text className="text-xl font-bold text-lime-600">{tournament.entryFeeFormatted}</Text>
                                </View>
                            </View>

                            {/* Card Input */}
                            <Text className="text-sm font-semibold text-black mb-3">Dados do Cartão</Text>
                            <View className="bg-neutral-50 rounded-xl p-4 mb-4">
                                <CardField
                                    postalCodeEnabled={false}
                                    placeholders={{ number: '4242 4242 4242 4242' }}
                                    cardStyle={{
                                        backgroundColor: '#FFFFFF',
                                        textColor: '#000000',
                                        borderColor: '#E5E5E5',
                                        borderWidth: 1,
                                        borderRadius: 12,
                                        fontSize: 16,
                                        placeholderColor: '#A3A3A3',
                                    }}
                                    style={{ width: '100%', height: 50 }}
                                    onCardChange={(cardDetails) => setCardComplete(cardDetails.complete)}
                                />
                            </View>

                            {/* Test Card Info */}
                            <View className="p-3 bg-blue-50 rounded-xl mb-6">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="info" size={16} color="#3B82F6" />
                                    <Text className="text-xs text-blue-600">
                                        Teste: 4242 4242 4242 4242, data futura, qualquer CVC
                                    </Text>
                                </View>
                            </View>

                            {/* Pay Button */}
                            <Pressable
                                onPress={handlePayment}
                                disabled={!cardComplete || processing || !clientSecret}
                                className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${cardComplete && !processing && clientSecret ? 'bg-lime-500' : 'bg-neutral-300'
                                    }`}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="lock" size={20} color={cardComplete ? '#1a2e05' : '#fff'} />
                                        <Text className={`font-bold text-base ml-2 ${cardComplete ? 'text-lime-950' : 'text-white'}`}>
                                            Pagar {tournament.entryFeeFormatted}
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            {/* Footer CTA */}
            <View className="p-5 border-t border-neutral-100 bg-white">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-neutral-500">Valor da inscrição</Text>
                        <Text className="text-2xl font-bold text-black">{tournament.entryFeeFormatted}</Text>
                    </View>
                    <View className="items-end">
                        {getStatusBadge() || (
                            <>
                                <Text className="text-neutral-500">Vagas restantes</Text>
                                <Text className="text-base font-bold text-lime-600">
                                    {tournament.maxParticipants - tournament.participants} vagas
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Dynamic Button based on status */}
                {registrationStatus === 'not_registered' && (
                    <Pressable
                        onPress={handleRegister}
                        className="w-full py-4 rounded-2xl items-center bg-black"
                    >
                        <Text className="text-base font-bold text-white">Inscrever-se Agora</Text>
                    </Pressable>
                )}

                {registrationStatus === 'registered' && (
                    <Pressable
                        onPress={handleCheckIn}
                        className="w-full py-4 rounded-2xl items-center bg-lime-500"
                    >
                        <View className="flex-row items-center gap-2">
                            <MaterialIcons name="how-to-reg" size={20} color="#1a2e05" />
                            <Text className="text-base font-bold text-lime-950">Fazer Check-in e Pagar</Text>
                        </View>
                    </Pressable>
                )}

                {registrationStatus === 'paid' && (
                    <View className="w-full py-4 rounded-2xl items-center bg-green-100">
                        <View className="flex-row items-center gap-2">
                            <MaterialIcons name="check-circle" size={20} color="#16A34A" />
                            <Text className="text-base font-bold text-green-700">Inscrição Confirmada</Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
