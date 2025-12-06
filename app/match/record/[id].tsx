import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecordMatchScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
    const [facing, setFacing] = useState<'back' | 'front'>('back');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-black px-5">
                <Text className="text-white text-center mb-4 text-lg">
                    Precisamos da sua permissão para acessar a câmera e gravar a partida.
                </Text>
                <Pressable
                    onPress={requestPermission}
                    className="bg-lime-500 px-6 py-3 rounded-xl"
                >
                    <Text className="text-black font-bold">Conceder Permissão</Text>
                </Pressable>
            </View>
        );
    }

    const toggleRecording = () => {
        if (isRecording) {
            // Stop recording
            setIsRecording(false);
            Alert.alert(
                'Gravação Finalizada',
                'Deseja analisar a partida com IA agora?',
                [
                    {
                        text: 'Descartar',
                        style: 'destructive',
                        onPress: () => router.back(),
                    },
                    {
                        text: 'Analisar',
                        onPress: () => {
                            router.replace(`/match/analysis/${id}` as any);
                        },
                    },
                ]
            );
        } else {
            // Start recording
            setIsRecording(true);
            setDuration(0);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar hidden />
            <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                ref={(ref) => setCameraRef(ref)}
            >
                <SafeAreaView className="flex-1 justify-between p-5">
                    {/* Header */}
                    <View className="flex-row justify-between items-start">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
                        >
                            <MaterialIcons name="close" size={24} color="#fff" />
                        </Pressable>

                        {isRecording && (
                            <View className="bg-red-500/80 px-3 py-1 rounded-lg flex-row items-center gap-2">
                                <View className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <Text className="text-white font-bold font-mono">
                                    {formatTime(duration)}
                                </Text>
                            </View>
                        )}

                        <Pressable
                            onPress={toggleCameraFacing}
                            className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
                        >
                            <MaterialIcons name="flip-camera-ios" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Overlay Info (Mock Score) */}
                    <View className="absolute top-20 right-5 bg-black/40 p-3 rounded-xl">
                        <Text className="text-white text-xs font-bold mb-1">PLACAR (IA)</Text>
                        <View className="flex-row gap-3">
                            <Text className="text-white font-bold text-xl">0</Text>
                            <Text className="text-white/50 text-xl">-</Text>
                            <Text className="text-white font-bold text-xl">0</Text>
                        </View>
                    </View>

                    {/* Bottom Controls */}
                    <View className="items-center mb-8">
                        <Pressable
                            onPress={toggleRecording}
                            className="items-center justify-center"
                        >
                            <View
                                className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${isRecording ? 'bg-transparent' : 'bg-red-500'
                                    }`}
                            >
                                {isRecording && (
                                    <View className="w-8 h-8 bg-red-500 rounded-md" />
                                )}
                            </View>
                        </Pressable>
                        <Text className="text-white mt-4 font-medium">
                            {isRecording ? 'Toque para parar' : 'Toque para gravar'}
                        </Text>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}
