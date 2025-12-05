# 🎯 KOURT APP - USERFLOW COMPLETO
## Frontend + Backend | Cada Tela, Cada Botão, Cada Função

> **DOCUMENTO MESTRE** - Especificação completa para implementação do Kourt App
> Baseado EXATAMENTE no Kourt App Preview v5

---

# ÍNDICE GERAL

1. **PARTE 1** - Estrutura, Navegação e Tab Bar (este arquivo)
2. **PARTE 2** - Fluxo de Autenticação e Onboarding
3. **PARTE 3** - Telas Principais (Home, Mapa, Social, Perfil)
4. **PARTE 4** - Fluxo de Reserva e Pagamento
5. **PARTE 5** - Fluxo de Partidas e Gamificação
6. **PARTE 6** - Backend Supabase Completo
7. **PARTE 7** - Comandos de Terminal para Implementação

---

# PARTE 1: ESTRUTURA E NAVEGAÇÃO

## 1.1 TAB BAR (NAVEGAÇÃO PRINCIPAL)

### Estrutura CORRETA (5 itens)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [Home]    [Mapa]    [+]    [Social]    [Perfil]          │
│    🏠         🗺️      ⬤        💬         👤               │
│                      ███                                    │
│                     (elevado)                               │
└─────────────────────────────────────────────────────────────┘
```

### Especificações Técnicas

| Posição | Nome | Ícone | Ação |
|---------|------|-------|------|
| 1 | **Home** | `home` (fill quando ativo) | Navega para `/(tabs)/index` |
| 2 | **Mapa** | `map` | Navega para `/(tabs)/map` |
| 3 | **Criar (+)** | `add` | Abre modal `/plus` (Menu de criação) |
| 4 | **Social** | `forum` | Navega para `/(tabs)/social` |
| 5 | **Perfil** | `person` | Navega para `/(tabs)/profile` |

### CSS da Tab Bar

```css
/* Container */
.tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 84px;
  background: #FFFFFF;
  border-top: 1px solid #F5F5F5;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding-top: 8px;
  z-index: 40;
}

/* Item normal */
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Item ativo */
.tab-item.active {
  color: #000000;
}

/* Item inativo */
.tab-item.inactive {
  color: #A3A3A3;
}

/* Ícone */
.tab-icon {
  font-size: 24px;
}

/* Label */
.tab-label {
  font-size: 10px;
  font-weight: 500;
}

/* Botão central (+) */
.tab-center {
  position: relative;
  margin-top: -20px;
}

.tab-center-button {
  width: 56px;
  height: 56px;
  background: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.tab-center-icon {
  font-size: 30px;
  color: #FFFFFF;
}
```

### React Native Implementation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
              name={focused ? 'home' : 'home-outlined'} 
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

// Componente do botão central
function CenterButton({ onPress }) {
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
```

---

## 1.2 ESTRUTURA DE ARQUIVOS COMPLETA

```
kourt-app/
├── app/
│   ├── _layout.tsx                    # Root layout
│   ├── index.tsx                      # Redirect inicial
│   │
│   ├── (auth)/                        # Grupo: Autenticação
│   │   ├── _layout.tsx
│   │   ├── login.tsx                  # Tela de login
│   │   ├── register.tsx               # Tela de cadastro
│   │   └── forgot-password.tsx        # Esqueci senha
│   │
│   ├── (onboarding)/                  # Grupo: Onboarding
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx                # Bem-vindo (step 1)
│   │   ├── sports.tsx                 # Escolher esportes (step 2)
│   │   ├── level.tsx                  # Nível por esporte (step 3)
│   │   ├── frequency.tsx              # Frequência (step 4)
│   │   └── goals.tsx                  # Objetivos (step 5)
│   │
│   ├── (tabs)/                        # Grupo: Tab Navigator
│   │   ├── _layout.tsx                # Tab bar config
│   │   ├── index.tsx                  # HOME
│   │   ├── map.tsx                    # MAPA
│   │   ├── plus.tsx                   # MENU + (modal)
│   │   ├── social.tsx                 # SOCIAL
│   │   └── profile.tsx                # PERFIL
│   │
│   ├── court/                         # Quadras
│   │   ├── [id].tsx                   # Detalhes da quadra
│   │   ├── gallery.tsx                # Galeria de fotos
│   │   └── reviews.tsx                # Avaliações
│   │
│   ├── booking/                       # Reservas
│   │   ├── [courtId].tsx              # Fluxo de reserva
│   │   ├── checkout.tsx               # Checkout/pagamento
│   │   ├── payment-method.tsx         # Método de pagamento
│   │   └── confirmed.tsx              # Confirmação
│   │
│   ├── match/                         # Partidas
│   │   ├── create.tsx                 # Criar partida
│   │   ├── [id].tsx                   # Detalhes da partida
│   │   ├── search-players.tsx         # Buscar jogadores
│   │   ├── checkin.tsx                # Check-in na quadra
│   │   ├── live/[id].tsx              # Placar ao vivo
│   │   └── register/                  # Registrar resultado
│   │       ├── score.tsx              # Step 1: Placar
│   │       ├── rate.tsx               # Step 2: Avaliar
│   │       ├── photos.tsx             # Step 3: Fotos
│   │       └── share.tsx              # Step 4: Compartilhar
│   │
│   ├── player/                        # Jogadores
│   │   ├── [id].tsx                   # Perfil público
│   │   └── stats.tsx                  # Estatísticas
│   │
│   ├── chat/                          # Chat
│   │   ├── index.tsx                  # Lista de conversas
│   │   └── [id].tsx                   # Conversa individual
│   │
│   ├── notifications.tsx              # Notificações
│   │
│   ├── rankings/                      # Rankings
│   │   ├── amateur.tsx                # Ranking amador
│   │   └── pro.tsx                    # Ranking PRO
│   │
│   ├── challenges/                    # Desafios
│   │   └── index.tsx                  # Lista de desafios
│   │
│   ├── achievements/                  # Conquistas
│   │   └── index.tsx                  # Lista de conquistas
│   │
│   ├── tournaments/                   # Torneios
│   │   └── index.tsx                  # Lista de torneios
│   │
│   ├── settings/                      # Configurações
│   │   ├── index.tsx                  # Menu principal
│   │   ├── edit-profile.tsx           # Editar perfil
│   │   ├── security.tsx               # Segurança
│   │   ├── privacy.tsx                # Privacidade
│   │   ├── subscription.tsx           # Assinatura PRO
│   │   └── help.tsx                   # Ajuda/FAQ
│   │
│   ├── security/                      # Segurança
│   │   ├── verify-phone.tsx           # Verificar telefone
│   │   ├── two-factor.tsx             # Configurar 2FA
│   │   └── alert.tsx                  # Alerta de segurança
│   │
│   └── referral.tsx                   # Indicações
│
├── components/
│   ├── ui/                            # Componentes base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Toggle.tsx
│   │   ├── Avatar.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TabPills.tsx
│   │   └── Modal.tsx
│   │
│   ├── layout/                        # Layout
│   │   ├── StatusBar.tsx
│   │   ├── Header.tsx
│   │   ├── TabBar.tsx
│   │   └── SafeArea.tsx
│   │
│   ├── home/                          # Componentes Home
│   │   ├── HomeHeader.tsx
│   │   ├── SportPills.tsx
│   │   ├── GamificationCard.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── CourtCard.tsx
│   │   ├── PlayerSuggestionCard.tsx
│   │   ├── OpenMatchCard.tsx
│   │   ├── ChallengeCard.tsx
│   │   ├── AchievementBadge.tsx
│   │   ├── RankingCard.tsx
│   │   └── SectionHeader.tsx
│   │
│   ├── map/                           # Componentes Mapa
│   │   ├── MapView.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPills.tsx
│   │   ├── PricePin.tsx
│   │   └── CourtBottomSheet.tsx
│   │
│   ├── social/                        # Componentes Social
│   │   ├── FeedPost.tsx
│   │   ├── PlayerCard.tsx
│   │   └── GroupCard.tsx
│   │
│   ├── court/                         # Componentes Quadra
│   │   ├── CourtHeader.tsx
│   │   ├── CourtInfo.tsx
│   │   ├── Amenities.tsx
│   │   ├── TimeSlotGrid.tsx
│   │   ├── ReviewCard.tsx
│   │   └── BookingFooter.tsx
│   │
│   ├── match/                         # Componentes Partida
│   │   ├── MatchCard.tsx
│   │   ├── ScoreInput.tsx
│   │   ├── PlayerSelector.tsx
│   │   └── LiveScore.tsx
│   │
│   ├── profile/                       # Componentes Perfil
│   │   ├── ProfileHeader.tsx
│   │   ├── StatsRow.tsx
│   │   ├── ActivityCard.tsx
│   │   └── MenuItem.tsx
│   │
│   ├── onboarding/                    # Componentes Onboarding
│   │   ├── ProgressDots.tsx
│   │   ├── SportGrid.tsx
│   │   ├── LevelSelector.tsx
│   │   └── OptionCard.tsx
│   │
│   └── coach-marks/                   # Tutorial
│       ├── CoachOverlay.tsx
│       ├── CoachHighlight.tsx
│       └── CoachTooltip.tsx
│
├── stores/                            # Zustand stores
│   ├── useAuthStore.ts
│   ├── useUserStore.ts
│   ├── useBookingStore.ts
│   ├── useMatchStore.ts
│   └── useCoachStore.ts
│
├── services/                          # API services
│   ├── supabase.ts                    # Cliente Supabase
│   ├── auth.ts                        # Autenticação
│   ├── courts.ts                      # Quadras
│   ├── bookings.ts                    # Reservas
│   ├── matches.ts                     # Partidas
│   ├── users.ts                       # Usuários
│   ├── chat.ts                        # Chat
│   └── payments.ts                    # Pagamentos (Stripe)
│
├── hooks/                             # Custom hooks
│   ├── useAuth.ts
│   ├── useLocation.ts
│   ├── useCourts.ts
│   └── useRealtime.ts
│
├── constants/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── icons.ts
│
├── types/
│   └── index.ts
│
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
└── assets/
    ├── images/
    └── fonts/
```

---

## 1.3 FLUXO DE NAVEGAÇÃO COMPLETO

### Diagrama de Navegação

```
                            ┌─────────────────┐
                            │   App Start     │
                            └────────┬────────┘
                                     │
                         ┌───────────▼───────────┐
                         │  Verificar Auth       │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │  Não Logado     │   │  Primeiro       │   │  Logado         │
    │  → Login        │   │  Acesso         │   │  → Home         │
    └────────┬────────┘   │  → Onboarding   │   └────────┬────────┘
             │            └────────┬────────┘            │
             │                     │                     │
             └──────────┬──────────┘                     │
                        │                                │
                        ▼                                ▼
              ┌─────────────────┐              ┌─────────────────┐
              │   Tab Bar       │◄─────────────│   Tab Bar       │
              └─────────────────┘              └─────────────────┘
                        │
        ┌───────┬───────┼───────┬───────┐
        ▼       ▼       ▼       ▼       ▼
      Home    Mapa     (+)   Social  Perfil
        │       │       │       │       │
        ▼       ▼       ▼       ▼       ▼
    [Stacks] [Stacks] [Modal] [Stacks] [Stacks]
```

### Rotas por Aba

#### HOME (/)
```
/ (index)
├── /notifications
├── /court/[id]
│   ├── /court/[id]/gallery
│   └── /court/[id]/reviews
├── /booking/[courtId]
│   ├── /booking/checkout
│   ├── /booking/payment-method
│   └── /booking/confirmed
├── /match/[id]
│   └── /match/[id]/live
├── /player/[id]
├── /rankings/amateur
├── /rankings/pro
├── /challenges
└── /achievements
```

#### MAPA (/map)
```
/map
├── /map/filters (modal)
├── /court/[id]
└── /booking/[courtId]
```

#### CRIAR (+) (/plus)
```
/plus (modal)
├── → /booking/[courtId] (Reservar Quadra)
├── → /match/create (Criar Partida)
├── → /match/checkin (Check-in)
└── → /match/search-players (Buscar Jogadores)
```

#### SOCIAL (/social)
```
/social
├── /social?tab=feed
├── /social?tab=players
├── /social?tab=groups
├── /player/[id]
├── /chat/[id]
└── /tournaments
```

#### PERFIL (/profile)
```
/profile
├── /profile/activities
├── /profile/achievements
├── /settings
│   ├── /settings/edit-profile
│   ├── /settings/security
│   │   ├── /security/verify-phone
│   │   └── /security/two-factor
│   ├── /settings/privacy
│   ├── /settings/subscription
│   └── /settings/help
└── /referral
```

---

## 1.4 AÇÕES DO BOTÃO CENTRAL (+)

### Menu que abre ao clicar no (+)

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎾  Reservar Quadra        │   │
│  │  Encontre e reserve         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⚽  Criar Partida          │   │
│  │  Organize um jogo           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📍  Check-in               │   │
│  │  Registre presença          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  👥  Buscar Jogadores       │   │
│  │  Encontre parceiros         │   │
│  └─────────────────────────────┘   │
│                                     │
│         [X] Fechar                  │
└─────────────────────────────────────┘
```

### Implementação do Menu (+)

```typescript
// app/(tabs)/plus.tsx
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const menuItems = [
  {
    id: 'reserve',
    icon: 'sports-tennis',
    title: 'Reservar Quadra',
    subtitle: 'Encontre e reserve',
    route: '/map',
    color: '#000000',
  },
  {
    id: 'create',
    icon: 'group-add',
    title: 'Criar Partida',
    subtitle: 'Organize um jogo',
    route: '/match/create',
    color: '#000000',
  },
  {
    id: 'checkin',
    icon: 'location-on',
    title: 'Check-in',
    subtitle: 'Registre presença',
    route: '/match/checkin',
    color: '#000000',
  },
  {
    id: 'search',
    icon: 'person-search',
    title: 'Buscar Jogadores',
    subtitle: 'Encontre parceiros',
    route: '/match/search-players',
    color: '#000000',
  },
];

export default function PlusScreen() {
  const handleClose = () => {
    router.back();
  };

  const handleItemPress = (route: string) => {
    router.replace(route);
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="flex-1 bg-black/50 justify-end"
    >
      <View className="bg-white rounded-t-3xl p-5 pb-10">
        {/* Handle */}
        <View className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-6" />
        
        {/* Menu Items */}
        <View className="space-y-3">
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemPress(item.route)}
              className="flex-row items-center p-4 bg-neutral-50 rounded-2xl"
            >
              <View className="w-12 h-12 bg-black rounded-xl items-center justify-center">
                <MaterialIcons name={item.icon} size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-black font-semibold text-base">
                  {item.title}
                </Text>
                <Text className="text-neutral-500 text-sm">
                  {item.subtitle}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
            </Pressable>
          ))}
        </View>

        {/* Close Button */}
        <Pressable
          onPress={handleClose}
          className="mt-6 py-4 bg-neutral-100 rounded-2xl items-center"
        >
          <Text className="text-black font-semibold">Fechar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
```

---

## 1.5 MAPEAMENTO DE TELAS DO PROTÓTIPO v5

| ID no HTML | Rota no App | Descrição |
|------------|-------------|-----------|
| `login` | `/login` | Tela de login |
| `register-new` | `/register` | Tela de cadastro |
| `onboard-1` | `/onboarding/welcome` | Onboarding: Bem-vindo |
| `onboard-2` | `/onboarding/sports` | Onboarding: Esportes |
| `onboard-3` | `/onboarding/level` | Onboarding: Nível |
| `onboard-4` | `/onboarding/frequency` | Onboarding: Frequência |
| `onboard-5` | `/onboarding/goals` | Onboarding: Objetivos |
| `home` | `/(tabs)/` | Home principal |
| `map` | `/(tabs)/map` | Mapa |
| `social` | `/(tabs)/social` | Social |
| `bookings` | `/bookings` | Minhas reservas |
| `notifications` | `/notifications` | Notificações |
| `player-profile-detailed` | `/(tabs)/profile` | Meu perfil |
| `plus` | `/(tabs)/plus` | Menu + |
| `map-filters` | `/map/filters` | Filtros do mapa |
| `court` | `/court/[id]` | Detalhes quadra privada |
| `court-public` | `/court/[id]` | Detalhes quadra pública |
| `court-gallery` | `/court/[id]/gallery` | Galeria da quadra |
| `court-reviews` | `/court/[id]/reviews` | Avaliações da quadra |
| `checkout` | `/booking/checkout` | Checkout |
| `payment-method` | `/booking/payment-method` | Método de pagamento |
| `booking-confirmed` | `/booking/confirmed` | Reserva confirmada |
| `search-players` | `/match/search-players` | Buscar jogadores |
| `checkin-confirmed` | `/match/checkin` | Check-in confirmado |
| `start-match` | `/match/[id]` | Iniciar partida |
| `record-match-v2` | `/match/[id]/live` | Placar ao vivo |
| `register` | `/match/register/score` | Registrar placar |
| `register-step2` | `/match/register/rate` | Avaliar jogadores |
| `register-step3` | `/match/register/photos` | Adicionar fotos |
| `register-step4` | `/match/register/share` | Compartilhar |
| `register-complete` | `/match/complete` | Partida completa |
| `match-statistics` | `/match/[id]/stats` | Estatísticas |
| `match-analysis` | `/match/[id]/analysis` | Análise IA |
| `match-history` | `/profile/activities` | Histórico partidas |
| `public-profile` | `/player/[id]` | Perfil jogador |
| `player-stats` | `/player/[id]/stats` | Stats jogador |
| `chat` | `/chat/[id]` | Chat |
| `profile-activities` | `/profile/activities` | Atividades |
| `profile-achievements` | `/achievements` | Conquistas |
| `challenges` | `/challenges` | Desafios |
| `tournaments` | `/tournaments` | Torneios |
| `referral` | `/referral` | Indicações |
| `ranking-amador` | `/rankings/amateur` | Ranking amador |
| `leaderboard` | `/rankings/pro` | Ranking PRO |
| `settings` | `/settings` | Configurações |
| `edit-profile` | `/settings/edit-profile` | Editar perfil |
| `privacy` | `/settings/privacy` | Privacidade |
| `subscription` | `/settings/subscription` | Assinatura |
| `faq` | `/settings/help` | Ajuda/FAQ |
| `forgot-password` | `/forgot-password` | Esqueci senha |
| `cancel-booking` | `/booking/cancel` | Cancelar reserva |
| `security-center` | `/settings/security` | Central segurança |
| `verify-identity` | `/security/verify-phone` | Verificar telefone |
| `security-alert` | `/security/alert` | Alerta de login |
| `scam-warning` | `/chat/warning` | Aviso de golpe |
| `two-factor` | `/security/two-factor` | Configurar 2FA |
| `report-user` | `/report` | Reportar usuário |

---

**Continua na PARTE 2: Fluxo de Autenticação e Onboarding**
