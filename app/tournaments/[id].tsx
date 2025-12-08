
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BracketView from '@/components/BracketView';

export default function TournamentDetailScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const [tournament, setTournament] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'bracket' | 'players'>('info');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const { data: t } = await supabase.from('tournaments').select('*, profiles:organizer_id(name)').eq('id', id).single();
            const { data: p } = await supabase.from('tournament_participants').select('*, profiles(name, avatar_url)').eq('tournament_id', id);

            if (t) setTournament(t);
            if (p) setParticipants(p);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) return;

        // Check if tournament has entry fee
        if (tournament.entry_fee > 0) {
            Alert.alert(
                'Taxa de Inscricao',
                `Este torneio tem uma taxa de R$ ${tournament.entry_fee.toFixed(2)}. Deseja continuar?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Pagar e Inscrever',
                        onPress: async () => {
                            setJoining(true);
                            try {
                                // Create participant with pending payment status
                                const { data: participant, error } = await supabase
                                    .from('tournament_participants')
                                    .insert({
                                        tournament_id: id,
                                        user_id: user.id,
                                        status: 'pending_payment',
                                        payment_status: 'pending',
                                        entry_fee_paid: tournament.entry_fee
                                    })
                                    .select()
                                    .single();

                                if (error) throw error;

                                // TODO: Redirect to payment screen
                                // For now, mark as confirmed (simulating free tournament)
                                Alert.alert(
                                    'Pagamento',
                                    'Funcionalidade de pagamento sera integrada em breve. Inscricao confirmada!',
                                    [{ text: 'OK', onPress: fetchData }]
                                );
                            } catch (error: any) {
                                Alert.alert('Erro', error.message);
                            } finally {
                                setJoining(false);
                            }
                        }
                    }
                ]
            );
            return;
        }

        // Free tournament - direct registration
        setJoining(true);
        try {
            const { error } = await supabase.from('tournament_participants').insert({
                tournament_id: id,
                user_id: user.id,
                status: 'confirmed',
                payment_status: 'not_required'
            });
            if (error) throw error;
            Alert.alert('Inscricao Confirmada!', 'Boa sorte no torneio.');
            fetchData();
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setJoining(false);
        }
    };

    if (loading || !tournament) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator color="#000" />
            </View>
        );
    }

    const isParticipant = participants.some(p => p.user_id === user?.id);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header Image Area */}
            <View className="h-48 bg-blue-600 relative">
                <View className="absolute inset-0 bg-black/30 w-full h-full" />
                <Pressable onPress={() => router.back()} className="absolute top-4 left-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md">
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <View className="absolute bottom-4 left-4 right-4">
                    <View className="px-2 py-1 bg-white/20 self-start rounded mb-2">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{tournament.sport}</Text>
                    </View>
                    <Text className="text-white text-3xl font-bold italic shadow-sm">{tournament.title}</Text>
                    <Text className="text-white/80 text-sm mt-1">
                        {format(new Date(tournament.start_date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                    </Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-neutral-100">
                {['info', 'bracket', 'players'].map((tab) => (
                    <Pressable
                        key={tab}
                        onPress={() => setActiveTab(tab as any)}
                        className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab ? 'border-blue-600' : 'border-transparent'}`}
                    >
                        <Text className={`uppercase text-xs font-bold ${activeTab === tab ? 'text-blue-600' : 'text-neutral-400'}`}>
                            {tab === 'info' ? 'Detalhes' : tab === 'bracket' ? 'Chave' : 'Jogadores'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView className="flex-1 bg-neutral-50 content-start">
                {activeTab === 'info' && (
                    <View className="p-5 gap-4">
                        <View className="bg-white p-4 rounded-xl border border-neutral-100">
                            <Text className="text-neutral-500 font-bold uppercase text-xs mb-2">Organizador</Text>
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                                    <Text className="font-bold text-neutral-500">{tournament.profiles?.name?.[0]}</Text>
                                </View>
                                <Text className="font-bold text-base">{tournament.profiles?.name}</Text>
                            </View>
                        </View>

                        <View className="bg-white p-4 rounded-xl border border-neutral-100">
                            <Text className="text-neutral-500 font-bold uppercase text-xs mb-2">Descrição</Text>
                            <Text className="text-neutral-700 leading-relaxed">
                                {tournament.description || 'Sem descrição.'}
                            </Text>
                        </View>

                        <View className="bg-white p-4 rounded-xl border border-neutral-100">
                            <Text className="text-neutral-500 font-bold uppercase text-xs mb-2">Premiação & Regras</Text>
                            <View className="gap-2">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="emoji-events" size={20} color="#CA8A04" />
                                    <Text className="text-neutral-700">Troféu para 1º e 2º lugar</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="format-list-numbered" size={20} color="#666" />
                                    <Text className="text-neutral-700">{tournament.max_participants} Vagas (Mata-mata)</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {activeTab === 'bracket' && (
                    <View className="p-5">
                        {participants.length < 2 ? (
                            <View className="py-10 items-center">
                                <MaterialIcons name="hub" size={48} color="#D4D4D4" />
                                <Text className="text-neutral-400 mt-2 text-center">Chaves serão geradas quando{'\n'}houver jogadores suficientes.</Text>
                            </View>
                        ) : (
                            <BracketView participants={participants} />
                        )}
                    </View>
                )}

                {activeTab === 'players' && (
                    <View className="p-5 gap-3">
                        <Text className="font-bold text-neutral-500 uppercase text-xs mb-2">
                            Inscritos ({participants.length}/{tournament.max_participants})
                        </Text>
                        {participants.map((p, i) => (
                            <View key={i} className="bg-white p-3 rounded-xl border border-neutral-100 flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                                    <Text className="font-bold text-neutral-600">{i + 1}</Text>
                                </View>
                                <View>
                                    <Text className="font-bold">{p.profiles?.name || 'Jogador'}</Text>
                                    <Text className="text-xs text-green-600 font-bold">● Confirmado</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Footer Action */}
            <View className="p-5 bg-white border-t border-neutral-100">
                {isParticipant ? (
                    <View className="w-full bg-green-100 py-4 rounded-xl items-center border border-green-200">
                        <Text className="text-green-800 font-bold text-lg flex-row items-center">
                            <MaterialIcons name="check-circle" size={20} /> Inscrito
                        </Text>
                    </View>
                ) : (
                    <Pressable
                        onPress={handleJoin}
                        disabled={joining || participants.length >= tournament.max_participants}
                        className={`w-full py-4 rounded-xl items-center ${participants.length >= tournament.max_participants ? 'bg-neutral-200' : 'bg-blue-600'}`}
                    >
                        {joining ? <ActivityIndicator color="#fff" /> : (
                            <Text className={`font-bold text-lg ${participants.length >= tournament.max_participants ? 'text-neutral-400' : 'text-white'}`}>
                                {participants.length >= tournament.max_participants ? 'Vagas Esgotadas' : `Inscrever-se (R$ ${tournament.entry_fee})`}
                            </Text>
                        )}
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
