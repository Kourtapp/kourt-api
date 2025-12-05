# 🎯 KOURT APP - USERFLOW COMPLETO
## PARTE 7: Segurança, Coach Marks e Prompt Final

---

# 18. FLUXO DE SEGURANÇA

## 18.1 CENTRAL DE SEGURANÇA (`/settings/security`)

### Layout

```
┌─────────────────────────────────────┐
│  ←  Segurança                       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✓ CONTA VERIFICADA          │   │
│  │                             │   │
│  │   Tudo certo!               │   │
│  │   Email e telefone          │   │
│  │   verificados.              │   │
│  │                             │   │
│  │   ████████████ (verde lime) │   │
│  └─────────────────────────────┘   │
│                                     │
│  VERIFICAÇÕES                       │
│  ┌─────────────────────────────┐   │
│  │ ✉️ Email              ✓     │   │
│  │   bruno@email.com           │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📱 Telefone           ✓     │   │
│  │   +55 11 99999-9999         │   │
│  └─────────────────────────────┘   │
│                                     │
│  PROTEÇÃO ADICIONAL                 │
│  ┌─────────────────────────────┐   │
│  │ 🔐 Autenticação 2FA     →   │   │
│  │   Opcional · Recomendado    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ATIVIDADE                          │
│  ┌─────────────────────────────┐   │
│  │ 📱 Dispositivos         →   │   │
│  │   2 dispositivos ativos     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📋 Atividade recente    →   │   │
│  │   Último login: hoje, 14:30 │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Elementos e Funções

| Elemento | Ação |
|----------|------|
| **Card Verde (Verificado)** | Display status |
| **Email** | Mostra email verificado |
| **Telefone** | `router.push('/security/verify-phone')` se não verificado |
| **2FA** | `router.push('/security/two-factor')` |
| **Dispositivos** | `router.push('/security/devices')` |
| **Atividade recente** | `router.push('/security/activity')` |

### Código

```typescript
// app/settings/security.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useUserStore } from '@/stores/useUserStore';

export default function SecurityScreen() {
  const { profile } = useUserStore();
  
  const isFullyVerified = profile?.email_verified && profile?.phone_verified;

  return (
    <View className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 flex-row items-center gap-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Segurança</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-5">
        {/* Status Card */}
        <View className={`rounded-2xl p-5 mb-6 ${
          isFullyVerified ? 'bg-lime-500' : 'bg-amber-500'
        }`}>
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <MaterialIcons 
                name={isFullyVerified ? 'verified-user' : 'warning'} 
                size={24} 
                color={isFullyVerified ? '#1a2e05' : '#78350f'} 
              />
            </View>
            <View>
              <Text className={`text-xs ${isFullyVerified ? 'text-lime-900/60' : 'text-amber-900/60'}`}>
                {isFullyVerified ? 'CONTA VERIFICADA' : 'VERIFICAÇÃO PENDENTE'}
              </Text>
              <Text className={`text-2xl font-bold ${isFullyVerified ? 'text-lime-950' : 'text-amber-950'}`}>
                {isFullyVerified ? 'Tudo certo!' : 'Quase lá!'}
              </Text>
            </View>
          </View>
          <Text className={`text-sm ${isFullyVerified ? 'text-lime-900/80' : 'text-amber-900/80'}`}>
            {isFullyVerified 
              ? 'Email e telefone verificados. Sua conta está protegida.'
              : 'Verifique seu telefone para completar a segurança.'
            }
          </Text>
        </View>

        {/* Verificações */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Verificações
        </Text>
        
        <View className="bg-white rounded-2xl border border-neutral-200 mb-6">
          {/* Email */}
          <View className="p-4 flex-row items-center border-b border-neutral-100">
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="email" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Email</Text>
              <Text className="text-sm text-neutral-500">{profile?.email}</Text>
            </View>
            {profile?.email_verified ? (
              <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                <MaterialIcons name="check-circle" size={14} color="#16a34a" />
                <Text className="text-xs text-green-700 font-medium">Verificado</Text>
              </View>
            ) : (
              <Pressable className="px-3 py-1.5 bg-black rounded-full">
                <Text className="text-xs text-white font-medium">Verificar</Text>
              </Pressable>
            )}
          </View>

          {/* Telefone */}
          <Pressable 
            onPress={() => !profile?.phone_verified && router.push('/security/verify-phone')}
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="phone" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Telefone</Text>
              <Text className="text-sm text-neutral-500">
                {profile?.phone || 'Não cadastrado'}
              </Text>
            </View>
            {profile?.phone_verified ? (
              <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                <MaterialIcons name="check-circle" size={14} color="#16a34a" />
                <Text className="text-xs text-green-700 font-medium">Verificado</Text>
              </View>
            ) : (
              <Pressable className="px-3 py-1.5 bg-black rounded-full">
                <Text className="text-xs text-white font-medium">Verificar</Text>
              </Pressable>
            )}
          </Pressable>
        </View>

        {/* Proteção Adicional */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Proteção Adicional
        </Text>
        
        <View className="bg-white rounded-2xl border border-neutral-200 mb-6">
          <Pressable 
            onPress={() => router.push('/security/two-factor')}
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-lime-100 rounded-xl items-center justify-center">
              <MaterialIcons name="security" size={20} color="#84cc16" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Autenticação 2FA</Text>
              <Text className="text-sm text-neutral-500">
                Opcional · Recomendado
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>
        </View>

        {/* Atividade */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Atividade
        </Text>
        
        <View className="bg-white rounded-2xl border border-neutral-200 mb-10">
          <Pressable 
            onPress={() => router.push('/security/devices')}
            className="p-4 flex-row items-center border-b border-neutral-100"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="devices" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Dispositivos</Text>
              <Text className="text-sm text-neutral-500">2 dispositivos ativos</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>

          <Pressable 
            onPress={() => router.push('/security/activity')}
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="history" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Atividade recente</Text>
              <Text className="text-sm text-neutral-500">Último login: hoje, 14:30</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
```

---

## 18.2 VERIFICAÇÃO DE TELEFONE (`/security/verify-phone`)

### Layout

```
┌─────────────────────────────────────┐
│  ←  Verificar Telefone              │
├─────────────────────────────────────┤
│                                     │
│         ┌──────────┐                │
│         │   📱     │                │
│         │ (verde)  │                │
│         └──────────┘                │
│                                     │
│      Confirme seu número            │
│                                     │
│   Enviamos um código de 6          │
│   dígitos para +55 11 9****-9999   │
│                                     │
│                                     │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│   │ 4│ │ 2│ │ 8│ │ 5│ │  │ │  │   │
│   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘   │
│                                     │
│                                     │
│   Não recebeu? Reenviar em 0:45    │
│                                     │
│                                     │
│   ● Email verificado                │
│   ○ Telefone                        │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        VERIFICAR            │   │
│  └─────────────────────────────┘   │
│                                     │
│   Isso ajuda a proteger sua        │
│   conta e evitar contas falsas.    │
│                                     │
└─────────────────────────────────────┘
```

### Código

```typescript
// app/security/verify-phone.tsx
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { verifyPhoneOTP, resendOTP } from '@/services/auth';
import { useUserStore } from '@/stores/useUserStore';

export default function VerifyPhoneScreen() {
  const { profile, updateProfile } = useUserStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (index === 5 && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp?: string) => {
    const finalCode = otp || code.join('');
    if (finalCode.length !== 6) {
      Alert.alert('Atenção', 'Digite o código de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      await verifyPhoneOTP(profile.phone, finalCode);
      await updateProfile({ phone_verified: true });
      
      Alert.alert('Sucesso!', 'Telefone verificado com sucesso.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      await resendOTP(profile.phone);
      setCountdown(45);
      Alert.alert('Código enviado!', 'Verifique suas mensagens.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível reenviar o código.');
    }
  };

  const maskedPhone = profile?.phone?.replace(/(\d{2})(\d{5})(\d{4})/, '+55 $1 $2-$3');

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row items-center gap-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Verificar Telefone</Text>
      </View>

      <View className="flex-1 px-5 pt-10">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-lime-500 rounded-2xl items-center justify-center mb-6">
            <MaterialIcons name="phone-android" size={32} color="#1a2e05" />
          </View>
          <Text className="text-2xl font-bold text-black text-center mb-2">
            Confirme seu número
          </Text>
          <Text className="text-sm text-neutral-500 text-center">
            Enviamos um código de 6 dígitos para{'\n'}
            <Text className="font-medium text-black">{maskedPhone}</Text>
          </Text>
        </View>

        {/* OTP Inputs */}
        <View className="flex-row justify-center gap-3 mb-6">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputs.current[index] = ref}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              className={`w-12 h-14 bg-neutral-100 rounded-xl text-center text-2xl font-bold text-black ${
                digit ? 'border-2 border-black' : ''
              }`}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Resend */}
        <Pressable 
          onPress={handleResend}
          disabled={countdown > 0}
          className="items-center mb-8"
        >
          <Text className={`text-sm ${countdown > 0 ? 'text-neutral-400' : 'text-black font-medium'}`}>
            Não recebeu? {countdown > 0 ? `Reenviar em 0:${countdown.toString().padStart(2, '0')}` : 'Reenviar código'}
          </Text>
        </Pressable>

        {/* Progress */}
        <View className="flex-row items-center justify-center gap-3 mb-8">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="check-circle" size={16} color="#22c55e" />
            <Text className="text-sm text-green-600">Email verificado</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-4 border-2 border-black rounded-full" />
            <Text className="text-sm text-black font-medium">Telefone</Text>
          </View>
        </View>

        {/* Button */}
        <Pressable
          onPress={() => handleVerify()}
          disabled={loading || code.join('').length !== 6}
          className={`w-full py-4 rounded-2xl items-center ${
            code.join('').length === 6 && !loading ? 'bg-black' : 'bg-neutral-300'
          }`}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Verificando...' : 'Verificar'}
          </Text>
        </Pressable>

        {/* Info */}
        <Text className="text-xs text-neutral-500 text-center mt-6">
          Isso ajuda a proteger sua conta e evitar contas falsas.
        </Text>
      </View>
    </View>
  );
}
```

---

# 19. COACH MARKS (TUTORIAL)

## 19.1 SISTEMA DE COACH MARKS

```typescript
// stores/useCoachStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CoachState {
  completed: string[];
  currentStep: number;
  isActive: boolean;
  
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  markCompleted: (id: string) => void;
  hasCompleted: (id: string) => boolean;
}

export const useCoachStore = create<CoachState>((set, get) => ({
  completed: [],
  currentStep: 0,
  isActive: false,

  startTutorial: () => set({ isActive: true, currentStep: 0 }),
  
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  
  skipTutorial: async () => {
    await AsyncStorage.setItem('coach_completed', 'true');
    set({ isActive: false, completed: ['all'] });
  },
  
  markCompleted: async (id) => {
    const { completed } = get();
    const updated = [...completed, id];
    await AsyncStorage.setItem('coach_completed_steps', JSON.stringify(updated));
    set({ completed: updated });
  },
  
  hasCompleted: (id) => get().completed.includes(id),
}));
```

## 19.2 COACH MARKS DATA

```typescript
// constants/coachMarks.ts
export const COACH_MARKS = [
  {
    id: 'home-1',
    screen: 'home',
    title: 'Bem-vindo ao Kourt!',
    description: 'Vamos te mostrar como usar o app. Aqui você vê seu nível e XP.',
    target: 'gamification-card',
    position: 'bottom',
  },
  {
    id: 'home-2',
    screen: 'home',
    title: 'Seus esportes',
    description: 'Filtre o conteúdo pelo esporte que você quer jogar.',
    target: 'sport-pills',
    position: 'bottom',
  },
  {
    id: 'home-3',
    screen: 'home',
    title: 'Quadras próximas',
    description: 'Encontre quadras perto de você e reserve em segundos.',
    target: 'courts-section',
    position: 'top',
  },
  {
    id: 'home-4',
    screen: 'home',
    title: 'Partidas abertas',
    description: 'Entre em partidas que precisam de jogadores.',
    target: 'matches-section',
    position: 'top',
  },
  {
    id: 'map',
    screen: 'map',
    title: 'Mapa de quadras',
    description: 'Veja todas as quadras no mapa e reserve diretamente.',
    target: 'map-view',
    position: 'center',
  },
  {
    id: 'profile',
    screen: 'profile',
    title: 'Seu perfil',
    description: 'Acompanhe suas estatísticas, conquistas e configurações.',
    target: 'profile-header',
    position: 'bottom',
  },
];
```

## 19.3 COMPONENTE COACH OVERLAY

```typescript
// components/coach-marks/CoachOverlay.tsx
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle, 
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { useCoachStore } from '@/stores/useCoachStore';
import { COACH_MARKS } from '@/constants/coachMarks';

const { width, height } = Dimensions.get('window');

interface CoachOverlayProps {
  targetRef: React.RefObject<View>;
}

export function CoachOverlay({ targetRef }: CoachOverlayProps) {
  const { currentStep, nextStep, skipTutorial } = useCoachStore();
  const coachMark = COACH_MARKS[currentStep];
  
  // Pulsing animation for highlight
  const pulse = useSharedValue(1);
  
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!coachMark) return null;

  const isLast = currentStep === COACH_MARKS.length - 1;

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50"
    >
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/60" />

      {/* Highlight circle (verde lime) */}
      <Animated.View
        style={[
          highlightStyle,
          {
            position: 'absolute',
            // Position would be calculated from targetRef
            top: 200,
            left: 20,
            right: 20,
            height: 100,
            borderRadius: 16,
            borderWidth: 3,
            borderColor: '#84cc16',
            shadowColor: '#a3e635',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
          },
        ]}
      />

      {/* Tooltip */}
      <View 
        className="absolute left-5 right-5 bg-white rounded-2xl p-5"
        style={{ top: 320 }} // Dynamic based on target
      >
        {/* Icon */}
        <View className="w-12 h-12 bg-lime-500 rounded-xl items-center justify-center mb-3">
          <MaterialIcons name="lightbulb" size={24} color="#1a2e05" />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-black mb-2">
          {coachMark.title}
        </Text>

        {/* Description */}
        <Text className="text-sm text-neutral-600 mb-4">
          {coachMark.description}
        </Text>

        {/* Progress dots */}
        <View className="flex-row items-center gap-1.5 mb-4">
          {COACH_MARKS.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-lime-500 w-6' : 
                index < currentStep ? 'bg-lime-500' : 'bg-neutral-200'
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={skipTutorial}
            className="flex-1 py-3 rounded-xl items-center"
          >
            <Text className="text-neutral-500 font-medium">Pular</Text>
          </Pressable>
          
          <Pressable
            onPress={nextStep}
            className="flex-1 py-3 bg-lime-500 rounded-xl items-center"
          >
            <Text className="text-lime-950 font-semibold">
              {isLast ? 'Entendi' : 'Próximo'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
```

---

# 20. PROMPT FINAL - TERMINAL BASH

```bash
#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                                                                            ║
# ║   🎾 KOURT APP - IMPLEMENTAÇÃO COMPLETA                                    ║
# ║                                                                            ║
# ║   Este script configura todo o ambiente e estrutura do projeto             ║
# ║   React Native / Expo baseado no design Kourt App Preview v5               ║
# ║                                                                            ║
# ╚════════════════════════════════════════════════════════════════════════════╝

echo "🎾 KOURT APP - Setup Completo"
echo "============================="
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 1. CRIAR PROJETO EXPO
# ═══════════════════════════════════════════════════════════════════════════

echo "📱 [1/8] Criando projeto Expo..."
npx create-expo-app@latest kourt-app --template tabs
cd kourt-app

# ═══════════════════════════════════════════════════════════════════════════
# 2. INSTALAR DEPENDÊNCIAS
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 [2/8] Instalando dependências Expo..."
npx expo install \
  nativewind \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-safe-area-context \
  react-native-screens \
  expo-linear-gradient \
  expo-location \
  expo-image-picker \
  expo-notifications \
  expo-secure-store \
  expo-linking \
  expo-calendar \
  react-native-maps \
  @supabase/supabase-js \
  @react-native-async-storage/async-storage

echo "📦 Instalando dependências NPM..."
npm install \
  zustand \
  date-fns \
  react-hook-form \
  @hookform/resolvers \
  zod

echo "📦 Instalando dependências de dev..."
npm install -D \
  tailwindcss@3.3.2 \
  @types/react \
  typescript \
  prettier

# ═══════════════════════════════════════════════════════════════════════════
# 3. CONFIGURAR TAILWIND
# ═══════════════════════════════════════════════════════════════════════════

echo "🎨 [3/8] Configurando Tailwind CSS..."

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          500: '#84cc16',
          950: '#1a2e05',
        },
      },
    },
  },
  plugins: [],
}
EOF

cat > global.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# ═══════════════════════════════════════════════════════════════════════════
# 4. CRIAR ESTRUTURA DE PASTAS
# ═══════════════════════════════════════════════════════════════════════════

echo "📁 [4/8] Criando estrutura de pastas..."

# Remover arquivos padrão do template
rm -rf app/*

# Auth
mkdir -p app/\(auth\)

# Onboarding
mkdir -p app/\(onboarding\)

# Tabs
mkdir -p app/\(tabs\)

# Screens
mkdir -p app/court
mkdir -p app/booking
mkdir -p app/match/register
mkdir -p app/player
mkdir -p app/chat
mkdir -p app/settings
mkdir -p app/security
mkdir -p app/rankings
mkdir -p app/challenges
mkdir -p app/achievements

# Components
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/home
mkdir -p components/map
mkdir -p components/social
mkdir -p components/court
mkdir -p components/match
mkdir -p components/profile
mkdir -p components/onboarding
mkdir -p components/coach-marks

# Others
mkdir -p stores
mkdir -p services
mkdir -p hooks
mkdir -p constants
mkdir -p types
mkdir -p utils
mkdir -p assets/images

# ═══════════════════════════════════════════════════════════════════════════
# 5. CRIAR ARQUIVOS DE CONSTANTES
# ═══════════════════════════════════════════════════════════════════════════

echo "📄 [5/8] Criando arquivos de constantes..."

# Colors
cat > constants/colors.ts << 'EOF'
export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  bg: '#FAFAFA',
  
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    800: '#262626',
    900: '#171717',
  },
  
  lime: {
    50: '#F7FEE7',
    100: '#ECFCCB',
    500: '#84CC16',
    950: '#1A2E05',
  },
  
  green: {
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
  },
  
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
  },
  
  red: {
    500: '#EF4444',
  },
  
  blue: {
    500: '#3B82F6',
  },
};
EOF

# Types
cat > types/index.ts << 'EOF'
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  total_matches: number;
  wins: number;
  streak: number;
  is_verified: boolean;
  is_pro: boolean;
  sports: string[];
  sport_levels: Record<string, string>;
}

export interface Court {
  id: string;
  name: string;
  type: 'public' | 'private' | 'club';
  sport: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price_per_hour: number | null;
  is_free: boolean;
  rating: number;
  total_reviews: number;
  images: string[];
  amenities: string[];
}

export interface Match {
  id: string;
  sport: string;
  title: string;
  date: string;
  start_time: string;
  court_id?: string;
  court?: Court;
  max_players: number;
  current_players: number;
  is_public: boolean;
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  court?: Court;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
EOF

# ═══════════════════════════════════════════════════════════════════════════
# 6. CRIAR SUPABASE CLIENT
# ═══════════════════════════════════════════════════════════════════════════

echo "🔌 [6/8] Configurando Supabase..."

cat > services/supabase.ts << 'EOF'
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
EOF

# ═══════════════════════════════════════════════════════════════════════════
# 7. CRIAR .ENV
# ═══════════════════════════════════════════════════════════════════════════

echo "🔐 [7/8] Criando arquivo .env..."

cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
EOF

# ═══════════════════════════════════════════════════════════════════════════
# 8. CRIAR TAB BAR LAYOUT
# ═══════════════════════════════════════════════════════════════════════════

echo "🧭 [8/8] Criando Tab Bar Layout..."

cat > 'app/(tabs)/_layout.tsx' << 'EOF'
import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

function CenterButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 84,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? 'home' : 'home'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: '',
          tabBarButton: (props) => <CenterButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="forum" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════
# FINALIZAÇÃO
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "✅ SETUP COMPLETO!"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Estrutura criada:"
echo "   app/(auth)/       - Login, Registro, Forgot Password"
echo "   app/(onboarding)/ - 5 telas de onboarding"
echo "   app/(tabs)/       - Home, Mapa, Plus, Social, Perfil"
echo "   app/court/        - Detalhes da quadra"
echo "   app/booking/      - Fluxo de reserva"
echo "   app/match/        - Partidas"
echo "   app/settings/     - Configurações"
echo "   app/security/     - Verificação e 2FA"
echo "   components/       - Componentes reutilizáveis"
echo "   stores/           - Zustand stores"
echo "   services/         - API services"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure seu .env com as credenciais do Supabase"
echo "   2. Execute: npx expo start"
echo "   3. Implemente as telas seguindo a documentação USERFLOW"
echo ""
echo "🎾 TAB BAR CORRETA:"
echo "   [Home] [Mapa] [+] [Social] [Perfil]"
echo ""
echo "📖 Documentação completa em:"
echo "   KOURT-USERFLOW-PARTE1-ESTRUTURA.md"
echo "   KOURT-USERFLOW-PARTE2-AUTH.md"
echo "   KOURT-USERFLOW-PARTE3-TELAS.md"
echo "   KOURT-USERFLOW-PARTE4-BACKEND.md"
echo "   KOURT-USERFLOW-PARTE5-RESERVAS.md"
echo "   KOURT-USERFLOW-PARTE6-PARTIDAS.md"
echo "   KOURT-USERFLOW-PARTE7-FINAL.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
```

---

# 21. RESUMO FINAL

## Arquivos Criados

| Parte | Arquivo | Conteúdo |
|-------|---------|----------|
| 1 | `KOURT-USERFLOW-PARTE1-ESTRUTURA.md` | Tab Bar, Navegação, Estrutura de Arquivos |
| 2 | `KOURT-USERFLOW-PARTE2-AUTH.md` | Login, Cadastro, Onboarding, Auth Store |
| 3 | `KOURT-USERFLOW-PARTE3-TELAS.md` | Home, Mapa, Social, Perfil |
| 4 | `KOURT-USERFLOW-PARTE4-BACKEND.md` | Supabase Schema, Edge Functions |
| 5 | `KOURT-USERFLOW-PARTE5-RESERVAS.md` | Detalhes Quadra, Checkout, Confirmação |
| 6 | `KOURT-USERFLOW-PARTE6-PARTIDAS.md` | Criar Partida, Placar ao Vivo, Gamificação |
| 7 | `KOURT-USERFLOW-PARTE7-FINAL.md` | Segurança, Coach Marks, Script Setup |

## Tab Bar CORRETA

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [Home]    [Mapa]    [+]    [Social]    [Perfil]          │
│    🏠         🗺️      ⬤        💬         👤               │
│                      ███                                    │
│                   (elevado)                                 │
└─────────────────────────────────────────────────────────────┘
```

**5 itens:**
1. Home - `home` icon
2. Mapa - `map` icon
3. **Criar (+)** - Botão central elevado preto
4. Social - `forum` icon
5. Perfil - `person` icon

## Cores Principais

- **Preto**: #000000 (botões, textos principais)
- **Branco**: #FFFFFF (backgrounds)
- **Cinza**: #FAFAFA (background secundário)
- **Verde Lime**: #84CC16 (destaques, coach marks, verificado)
- **Verde Preço**: #16A34A (preços)

---

**FIM DA DOCUMENTAÇÃO COMPLETA**
