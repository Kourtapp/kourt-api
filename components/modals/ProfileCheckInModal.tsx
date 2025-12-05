import { View, Text, Pressable, Modal, ActivityIndicator, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface ProfileCheckInModalProps {
    visible: boolean;
    onClose: () => void;
}

// Mock nearby courts for check-in
const NEARBY_COURTS = [
    { id: '1', name: 'Arena Beach Ibirapuera', distance: '150m', sport: 'Beach Tennis', image: null },
    { id: '2', name: 'Padel Club Jardins', distance: '800m', sport: 'Padel', image: null },
    { id: '3', name: 'Tennis Park', distance: '1.2km', sport: 'Tênis', image: null },
];

export function ProfileCheckInModal({ visible, onClose }: ProfileCheckInModalProps) {
    const [step, setStep] = useState<'locating' | 'selecting' | 'confirmed'>('locating');
    const [selectedCourt, setSelectedCourt] = useState<any>(null);

    useEffect(() => {
        if (visible) {
            setStep('locating');
            // Simulate GPS location
            setTimeout(() => {
                setStep('selecting');
            }, 2000);
        }
    }, [visible]);

    const handleCheckIn = (court: any) => {
        setSelectedCourt(court);
        // Simulate API call
        setTimeout(() => {
            setStep('confirmed');
        }, 1000);
    };

    const handleClose = () => {
        setStep('locating');
        setSelectedCourt(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl min-h-[50%]">
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 bg-neutral-300 rounded-full" />
                    </View>

                    {/* Header */}
                    <View className="px-6 pt-2 pb-4 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-black">
                            {step === 'confirmed' ? 'Check-in Realizado!' : 'Fazer Check-in'}
                        </Text>
                        <Pressable onPress={handleClose}>
                            <MaterialIcons name="close" size={24} color="#000" />
                        </Pressable>
                    </View>

                    {step === 'locating' && (
                        <View className="flex-1 items-center justify-center pb-10">
                            <View className="w-20 h-20 bg-lime-100 rounded-full items-center justify-center mb-4 animate-pulse">
                                <MaterialIcons name="my-location" size={40} color="#84CC16" />
                            </View>
                            <Text className="text-lg font-semibold text-black">Buscando locais próximos...</Text>
                            <Text className="text-neutral-500 mt-1">Aguarde um momento</Text>
                        </View>
                    )}

                    {step === 'selecting' && (
                        <View className="flex-1 px-6">
                            <Text className="text-sm text-neutral-500 mb-4">Selecione onde você está:</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {NEARBY_COURTS.map((court) => (
                                    <Pressable
                                        key={court.id}
                                        onPress={() => handleCheckIn(court)}
                                        className="flex-row items-center p-4 mb-3 bg-neutral-50 rounded-2xl border border-neutral-100 active:bg-lime-50 active:border-lime-200"
                                    >
                                        <View className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-neutral-100">
                                            <MaterialIcons
                                                name={court.sport === 'Futebol' ? 'sports-soccer' : 'sports-tennis'}
                                                size={24}
                                                color="#000"
                                            />
                                        </View>
                                        <View className="flex-1 ml-3">
                                            <Text className="font-bold text-black">{court.name}</Text>
                                            <Text className="text-xs text-neutral-500">{court.sport} · {court.distance}</Text>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
                                    </Pressable>
                                ))}

                                <Pressable className="mt-2 py-3 items-center">
                                    <Text className="text-sm font-semibold text-black">Não encontrou o local?</Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    )}

                    {step === 'confirmed' && (
                        <View className="flex-1 items-center px-6 pt-4">
                            <View className="w-24 h-24 bg-lime-100 rounded-full items-center justify-center mb-6">
                                <MaterialIcons name="check" size={56} color="#84CC16" />
                            </View>
                            <Text className="text-2xl font-bold text-black text-center mb-2">
                                Você está em {selectedCourt?.name}
                            </Text>
                            <Text className="text-neutral-500 text-center mb-8">
                                Check-in realizado com sucesso! Seus amigos foram notificados.
                            </Text>

                            <View className="flex-row items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-8">
                                <MaterialIcons name="emoji-events" size={20} color="#D97706" />
                                <Text className="text-amber-800 font-bold">+50 XP</Text>
                            </View>

                            <Pressable
                                onPress={handleClose}
                                className="w-full py-4 bg-black rounded-2xl items-center"
                            >
                                <Text className="text-white font-bold text-lg">Fechar</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
