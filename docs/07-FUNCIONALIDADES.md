# ⚡ ETAPA 7 - FUNCIONALIDADES AVANÇADAS

> **Tempo estimado: 4-6 horas**

---

## PROMPT 7.1 - Integrar Mapas Real

```
Vamos integrar mapas de verdade na tela de busca:

1. Instale as dependências:
   npx expo install react-native-maps expo-location

2. Configure as permissões no app.json:
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Kourt precisa da sua localização para mostrar quadras próximas."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Kourt precisa da sua localização para mostrar quadras próximas."
      }
    },
    "android": {
      "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
    }
  }
}

3. Crie um hook hooks/useLocation.ts:
- Pedir permissão de localização
- Retornar coordenadas atuais
- Estado de loading e erro

4. Atualize app/(tabs)/map.tsx:
- Usar MapView do react-native-maps
- Centralizar na localização do usuário
- Mostrar marcadores das quadras do banco
- Ao clicar no marcador, mostrar card da quadra

Me mostre os arquivos completos.
```

---

## PROMPT 7.2 - Sistema de Reservas

```
Implemente o sistema de reservas completo:

1. Crie hooks/useBookings.ts com:
   - useMyBookings() - lista reservas do usuário
   - useCreateBooking() - mutation para criar reserva
   - useCancelBooking() - mutation para cancelar

2. Atualize app/court/[id].tsx:
   - Tab "Horários" mostra horários reais
   - Buscar disponibilidade do banco
   - Marcar horários reservados como indisponíveis
   - Ao selecionar horário, ir para checkout

3. Atualize app/checkout.tsx:
   - Receber court_id, date, time via params
   - Calcular preço total
   - Chamar createBooking na confirmação
   - Navegar para booking-confirmed

4. Atualize app/(tabs)/bookings.tsx:
   - Buscar reservas reais do banco
   - Mostrar loading state
   - Pull to refresh

Me mostre os arquivos atualizados.
```

---

## PROMPT 7.3 - Sistema de Pagamento (Stripe)

```
Vamos integrar pagamentos com Stripe:

1. Crie conta no Stripe (stripe.com)
2. Pegue as chaves de teste (pk_test_xxx e sk_test_xxx)

3. Instale as dependências:
   npm install @stripe/stripe-react-native
   npx expo install expo-build-properties

4. Configure no app.json:
{
  "plugins": [
    [
      "@stripe/stripe-react-native",
      {
        "merchantIdentifier": "merchant.com.kourt",
        "enableGooglePay": true
      }
    ]
  ]
}

5. Crie lib/stripe.ts:
- Inicializar Stripe com publishable key
- Função para criar PaymentIntent (via Edge Function)
- Função para confirmar pagamento

6. Crie uma Edge Function no Supabase para criar PaymentIntent:
- Receber amount e currency
- Usar secret key do Stripe
- Retornar client_secret

7. Atualize app/payment.tsx:
- Usar StripeProvider
- Mostrar CardField para input do cartão
- Confirmar pagamento
- Atualizar status da reserva

Me guie passo a passo.
```

---

## PROMPT 7.4 - Chat em Tempo Real

```
Implemente chat usando Supabase Realtime:

1. Crie as tabelas no Supabase:

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

2. Crie hooks/useChat.ts:
- useConversations() - lista conversas do usuário
- useMessages(conversationId) - mensagens com realtime subscription
- useSendMessage() - enviar mensagem

3. Crie app/chat/[id].tsx:
- Header com info do outro usuário
- Lista de mensagens (FlatList invertida)
- Input de mensagem no bottom
- Enviar ao pressionar botão ou Enter
- Mensagens aparecem em tempo real

Me mostre a implementação completa.
```

---

## PROMPT 7.5 - Push Notifications

```
Configure push notifications:

1. Instale as dependências:
   npx expo install expo-notifications expo-device

2. Crie lib/notifications.ts:
- Função para registrar device token
- Função para pedir permissão
- Função para agendar notificação local

3. Crie uma Edge Function para enviar push:
- Receber user_id e message
- Buscar token do usuário
- Enviar via Expo Push API

4. No app/_layout.tsx:
- Pedir permissão ao iniciar
- Registrar token no banco
- Configurar handlers de notificação

5. Enviar notificações quando:
- Nova reserva confirmada
- Convite para partida
- Mensagem no chat
- Lembrete 1h antes da partida

Me mostre a implementação.
```

---

## PROMPT 7.6 - Sistema de Ranking

```
Implemente o sistema de ranking:

1. Crie tabela de ranking no Supabase:

CREATE TABLE public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  rank_position INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sport_id)
);

2. Crie função para atualizar ranking após partida:
- Sistema ELO simplificado
- Vencedor ganha pontos, perdedor perde
- Atualizar posições

3. Crie hooks/useRankings.ts:
- useRanking(sportId) - ranking do esporte
- useMyRanking() - posição do usuário
- useChallengePlayer() - desafiar jogador

4. Atualize a tela de rankings:
- Tab por esporte
- Lista com posição, avatar, nome, pontos
- Destacar posição do usuário
- Botão "Desafiar" ao lado de cada jogador

Me mostre a implementação.
```

---

## PROMPT 7.7 - Estatísticas e Gráficos

```
Adicione gráficos de estatísticas:

1. Instale react-native-chart-kit ou victory-native:
   npm install react-native-chart-kit

2. Crie componentes de gráfico:
- LineChart: partidas por semana
- PieChart: distribuição de esportes
- BarChart: vitórias vs derrotas
- ProgressRing: win rate

3. Crie hooks/useStats.ts:
- useMyStats() - estatísticas do usuário
- useMatchHistory() - histórico de partidas
- useWeeklyProgress() - progresso semanal

4. Atualize app/(tabs)/profile.tsx tab Estatísticas:
- Gráfico de linha: últimas 8 semanas
- Cards: total partidas, vitórias, win rate
- Distribuição por esporte (pizza)
- Evolução do ranking (linha)

Me mostre a implementação.
```

---

## PROMPT 7.8 - Gamificação (XP e Conquistas)

```
Implemente o sistema de gamificação:

1. Crie tabela de conquistas:

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT, -- matches, wins, streak, etc
  requirement_value INTEGER
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

2. Insira conquistas iniciais:
- "Primeira Partida" - jogar 1 partida (100 XP)
- "Iniciante" - jogar 10 partidas (250 XP)
- "Em Chamas" - 3 vitórias seguidas (150 XP)
- "Dedicado" - jogar 7 dias seguidos (300 XP)
- "Social" - convidar 5 amigos (200 XP)

3. Crie função para verificar conquistas após cada ação

4. Crie sistema de níveis:
- Nível = XP / 1000
- Mostrar barra de progresso

5. Atualize o perfil para mostrar conquistas

Me mostre a implementação.
```

---

## PROMPT 7.9 - Busca e Filtros

```
Melhore a busca de quadras:

1. Crie componente SearchBar com:
- Input com ícone
- Debounce de 300ms
- Histórico de buscas recentes
- Sugestões enquanto digita

2. Crie componente FilterSheet (BottomSheet) com:
- Esportes (chips múltipla seleção)
- Faixa de preço (slider range)
- Distância (slider: 1km, 5km, 10km, 20km)
- Avaliação mínima (estrelas)
- Comodidades (checkboxes)
- Disponibilidade (hoje, amanhã, esta semana)

3. Crie hook useCourtSearch:
- Recebe query e filters
- Busca com full-text search no Supabase
- Ordena por relevância e distância
- Pagination

4. Atualize app/(tabs)/map.tsx:
- Integrar busca e filtros
- Mostrar número de resultados
- Atualizar marcadores conforme filtro

Me mostre a implementação.
```

---

## PROMPT 7.10 - Pull to Refresh e Infinite Scroll

```
Adicione melhorias de UX nas listas:

1. Pull to Refresh em:
- Home (próximas partidas)
- Feed social
- Lista de reservas
- Notificações

Use RefreshControl do React Native:
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      colors={['#000']}
    />
  }
/>

2. Infinite Scroll em:
- Lista de quadras
- Feed de atividades
- Lista de avaliações
- Histórico de partidas

Use onEndReached e onEndReachedThreshold:
<FlatList
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
/>

3. Crie hook usePaginatedQuery para reutilizar

Me mostre a implementação do hook e exemplo de uso.
```

---

## ✅ CHECKLIST ETAPA 7

- [ ] Mapas integrados com localização real
- [ ] Sistema de reservas funcionando
- [ ] Pagamentos com Stripe (ambiente teste)
- [ ] Chat em tempo real
- [ ] Push notifications configuradas
- [ ] Sistema de ranking
- [ ] Gráficos de estatísticas
- [ ] Gamificação (XP, conquistas)
- [ ] Busca e filtros avançados
- [ ] Pull to refresh e infinite scroll

---

## 🚨 DICAS

### Stripe em desenvolvimento:
```
Use cartões de teste:
- 4242 4242 4242 4242 (sucesso)
- 4000 0000 0000 0002 (recusado)
```

### Realtime do Supabase:
```
Lembre-se de habilitar Realtime nas tabelas:
1. Vá em Database > Replication
2. Selecione as tabelas que precisam de realtime
3. Clique em "Add table to publication"
```

### Push Notifications:
```
Push só funciona em dispositivo físico, não no simulador.
Para testar, use a ferramenta de push do Expo.
```

---

## PRÓXIMA ETAPA

Quando as funcionalidades estiverem prontas, vá para:
**`08-FINALIZACAO.md`**
