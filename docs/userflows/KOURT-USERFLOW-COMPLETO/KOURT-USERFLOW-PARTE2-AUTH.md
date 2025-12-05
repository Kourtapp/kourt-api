# 🎯 KOURT APP - USERFLOW COMPLETO
## PARTE 2: Fluxo de Autenticação e Onboarding

---

# 2. AUTENTICAÇÃO

## 2.1 TELA DE LOGIN (`/login`)

### Layout Visual
```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│                                     │
│                                     │
│              KOURT                  │
│         Seu app de esportes         │
│                                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐   │
│  │ seu@email.com               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Senha                              │
│  ┌─────────────────────────────┐   │
│  │ ••••••••              👁    │   │
│  └─────────────────────────────┘   │
│                                     │
│                 Esqueci minha senha │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         ENTRAR              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ──────── ou continue com ──────── │
│                                     │
│  ┌────────────┐  ┌────────────┐    │
│  │   Google   │  │   Apple    │    │
│  └────────────┘  └────────────┘    │
│                                     │
│     Não tem conta? Cadastre-se     │
│                                     │
└─────────────────────────────────────┘
```

### Elementos e Funções

| Elemento | Tipo | Ação | API/Função |
|----------|------|------|------------|
| **Logo KOURT** | Text | - | Display only |
| **Input Email** | TextInput | Digitar email | `useState` |
| **Input Senha** | TextInput | Digitar senha | `useState` |
| **Ícone Olho** | Pressable | Toggle mostrar/ocultar senha | `setShowPassword(!showPassword)` |
| **Link "Esqueci minha senha"** | Pressable | Navegar | `router.push('/forgot-password')` |
| **Botão "ENTRAR"** | Button | Fazer login | `signInWithEmail(email, password)` |
| **Botão Google** | Button | Login social | `signInWithGoogle()` |
| **Botão Apple** | Button | Login social | `signInWithApple()` |
| **Link "Cadastre-se"** | Pressable | Navegar | `router.push('/register')` |

### Código Completo

```typescript
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signInWithGoogle, signInWithApple } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error, isFirstLogin } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      if (isFirstLogin) {
        router.replace('/onboarding/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error, isFirstLogin } = await signInWithGoogle();
      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }
      router.replace(isFirstLogin ? '/onboarding/welcome' : '/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const { error, isFirstLogin } = await signInWithApple();
      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }
      router.replace(isFirstLogin ? '/onboarding/welcome' : '/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Logo Area */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl font-black tracking-tight text-black">
          KOURT
        </Text>
        <Text className="text-sm text-neutral-500 mt-2">
          Seu app de esportes
        </Text>
      </View>

      {/* Form Area */}
      <View className="px-6 pb-6">
        {/* Email */}
        <Text className="text-sm font-medium text-black mb-2">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full bg-neutral-100 rounded-xl px-4 py-3.5 text-sm text-black mb-4"
          placeholderTextColor="#A3A3A3"
        />

        {/* Senha */}
        <Text className="text-sm font-medium text-black mb-2">Senha</Text>
        <View className="relative">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            className="w-full bg-neutral-100 rounded-xl px-4 py-3.5 text-sm text-black pr-12"
            placeholderTextColor="#A3A3A3"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5"
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color="#A3A3A3"
            />
          </Pressable>
        </View>

        {/* Esqueci senha */}
        <Pressable
          onPress={() => router.push('/forgot-password')}
          className="mt-2 self-end"
        >
          <Text className="text-sm text-neutral-500">
            Esqueci minha senha
          </Text>
        </Pressable>

        {/* Botão Entrar */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`w-full py-4 rounded-2xl mt-6 items-center ${
            loading ? 'bg-neutral-300' : 'bg-black'
          }`}
        >
          <Text className="text-white font-semibold text-[15px]">
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>

      {/* Social Login */}
      <View className="px-6 pb-6">
        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-neutral-200" />
          <Text className="px-4 text-sm text-neutral-400">ou continue com</Text>
          <View className="flex-1 h-px bg-neutral-200" />
        </View>

        {/* Social Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleGoogleLogin}
            className="flex-1 py-3.5 bg-white border border-neutral-200 rounded-xl flex-row items-center justify-center"
          >
            <MaterialIcons name="g-translate" size={20} color="#000" />
            <Text className="ml-2 font-medium text-black">Google</Text>
          </Pressable>

          <Pressable
            onPress={handleAppleLogin}
            className="flex-1 py-3.5 bg-white border border-neutral-200 rounded-xl flex-row items-center justify-center"
          >
            <MaterialIcons name="apple" size={20} color="#000" />
            <Text className="ml-2 font-medium text-black">Apple</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 pb-10">
        <Pressable onPress={() => router.push('/register')}>
          <Text className="text-center text-sm text-neutral-500">
            Não tem conta?{' '}
            <Text className="text-black font-semibold">Cadastre-se</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

### Backend (Supabase)

```typescript
// services/auth.ts
import { supabase } from './supabase';

export const authService = {
  // Login com email/senha
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    // Verificar se é primeiro login
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      isFirstLogin: !profile?.onboarding_completed,
    };
  },

  // Login com Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    return { data, error };
  },

  // Login com Apple
  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    return { data, error };
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
};
```

---

## 2.2 TELA DE CADASTRO (`/register`)

### Layout Visual
```
┌─────────────────────────────────────┐
│  ←                    9:41          │
├─────────────────────────────────────┤
│                                     │
│  Criar conta                        │
│  Junte-se à comunidade              │
│                                     │
│  Nome completo                      │
│  ┌─────────────────────────────┐   │
│  │ Bruno Silva                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐   │
│  │ bruno@email.com             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Telefone                           │
│  ┌─────────────────────────────┐   │
│  │ +55 (11) 99999-9999         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Senha                              │
│  ┌─────────────────────────────┐   │
│  │ ••••••••              👁    │   │
│  └─────────────────────────────┘   │
│  Mínimo 8 caracteres                │
│                                     │
│  ☑ Aceito os Termos de Uso e       │
│    Política de Privacidade          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       CRIAR CONTA           │   │
│  └─────────────────────────────┘   │
│                                     │
│     Já tem conta? Entre            │
│                                     │
└─────────────────────────────────────┘
```

### Elementos e Funções

| Elemento | Tipo | Ação | API/Função |
|----------|------|------|------------|
| **Botão Voltar (←)** | Pressable | Voltar | `router.back()` |
| **Input Nome** | TextInput | Digitar nome | `useState` |
| **Input Email** | TextInput | Digitar email | `useState` |
| **Input Telefone** | TextInput | Digitar telefone | `useState` + máscara |
| **Input Senha** | TextInput | Digitar senha | `useState` |
| **Ícone Olho** | Pressable | Toggle senha | `setShowPassword` |
| **Checkbox Termos** | Pressable | Aceitar termos | `setAcceptedTerms` |
| **Link Termos** | Pressable | Abrir termos | `Linking.openURL()` |
| **Botão "CRIAR CONTA"** | Button | Criar conta | `signUp(email, password, metadata)` |
| **Link "Entre"** | Pressable | Navegar | `router.push('/login')` |

### Validações

```typescript
const validations = {
  name: (value: string) => {
    if (!value) return 'Nome é obrigatório';
    if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    return null;
  },
  email: (value: string) => {
    if (!value) return 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
    return null;
  },
  phone: (value: string) => {
    if (!value) return 'Telefone é obrigatório';
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 11) return 'Telefone inválido';
    return null;
  },
  password: (value: string) => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    return null;
  },
};
```

### Backend

```typescript
// services/auth.ts
async signUp(email: string, password: string, metadata: {
  name: string;
  phone: string;
}) {
  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: metadata.name,
        phone: metadata.phone,
      },
    },
  });

  if (authError) return { error: authError };

  // 2. Criar perfil na tabela profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      name: metadata.name,
      email: email,
      phone: metadata.phone,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    });

  if (profileError) return { error: profileError };

  // 3. Enviar SMS de verificação
  await sendVerificationSMS(metadata.phone);

  return { user: authData.user };
}
```

---

## 2.3 ONBOARDING - 5 TELAS

### STEP 1: BEM-VINDO (`/onboarding/welcome`)

```
┌─────────────────────────────────────┐
│  ←   ●○○○○                   Pular │
├─────────────────────────────────────┤
│                                     │
│            [Ilustração]             │
│          🎾 🏃 ⚽ 🏀               │
│                                     │
│                                     │
│  Bem-vindo ao Kourt!               │
│                                     │
│  Encontre quadras, organize        │
│  partidas e conecte-se com         │
│  jogadores da sua região.          │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     COMEÇAR           →     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

| Elemento | Ação |
|----------|------|
| **Botão Voltar** | `router.back()` |
| **Progress Dots** | Display (1/5 ativo) |
| **Botão Pular** | `router.replace('/(tabs)')` + `markOnboardingComplete()` |
| **Botão Começar** | `router.push('/onboarding/sports')` |

---

### STEP 2: ESPORTES (`/onboarding/sports`)

```
┌─────────────────────────────────────┐
│  ←   ●●○○○                   Pular │
├─────────────────────────────────────┤
│                                     │
│  Pergunta 2 de 5                   │
│  Quais esportes você pratica?      │
│  Selecione todos que se aplicam    │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  🎾    │  │  🎾    │          │
│  │ Beach  │  │ Padel  │          │
│  │ Tennis │  │ ✓      │          │
│  │ ✓      │  │        │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  ⚽    │  │  🎾    │          │
│  │Futebol │  │ Tênis  │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  🏀    │  │  🏐    │          │
│  │Basquete│  │ Vôlei  │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  🤾    │  │  ...   │          │
│  │Handebol│  │ Outros │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     CONTINUAR         →     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

| Elemento | Ação | Estado |
|----------|------|--------|
| **Sport Card** | Toggle seleção | `selectedSports: string[]` |
| **Card Selecionado** | Visual | `bg-black text-white border-black` |
| **Card Normal** | Visual | `bg-white text-black border-neutral-200` |
| **Botão Continuar** | Navegar | `router.push('/onboarding/level')` + salvar seleção |

```typescript
// Dados dos esportes
const sports = [
  { id: 'beach-tennis', name: 'BeachTennis', icon: 'sports_tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports_tennis' },
  { id: 'football', name: 'Futebol', icon: 'sports_soccer' },
  { id: 'tennis', name: 'Tênis', icon: 'sports_tennis' },
  { id: 'basketball', name: 'Basquete', icon: 'sports_basketball' },
  { id: 'volleyball', name: 'Vôlei', icon: 'sports_volleyball' },
  { id: 'handball', name: 'Handebol', icon: 'sports_handball' },
  { id: 'other', name: 'Outros', icon: 'more_horiz' },
];

// Estado
const [selectedSports, setSelectedSports] = useState<string[]>([]);

// Toggle
const toggleSport = (sportId: string) => {
  setSelectedSports(prev =>
    prev.includes(sportId)
      ? prev.filter(id => id !== sportId)
      : [...prev, sportId]
  );
};
```

---

### STEP 3: NÍVEL (`/onboarding/level`)

```
┌─────────────────────────────────────┐
│  ←   ●●●○○                   Pular │
├─────────────────────────────────────┤
│                                     │
│  Pergunta 3 de 5                   │
│  Qual seu nível em cada esporte?   │
│  Baseado nos esportes selecionados │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎾 BeachTennis              │   │
│  │                             │   │
│  │ [Inic.][Inter.][Avanç][Pro]│   │
│  │         ████                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎾 Padel                    │   │
│  │                             │   │
│  │ [Inic.][Inter.][Avanç][Pro]│   │
│  │                 ████        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Legenda dos níveis          │   │
│  │ ○ Iniciante — Aprendendo    │   │
│  │ ○ Intermed. — Joga regular  │   │
│  │ ○ Avançado — Competitivo    │   │
│  │ ○ Pro — Joga torneios       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     CONTINUAR         →     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

| Elemento | Ação |
|----------|------|
| **Level Button Ativo** | `bg-black text-white` |
| **Level Button Normal** | `bg-white border-neutral-200` |
| **Botão Continuar** | Salvar níveis + `router.push('/onboarding/frequency')` |

```typescript
// Estado
const [levels, setLevels] = useState<Record<string, string>>({});

// Níveis disponíveis
const levelOptions = [
  { id: 'beginner', label: 'Iniciante', short: 'Inic.' },
  { id: 'intermediate', label: 'Intermediário', short: 'Inter.' },
  { id: 'advanced', label: 'Avançado', short: 'Avanç.' },
  { id: 'pro', label: 'Pro', short: 'Pro' },
];

// Selecionar nível
const setLevel = (sportId: string, levelId: string) => {
  setLevels(prev => ({ ...prev, [sportId]: levelId }));
};
```

---

### STEP 4: FREQUÊNCIA (`/onboarding/frequency`)

```
┌─────────────────────────────────────┐
│  ←   ●●●●○                   Pular │
├─────────────────────────────────────┤
│                                     │
│  Pergunta 4 de 5                   │
│  Com que frequência você joga?     │
│  Nos ajuda a sugerir horários      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☀️ Raramente                │   │
│  │   1-2 vezes por mês     ○   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🌤 Ocasionalmente           │   │
│  │   1 vez por semana      ○   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☀️ Regularmente           ✓ │   │
│  │   2-3 vezes por semana      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔥 Intensamente             │   │
│  │   4+ vezes por semana   ○   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     CONTINUAR         →     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

```typescript
const frequencyOptions = [
  { id: 'rarely', label: 'Raramente', desc: '1-2 vezes por mês', icon: 'brightness_low' },
  { id: 'occasionally', label: 'Ocasionalmente', desc: '1 vez por semana', icon: 'brightness_medium' },
  { id: 'regularly', label: 'Regularmente', desc: '2-3 vezes por semana', icon: 'brightness_high' },
  { id: 'intensely', label: 'Intensamente', desc: '4+ vezes por semana', icon: 'local_fire_department' },
];

const [frequency, setFrequency] = useState<string>('');
```

---

### STEP 5: OBJETIVOS (`/onboarding/goals`)

```
┌─────────────────────────────────────┐
│  ←   ●●●●●                   Pular │
├─────────────────────────────────────┤
│                                     │
│  Pergunta 5 de 5                   │
│  Quais seus objetivos?             │
│  Selecione todos que se aplicam    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Melhorar minhas          │   │
│  │    habilidades          ✓   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👥 Conhecer novos           │   │
│  │    jogadores            ✓   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏆 Competir em torneios     │   │
│  │                         ○   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💪 Manter-me ativo          │   │
│  │                         ○   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 😄 Diversão                 │   │
│  │                         ○   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     FINALIZAR         →     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Ação do Botão FINALIZAR

```typescript
const handleFinish = async () => {
  setLoading(true);
  
  try {
    // 1. Salvar dados do onboarding no Supabase
    await supabase
      .from('profiles')
      .update({
        sports: selectedSports,
        sport_levels: levels,
        play_frequency: frequency,
        goals: selectedGoals,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // 2. Navegar para Home
    router.replace('/(tabs)');
    
  } catch (error) {
    Alert.alert('Erro', 'Falha ao salvar dados');
  } finally {
    setLoading(false);
  }
};
```

---

## 2.4 ESQUECI SENHA (`/forgot-password`)

### Layout
```
┌─────────────────────────────────────┐
│  ←                                  │
├─────────────────────────────────────┤
│                                     │
│  🔐                                 │
│                                     │
│  Esqueceu sua senha?               │
│  Digite seu email e enviaremos     │
│  um link para redefinir.           │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐   │
│  │ seu@email.com               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     ENVIAR LINK             │   │
│  └─────────────────────────────┘   │
│                                     │
│     Lembrou a senha? Entre         │
│                                     │
└─────────────────────────────────────┘
```

```typescript
const handleResetPassword = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'kourt://reset-password',
  });

  if (error) {
    Alert.alert('Erro', error.message);
    return;
  }

  Alert.alert(
    'Email enviado',
    'Verifique sua caixa de entrada para redefinir sua senha.'
  );
  router.back();
};
```

---

## 2.5 AUTH STORE (Zustand)

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: any; isFirstLogin?: boolean }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any; isFirstLogin?: boolean }>;
  signInWithApple: () => Promise<{ error?: any; isFirstLogin?: boolean }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    set({
      user: session?.user ?? null,
      session,
      loading: false,
      initialized: true,
    });

    // Listener para mudanças de auth
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
      });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      return { error };
    }

    // Verificar onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    set({
      user: data.user,
      session: data.session,
      loading: false,
    });

    return { isFirstLogin: !profile?.onboarding_completed };
  },

  signUp: async (email, password, metadata) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) {
      set({ loading: false });
      return { error };
    }

    // Criar perfil
    await supabase.from('profiles').insert({
      id: data.user!.id,
      ...metadata,
      onboarding_completed: false,
    });

    set({
      user: data.user,
      session: data.session,
      loading: false,
    });

    return {};
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    return { error };
  },

  signInWithApple: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
```

---

**Continua na PARTE 3: Telas Principais (Home, Mapa, Social, Perfil)**
