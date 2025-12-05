# 📱 ETAPA 5 - TELAS PRINCIPAIS

> **Tempo estimado: 4-6 horas**

---

## PROMPT 5.1 - Home Completa

```
Melhore a tela Home em app/(tabs)/index.tsx com todas as seções:

HEADER (fixo):
- "Kourt" à esquerda (logo ou texto estilizado)
- Ícone de sino (notificações) à direita com badge vermelho

CONTEÚDO (ScrollView):

1. SAUDAÇÃO:
   - "Bom dia, Bruno!" (baseado na hora)
   - Subtítulo: "Pronto para jogar?"

2. PRÓXIMA PARTIDA (Card destacado):
   - Se não houver: card "Nenhuma partida agendada" com botão "Agendar"
   - Se houver: 
     - Nome da quadra
     - Data e hora
     - Esporte e jogadores
     - Botão "Ver detalhes"

3. AÇÕES RÁPIDAS (Grid 2x2):
   - "Reservar Quadra" - ícone MapPin
   - "Criar Partida" - ícone Plus
   - "Convidar Amigos" - ícone Users
   - "Ver Ranking" - ícone Trophy

4. QUADRAS PERTO DE VOCÊ (Scroll horizontal):
   - Cards com:
     - Imagem da quadra (placeholder)
     - Nome
     - Distância
     - Preço/hora
     - Rating com estrela

5. ATIVIDADE RECENTE:
   - Lista de atividades dos amigos
   - Avatar, nome, ação, tempo
   - Ex: "Carlos jogou Beach Tennis há 2h"

Use dados mockados por enquanto.
Me mostre o código completo.
```

---

## PROMPT 5.2 - Tela Mapa

```
Crie a tela de Mapa em app/(tabs)/map.tsx:

ESTRUTURA:
- Mapa ocupando a tela toda
- Barra de busca flutuante no topo
- Filtros rápidos abaixo da busca
- Bottom sheet com lista de quadras

HEADER FLUTUANTE:
- Input de busca com ícone Search
- Placeholder: "Buscar quadras..."

FILTROS (Scroll horizontal, chips):
- "Todos" (selecionado por padrão)
- "Beach Tennis"
- "Padel"
- "Tênis"
- "Disponível agora"
- "Até 5km"

MAPA:
- Use react-native-maps
- Marcadores para cada quadra
- Localização do usuário (ponto azul)
- Ao clicar no marcador, mostrar preview

BOTTOM SHEET:
- Handle para arrastar
- Lista de quadras próximas
- Cada item: imagem, nome, distância, preço, rating
- Ao clicar, navegar para court/[id]

Por enquanto, use coordenadas mockadas de São Paulo.
Me mostre o código completo.
```

---

## PROMPT 5.3 - Tela Social

```
Crie a tela Social em app/(tabs)/social.tsx:

HEADER:
- Título "Comunidade"
- Ícone de busca à direita

TABS (2):
- "Feed" (ativo por padrão)
- "Amigos"

TAB FEED:
- Lista de atividades
- Cada item:
  - Avatar e nome do usuário
  - Tipo de atividade (jogou, reservou, conquistou)
  - Detalhes (quadra, placar, badge)
  - Tempo (há 2h)
  - Botões: curtir, comentar

TAB AMIGOS:
- Input de busca no topo
- Lista de amigos
- Cada item:
  - Avatar
  - Nome
  - Status (online/offline/jogando)
  - Último jogo
  - Botão "Convidar"

Use FlatList para performance.
Dados mockados.
Me mostre o código completo.
```

---

## PROMPT 5.4 - Tela Reservas

```
Crie a tela de Reservas em app/(tabs)/bookings.tsx:

HEADER:
- Título "Minhas Reservas"

TABS (3):
- "Próximas" (ativo)
- "Passadas"
- "Canceladas"

TAB PRÓXIMAS:
- Lista de reservas futuras
- Cada card:
  - Status badge (Confirmada/Pendente)
  - Imagem da quadra
  - Nome da quadra
  - Data e horário
  - Esporte
  - Número de jogadores
  - Botões: "Ver QR Code", "Cancelar"

TAB PASSADAS:
- Lista de reservas antigas
- Cada card igual, mas com:
  - Botão "Jogar novamente"
  - Link "Ver estatísticas"

TAB CANCELADAS:
- Lista de canceladas
- Motivo do cancelamento
- Valor reembolsado

Estado vazio:
- Ilustração
- Texto "Nenhuma reserva ainda"
- Botão "Encontrar quadras"

Me mostre o código completo.
```

---

## PROMPT 5.5 - Tela Perfil

```
Crie a tela de Perfil em app/(tabs)/profile.tsx:

HEADER:
- Título "Perfil"
- Ícone de configurações à direita

HERO (topo):
- Avatar grande (80px)
- Nome do usuário
- Username (@usuario)
- Bio curta (opcional)
- Botão "Editar perfil"

ESTATÍSTICAS (Grid 4 colunas):
- Partidas: 165
- Vitórias: 112
- Streak: 7 🔥
- Ranking: #42

ABAS:
- "Atividade"
- "Estatísticas"
- "Conquistas"

ABA ATIVIDADE:
- Lista de últimas atividades
- Similar ao feed mas só do usuário

ABA ESTATÍSTICAS:
- Gráfico de partidas por semana (placeholder)
- Win rate %
- Esporte favorito
- Quadra favorita

ABA CONQUISTAS:
- Grid de badges
- Conquistados: coloridos
- Bloqueados: cinza com cadeado

MENU INFERIOR:
- "Configurações"
- "Ajuda"
- "Sobre"
- "Sair" (vermelho)

Me mostre o código completo.
```

---

## PROMPT 5.6 - Detalhes da Quadra

```
Crie a tela de detalhes da quadra em app/court/[id].tsx:

HEADER:
- Transparente sobre a imagem
- Botão voltar (branco)
- Botão favoritar (coração)
- Botão compartilhar

HERO:
- Imagem grande da quadra (300px altura)
- Galeria com indicadores (dots)

CONTEÚDO:
- Nome da quadra (título grande)
- Endereço com ícone MapPin
- Rating (estrelas + número de avaliações)
- Tags: esportes disponíveis

TABS:
- "Sobre"
- "Horários"
- "Avaliações"

TAB SOBRE:
- Descrição
- Comodidades (grid de ícones): Estacionamento, Vestiário, Lanchonete, etc
- Mapa pequeno com localização
- Botão "Como chegar"

TAB HORÁRIOS:
- Seletor de data (horizontal scroll com dias)
- Lista de horários disponíveis
- Preço por horário
- Horários indisponíveis em cinza

TAB AVALIAÇÕES:
- Nota geral grande
- Barras de distribuição (5 a 1 estrela)
- Lista de avaliações
- Avatar, nome, nota, comentário, data

FOOTER FIXO:
- Preço: "A partir de R$ 80/hora"
- Botão "Reservar" (primary)

Me mostre o código completo.
```

---

## PROMPT 5.7 - Criar Partida

```
Crie a tela de criar partida (quando clica no +):

Opção 1: Modal/BottomSheet com opções:
- "Reservar Quadra"
- "Criar Jogo"
- "Partida Rápida"

Opção 2: Tela em app/create.tsx

TELA CRIAR JOGO:
- Header: "Criar Partida"
- Seleção de esporte (chips)
- Seleção de tipo: "Casual" ou "Ranqueada"
- Seleção de quadra (abre modal de busca)
- Data e hora (date picker)
- Número de jogadores (stepper: 2, 4, 6, etc)
- Descrição/notas (opcional)
- Toggle: "Aberto para convites"
- Botão "Convidar jogadores"
- Botão "Criar partida"

Me mostre o código completo.
```

---

## PROMPT 5.8 - Checkout e Pagamento

```
Crie o fluxo de checkout:

TELA 1 - app/checkout.tsx:
- Header: "Confirmar Reserva"
- Resumo da quadra selecionada
- Data e horário selecionados
- Seção "Jogadores" (adicionar/remover)
- Subtotal, taxas, total
- Seleção de pagamento (Cartão, PIX)
- Termos de cancelamento
- Botão "Confirmar e Pagar"

TELA 2 - app/payment.tsx:
- Header: "Pagamento"
- Se cartão: formulário de cartão
- Se PIX: QR Code e código copia-cola
- Timer de expiração (15 min)
- Botão "Pagar R$ XX"

TELA 3 - app/booking-confirmed.tsx:
- Ícone de sucesso (check verde)
- "Reserva Confirmada!"
- Resumo da reserva
- QR Code para check-in
- Botões: "Adicionar ao Calendário", "Convidar Amigos", "Ir para Home"

Me mostre os códigos completos.
```

---

## PROMPT 5.9 - Notificações

```
Crie a tela de notificações em app/notifications.tsx:

HEADER:
- Título "Notificações"
- Botão "Marcar todas como lidas"

FILTROS:
- "Todas"
- "Partidas"
- "Social"

LISTA:
- Agrupadas por: Hoje, Ontem, Esta semana
- Cada item:
  - Ícone colorido baseado no tipo
  - Título
  - Descrição
  - Tempo
  - Indicador de não lida (ponto azul)

TIPOS:
- Partida confirmada (ícone verde)
- Convite recebido (ícone azul)
- Novo seguidor (ícone roxo)
- Conquista (ícone amarelo)
- Lembrete (ícone laranja)

Swipe para arquivar/deletar.
Me mostre o código completo.
```

---

## PROMPT 5.10 - Configurações

```
Crie a tela de configurações em app/settings.tsx:

HEADER:
- Botão voltar
- Título "Configurações"

SEÇÕES:

1. CONTA:
   - Editar perfil
   - Alterar senha
   - Métodos de pagamento
   - Histórico de pagamentos

2. PREFERÊNCIAS:
   - Notificações (toggle)
   - Notificações de partidas (toggle)
   - Notificações de amigos (toggle)
   - Notificações de promoções (toggle)

3. PRIVACIDADE:
   - Perfil público (toggle)
   - Mostrar localização (toggle)
   - Quem pode me convidar

4. SOBRE:
   - Versão do app
   - Termos de uso
   - Política de privacidade
   - Avaliar o app
   - Ajuda

5. SESSÃO:
   - Sair (vermelho)
   - Deletar conta (vermelho, com confirmação)

Use SectionList para organizar.
Me mostre o código completo.
```

---

## ✅ CHECKLIST ETAPA 5

- [ ] Home completa com todas as seções
- [ ] Mapa funcionando (mesmo sem API de mapas real)
- [ ] Tela Social com Feed e Amigos
- [ ] Tela de Reservas com tabs
- [ ] Tela de Perfil com estatísticas
- [ ] Detalhes da quadra
- [ ] Fluxo de criar partida
- [ ] Fluxo de checkout
- [ ] Tela de notificações
- [ ] Tela de configurações
- [ ] Todas as telas navegando corretamente

---

## 🚨 DICAS

### Para o Mapa:
```
Por enquanto, use um View com background colorido simulando o mapa.
A integração real será na Etapa 7.
```

### Para os Dados:
```
Crie um arquivo mocks/data.ts com todos os dados falsos.
Isso facilita trocar por dados reais depois.
```

### Para Performance:
```
Use FlatList em vez de ScrollView para listas longas.
Use memo() em componentes de lista.
```

---

## PRÓXIMA ETAPA

Quando as telas principais estiverem prontas, vá para:
**`06-BACKEND-SUPABASE.md`**
