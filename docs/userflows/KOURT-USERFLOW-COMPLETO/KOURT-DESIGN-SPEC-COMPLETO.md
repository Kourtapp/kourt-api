# 🎯 PROMPT COMPLETO - KOURT APP REACT NATIVE
## Especificação Ultra-Detalhada para Recriar o Design Exato

> **Este documento contém CADA DETALHE do design do Kourt App Preview v5**
> Use este prompt com Claude, Cursor ou qualquer IA para gerar código idêntico ao protótipo.

---

# PARTE 1: CONFIGURAÇÃO DO PROJETO

## 1.1 Criar Projeto
```bash
npx create-expo-app@latest kourt-app --template tabs
cd kourt-app
```

## 1.2 Instalar Dependências
```bash
npx expo install nativewind tailwindcss react-native-reanimated react-native-gesture-handler react-native-safe-area-context @react-navigation/native @react-navigation/bottom-tabs expo-linear-gradient
npm install zustand
```

## 1.3 Configurar Tailwind (tailwind.config.js)
```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'display': ['System'],
      },
      colors: {
        'bg': '#fafafa',
        'lime': {
          500: '#84cc16',
          950: '#1a2e05',
        }
      }
    },
  },
  plugins: [],
}
```

---

# PARTE 2: DESIGN SYSTEM COMPLETO

## 2.1 CORES (EXATAS)

### Cores Principais
| Nome | Hex | Uso |
|------|-----|-----|
| **Preto** | `#000000` | Botões primários, textos principais, cards de destaque |
| **Branco** | `#FFFFFF` | Backgrounds principais, textos em fundos escuros |
| **Fundo App** | `#FAFAFA` | Background geral das telas |

### Escala de Cinzas (Neutral)
| Nome | Hex | Uso |
|------|-----|-----|
| **neutral-50** | `#FAFAFA` | Background de cards sutis |
| **neutral-100** | `#F5F5F5` | Background de inputs, ícones |
| **neutral-200** | `#E5E5E5` | Bordas de cards, divisores |
| **neutral-300** | `#D4D4D4` | Bordas de inputs inativos |
| **neutral-400** | `#A3A3A3` | Textos terciários, ícones inativos |
| **neutral-500** | `#737373` | Textos secundários |
| **neutral-600** | `#525252` | Textos em cards |
| **neutral-800** | `#262626` | Gradientes escuros |
| **neutral-900** | `#171717` | Gradientes muito escuros |

### Cores de Destaque
| Nome | Hex | Uso |
|------|-----|-----|
| **Verde Lime** | `#84CC16` | Botões "Entrar", destaques esportivos, coach marks |
| **Verde Lime Escuro** | `#1A2E05` | Texto em botões lime |
| **Âmbar-400** | `#FBBF24` | Ícones de fogo, rankings |
| **Âmbar-500** | `#F59E0B` | Badges PRO, troféus |
| **Verde-400** | `#4ADE80` | Status online, vitórias |
| **Verde-500** | `#22C55E` | Badges de sucesso |
| **Azul-500** | `#3B82F6` | Desafio diário |
| **Cyan-500** | `#06B6D4` | Gradiente desafio |
| **Vermelho-500** | `#EF4444` | Badge "Lotada", alertas |
| **Roxo-600** | `#9333EA` | Desafio explorador |

## 2.2 TIPOGRAFIA

### Fonte
- **Família**: System Font (San Francisco iOS / Roboto Android)
- **Fallback**: Lexend (se quiser custom font)

### Tamanhos
| Estilo | Tamanho | Peso | Line Height | Uso |
|--------|---------|------|-------------|-----|
| **Display** | 24px | Bold (700) | 1.2 | Títulos de onboarding |
| **Title** | 20px | Bold (700) | 1.3 | Títulos de seção |
| **Headline** | 18px | Bold (700) | 1.3 | Headers de tela |
| **Subtitle** | 16px | Semibold (600) | 1.4 | Subtítulos |
| **Body** | 14px | Regular (400) | 1.5 | Texto geral |
| **Body Semibold** | 14px | Semibold (600) | 1.5 | Labels importantes |
| **Caption** | 12px | Regular (400) | 1.4 | Textos secundários |
| **Small** | 11px | Medium (500) | 1.3 | Badges, tags |
| **Tiny** | 10px | Medium (500) | 1.2 | Badges pequenos, XP |
| **Micro** | 9px | Bold (700) | 1.1 | Labels minúsculos |

## 2.3 ESPAÇAMENTOS

### Padding/Margin
| Nome | Valor | Uso |
|------|-------|-----|
| **px-5** | 20px | Padding horizontal padrão das telas |
| **py-4** | 16px | Padding vertical de headers |
| **p-4** | 16px | Padding interno de cards |
| **p-3** | 12px | Padding interno de cards menores |
| **gap-3** | 12px | Espaçamento entre cards em scroll |
| **gap-2** | 8px | Espaçamento entre elementos |
| **gap-1** | 4px | Espaçamento entre ícone e texto |
| **mb-6** | 24px | Margin bottom de seções |
| **mb-5** | 20px | Margin bottom de blocos |
| **mb-3** | 12px | Margin bottom de títulos |
| **mb-2** | 8px | Margin bottom de subtítulos |

### Border Radius
| Valor | Uso |
|-------|-----|
| **rounded-full** (9999px) | Botões pill, badges, avatares |
| **rounded-2xl** (16px) | Cards grandes, botões primários |
| **rounded-xl** (12px) | Cards médios, ícones |
| **rounded-lg** (8px) | Inputs, botões secundários |

## 2.4 SOMBRAS

```css
/* Card elevation sutil */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)

/* Card elevation média */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

/* Card elevation alta (pins do mapa) */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* iPhone frame */
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15)
```

## 2.5 ÍCONES

### Biblioteca
- **Material Symbols Outlined** (Google)
- Weight: 300
- Optical Size: 24
- Fill: 0 (outline) ou 1 (preenchido para ativo)

### Ícones Principais Usados
```
home, map, forum, person, add, search, notifications,
sports_tennis, sports_soccer, sports_basketball, sports_volleyball, sports_handball,
star, near_me, schedule, group, verified, check, arrow_back, arrow_forward,
emoji_events, local_fire_department, military_tech, flag, workspace_premium,
leaderboard, auto_awesome, explore, thumb_up, bolt, lock,
tune, payments, check_circle, info, keyboard_arrow_right
```

---

# PARTE 3: COMPONENTES BASE

## 3.1 STATUS BAR (iOS)
```
Posição: absolute top-0
Altura: 50px
Padding: px-8 pb-2
Conteúdo:
  - Esquerda: "9:41" (text-sm font-semibold text-black)
  - Direita: ícones (signal_cellular_alt, wifi, battery_full) text-base
Z-index: 40
```

## 3.2 TAB BAR (Navegação Inferior)
```
Posição: absolute bottom-0
Altura: 84px
Background: white
Border: border-t border-neutral-100
Padding: pt-2 pb-6 px-8
Layout: flex justify-between items-start

Itens (5):
1. Home - ícone home (ativo: text-black, inativo: text-neutral-400)
2. Mapa - ícone map
3. CENTRAL (+) - botão elevado:
   - Container: relative -mt-5
   - Botão: w-14 h-14 bg-black rounded-full shadow-lg
   - Ícone: add text-3xl text-white
4. Social - ícone forum
5. Perfil - ícone person

Label: text-[10px] font-medium
Gap ícone/label: gap-1
```

## 3.3 HEADER DE TELA
```
Container: px-5 py-4 flex items-center gap-3
Border: border-b border-neutral-100
Background: white ou transparent

Botão Voltar:
  - Container: w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center
  - Ícone: arrow_back text-black

Título: text-lg font-bold text-black
```

## 3.4 PROGRESS BAR (Onboarding)
```
Container: flex gap-1.5
Cada step:
  - Tamanho: w-10 h-1.5
  - Ativo: bg-black rounded-full
  - Inativo: bg-neutral-200 rounded-full
Total: 5 steps
```

## 3.5 BOTÃO PRIMÁRIO
```
Container: w-full py-4 rounded-2xl flex items-center justify-center gap-2
Background: bg-black
Texto: text-white font-semibold text-[15px]
Ícone (opcional): arrow_forward text-xl
```

## 3.6 BOTÃO SECUNDÁRIO
```
Container: w-full py-4 rounded-2xl flex items-center justify-center
Background: bg-white
Border: border border-neutral-200
Texto: text-black font-semibold text-[15px]
```

## 3.7 BOTÃO PILL (Filtro)
```
Ativo:
  - Container: px-4 py-2.5 rounded-full
  - Background: bg-black
  - Texto: text-white text-sm font-medium
  - Ícone: text-lg text-white

Inativo:
  - Background: bg-white
  - Border: border border-neutral-200
  - Texto: text-black text-sm font-medium
```

## 3.8 INPUT DE TEXTO
```
Container: bg-neutral-100 rounded-xl px-4 py-3.5
Placeholder: text-neutral-400 text-sm
Texto: text-black text-sm
Focus: border-2 border-black
```

## 3.9 TOGGLE SWITCH
```
Container: w-11 h-6 rounded-full relative cursor-pointer
Inativo: bg-neutral-200
Ativo: bg-black

Knob:
  - Posição: absolute top-0.5 left-0.5
  - Tamanho: w-5 h-5
  - Background: bg-white
  - Border: rounded-full shadow-sm
  - Ativo: translateX(18px)
```

---

# PARTE 4: CARDS E COMPONENTES ESPECÍFICOS

## 4.1 COURT CARD (Quadra)
```
Container: w-[260px] bg-white border border-neutral-200 rounded-2xl overflow-hidden

Imagem:
  - Altura: h-28
  - Background: bg-neutral-200 ou bg-neutral-300
  - Badges posição absolute:
    - Top-left (tipo): top-3 left-3 px-2.5 py-1 bg-black text-white rounded-full text-[10px] font-medium
    - Top-right (distância): top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-semibold text-black

Conteúdo (p-3):
  - Título: font-semibold text-black text-sm mb-1
  - Info row: flex items-center gap-2 text-xs text-neutral-500 mb-2
    - Rating: flex items-center gap-1 text-black (star icon + number)
    - Separador: "·"
    - Esporte: text
  - Footer: flex items-center justify-between
    - Left: flex items-center gap-1 text-[11px] text-neutral-600 (icon + text)
    - Right: text-xs font-semibold text-black (preço)
```

## 4.2 PLAYER SUGGESTION CARD
```
Container: w-[130px] bg-white border border-neutral-200 rounded-2xl p-3 text-center

Avatar:
  - Container: relative mx-auto w-fit mb-2
  - Círculo: w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center
  - Ícone: material-symbols person text-neutral-400 text-xl
  - Online dot: absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white

Nome: font-semibold text-black text-[13px] mb-0.5

Esporte row: flex items-center justify-center gap-1 text-neutral-400 mb-1.5
  - Ícone: text-[12px]
  - Texto: text-[11px]

Subtítulo: text-[11px] text-neutral-400 mb-3

Botão: w-full py-1.5 bg-black text-white text-[11px] font-medium rounded-full
```

## 4.3 CHALLENGE CARD (Desafio)
```
Container: w-[200px] bg-white border border-neutral-200 rounded-2xl p-3

Header: flex items-center justify-between mb-2
  - Ícone: w-10 h-10 bg-[cor] rounded-xl flex items-center justify-center
    - Cores por tipo: blue-600, green-600, black, purple-600
  - Badge XP: px-2 py-0.5 bg-[cor]-100 text-[cor]-600 text-[9px] font-bold rounded

Título: font-semibold text-black text-sm mb-1
Descrição: text-[11px] text-neutral-500 mb-2

Progress bar:
  - Container: h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-1
  - Fill: h-full bg-[cor]-500 rounded-full style="width: X%"

Progress text: text-[10px] text-neutral-500 (ou text-green-600 font-medium se completo)
```

## 4.4 BADGE/CONQUISTA
```
Container: flex flex-col items-center

Ícone:
  - Container: w-16 h-16 bg-[cor] rounded-2xl flex items-center justify-center shadow-lg
  - Cores: black, blue-600, gradient green-400 to emerald-500
  - Ícone: material-symbols text-white text-3xl
  - Badge NOVO: absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded

Locked:
  - Container: opacity-40
  - Background: bg-neutral-300
  - Ícone: lock text-neutral-500

Label: text-[10px] text-black font-medium mt-1.5
Sublabel: text-[9px] text-neutral-400
```

## 4.5 GAMIFICATION CARD (Nível/XP)
```
Container: bg-gradient-to-r from-black to-neutral-800 rounded-2xl p-4

Header: flex items-center gap-3 mb-3
  - Nível box: w-12 h-12 bg-black rounded-xl flex items-center justify-center
    - Número: text-white font-bold text-lg
  - Info:
    - Row: flex items-center gap-2 mb-1
      - Título: text-white font-bold "Nível X"
      - Badge: px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full "PRO"
    - XP text: text-xs text-neutral-400
  - Ícone direita: w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center
    - Icon: emoji_events text-white

XP Bar:
  - Container: h-2 bg-white/10 rounded-full overflow-hidden mb-3
  - Fill: h-full bg-black rounded-full

Stats row: flex items-center justify-between
  - Stats: flex items-center gap-4
    - Item: flex items-center gap-1.5
      - Ícone: text-amber-400 ou text-green-400 text-sm
      - Texto: text-white text-xs font-medium
  - Botão: px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white font-medium
```

## 4.6 DAILY CHALLENGE CARD
```
Container: bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4

Header: flex items-center justify-between mb-2
  - Left: flex items-center gap-2
    - Ícone: bolt text-white
    - Título: text-white font-bold text-sm
  - Right: px-2 py-1 bg-white/20 rounded-full text-[10px] text-white font-bold "+150 XP"

Descrição: text-white/80 text-xs mb-3

Progress: flex items-center gap-2
  - Bar: flex-1 h-2 bg-white/20 rounded-full overflow-hidden
    - Fill: h-full bg-white rounded-full
  - Count: text-white text-xs font-bold "1/2"
```

## 4.7 RANKING CARD
```
Container: bg-white border border-neutral-200 rounded-2xl overflow-hidden

Header: p-4 border-b border-neutral-100
  - flex items-center justify-between
  - Left: flex items-center gap-2
    - Ícone: leaderboard text-amber-500 text-lg
    - Título: font-semibold text-black
  - Right: text-xs text-neutral-500 (esporte)

List: divide-y divide-neutral-100

Item normal:
  - Container: flex items-center gap-3 px-4 py-3
  - Posição: text-lg font-bold text-neutral-400 w-6
  - Avatar: w-10 h-10 rounded-full bg-neutral-300
  - Info:
    - Nome: text-sm font-medium text-black
    - Pontos: text-[10px] text-neutral-500

Item 1º lugar:
  - Container: bg-amber-50
  - Posição: text-amber-500
  - Badge: emoji_events text-amber-400

Item "Você":
  - Container: bg-black
  - Posição: text-white
  - Avatar: bg-white/20
  - Nome: text-white
  - Pontos: text-white/60
  - Badge direita: text-xs text-green-400 font-medium "↑ 2"
```

## 4.8 MATCH CARD (Partida Aberta)
```
Container: bg-white border border-neutral-200 rounded-2xl p-4 flex items-center gap-4

Ícone esporte: w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center
  - Icon: sports_tennis/soccer/basketball text-black text-2xl

Info (flex-1):
  - Título: font-semibold text-black text-sm "Esporte · Horário"
  - Subtítulo: text-xs text-neutral-500 "Local · Falta X"

Botão: px-4 py-2 bg-lime-500 text-lime-950 text-xs font-semibold rounded-full "Entrar"
```

---

# PARTE 5: TELAS DETALHADAS

## 5.1 TELA LOGIN

### Estrutura
```
Background: bg-white
Layout: flex flex-col h-full

Seções:
1. Logo Area (flex-1 center)
2. Form Area
3. Social Login
4. Footer Links
```

### Elementos

**Logo**
```
Container: flex-1 flex flex-col items-center justify-center
Título: text-4xl font-black tracking-tight text-black "KOURT"
Subtítulo: text-sm text-neutral-500 mt-2 "Seu app de esportes"
```

**Form**
```
Container: px-6 pb-6

Email Input:
  - Label: text-sm font-medium text-black mb-2
  - Input: w-full bg-neutral-100 rounded-xl px-4 py-3.5 text-sm

Senha Input:
  - Mesma estrutura
  - Ícone direita: visibility_off text-neutral-400

Forgot Password: text-right mt-2
  - Link: text-sm text-neutral-500

Botão Entrar: w-full py-4 bg-black text-white rounded-2xl font-semibold mt-6
```

**Social Login**
```
Container: px-6 pb-6

Divider: flex items-center gap-4 my-6
  - Linha: flex-1 h-px bg-neutral-200
  - Texto: text-sm text-neutral-400 "ou continue com"

Botões: flex gap-3
  - Google: flex-1 py-3.5 bg-white border border-neutral-200 rounded-xl flex items-center justify-center gap-2
  - Apple: mesma estrutura com ícone Apple
```

**Footer**
```
Container: px-6 pb-10
Texto: text-center text-sm text-neutral-500
Link: text-black font-semibold "Cadastre-se"
```

---

## 5.2 TELA HOME (Principal)

### Estrutura
```
Background: bg-[#fafafa]
Layout: screen-content h-full pt-[50px] pb-[84px]
Scroll: overflow-y-auto
```

### Seções em Ordem

**1. Header**
```
Container: bg-white px-5 pt-4 pb-3 sticky top-0 z-30

Row 1: flex items-start justify-between mb-4
  Left:
    - Greeting: text-sm text-neutral-500 "Olá,"
    - Name: text-2xl font-bold text-black "Bruno"
    - Location: flex items-center gap-1 mt-1
      - Ícone: location_on text-neutral-400 text-sm
      - Texto: text-sm text-neutral-500 "São Paulo, SP"
  Right: flex items-center gap-2
    - Search btn: w-11 h-11 bg-neutral-100 rounded-full flex items-center justify-center
      - Ícone: search text-black
    - Notification btn: mesma estrutura
      - Ícone: notifications
      - Badge: absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full
```

**2. Sport Filter Pills**
```
Container: mb-4

Label row: flex items-center gap-2 px-5 mb-2
  - Texto: text-xs text-neutral-500 "Seus esportes"
  - Ícone: info text-neutral-400 text-sm

Pills scroll: flex gap-2 px-5 overflow-x-auto pb-2
  - Pill ativo: shrink-0 flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-full text-sm font-medium
    - Ícone: sports_tennis text-lg
    - Texto: "BeachTennis"
  - Pill inativo: bg-white border border-neutral-200 text-black
```

**3. Gamification Card (Nível)**
```
Container: mx-5 mb-5
(Ver especificação do componente 4.5)
```

**4. Daily Challenge**
```
Container: mx-5 mb-5
(Ver especificação do componente 4.6)
```

**5. Seção "Quadras perto de você"**
```
Header: flex items-center justify-between px-5 mb-3
  Left: flex items-center gap-2
    - Ícone: near_me text-black text-lg
    - Título: text-base font-bold text-black
  Right: text-sm text-neutral-500 "Ver mapa"

Subtítulo: text-xs text-neutral-500 px-5 mb-3

Cards scroll: flex gap-3 px-5 overflow-x-auto pb-2
  - (Ver Court Card 4.1)
```

**6. Seção "Sugestões"**
```
Header: flex items-center justify-between px-5 mb-3
  - Título: text-base font-bold text-black
  - Link: text-sm text-neutral-500 "Ver todos"

Cards scroll: flex gap-3 px-5 overflow-x-auto pb-2
  - (Ver Player Suggestion Card 4.2)
```

**7. Seção "Partidas abertas"**
```
Header: mesma estrutura

Label: mx-5 mb-3
  - Container: inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-100 rounded-full
  - Dot: w-2 h-2 bg-lime-500 rounded-full animate-pulse
  - Texto: text-xs text-lime-700 font-medium "X partidas precisando de jogadores"

Cards: px-5 space-y-3
  - (Ver Match Card 4.8)
```

**8. Seção "Desafios da Semana"**
```
Header: mesma estrutura com ícone flag

Cards scroll: flex gap-3 px-5 overflow-x-auto pb-2
  - (Ver Challenge Card 4.3)
```

**9. Seção "Conquistas Recentes"**
```
Header: mesma estrutura com ícone workspace_premium

Cards scroll: flex gap-3 px-5 overflow-x-auto pb-2
  - (Ver Badge 4.4)
```

**10. Ranking Semanal**
```
Container: px-5 mb-6
(Ver Ranking Card 4.7)
```

**11. Tab Bar**
```
(Ver especificação 3.2)
```

---

## 5.3 TELA MAPA

### Estrutura
```
Background: bg-[#fafafa]
Layout: screen-content h-full pt-[50px] pb-[84px]
```

### Elementos

**Search Bar (Sticky)**
```
Container: sticky top-0 z-30 bg-white px-4 pt-3 pb-3 border-b border-neutral-100

Row 1: flex items-center gap-2 mb-3
  - Back btn: w-9 h-9 flex items-center justify-center
  - Search box: flex-1 flex items-center bg-white border border-neutral-300 rounded-full shadow-sm overflow-hidden
    - Content: flex-1 px-4 py-2.5
      - Título: text-sm font-medium text-black "Quadras por perto"
      - Subtítulo: text-xs text-neutral-500 "Qualquer horário · Todos esportes"
    - Filter btn: w-10 h-10 flex items-center justify-center border-l border-neutral-200
      - Ícone: tune text-black text-xl

Quick filters: flex gap-2 overflow-x-auto pb-1
  - Pills (ver 3.7)
```

**Map Area**
```
Container: relative h-[380px] bg-neutral-100

Background simulado:
  - Linhas horizontais: absolute top-X left-0 right-0 h-px bg-neutral-300
  - Linhas verticais: absolute top-0 bottom-0 left-X w-px bg-neutral-300
  - Label cidade: absolute center text-neutral-400 text-lg font-medium

Price Pins (Airbnb style):
  - Normal: px-3 py-1.5 bg-white rounded-full shadow-md border border-neutral-200 text-sm font-semibold text-black
  - Selecionado: bg-black text-white
  - Posições variadas com absolute
```

**Bottom Sheet (Lista)**
```
Container: bg-white rounded-t-3xl -mt-6 relative z-10

Handle: w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-3 mb-4

Header: px-5 flex items-center justify-between mb-3
  - Contador: text-base font-bold text-black "X quadras encontradas"
  - Toggle: Ver todas / Ver mapa

Lista: px-5 space-y-3
  - Cards de quadra (versão lista, não scroll)
```

---

## 5.4 TELA DETALHES DA QUADRA

### Estrutura
```
Background: bg-white
Layout: flex flex-col h-full
```

### Elementos

**Header com Imagem**
```
Container: relative h-64 bg-neutral-200

Overlay buttons: absolute top-[50px] left-0 right-0 px-5 flex justify-between
  - Back: w-10 h-10 bg-white/90 backdrop-blur rounded-full
  - Actions: flex gap-2
    - Share: mesma estrutura
    - Favorite: mesma estrutura (heart)

Gallery dots: absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5
  - Dot ativo: w-2 h-2 bg-white rounded-full
  - Dot inativo: w-2 h-2 bg-white/50 rounded-full
```

**Content**
```
Container: flex-1 overflow-y-auto

Info section: px-5 py-4
  - Badge: inline-flex px-3 py-1 bg-black text-white text-xs font-medium rounded-full mb-3
  - Título: text-2xl font-bold text-black mb-1
  - Localização: flex items-center gap-1 text-sm text-neutral-500 mb-3
  - Rating row: flex items-center gap-4
    - Stars: flex items-center gap-1
      - Icon: star text-amber-400
      - Número: text-sm font-semibold text-black
      - Reviews: text-sm text-neutral-500 "(127 avaliações)"
    - Distância: flex items-center gap-1 text-sm text-neutral-500

Amenities: px-5 py-4 border-t border-neutral-100
  - Título: text-base font-bold text-black mb-3
  - Grid: grid grid-cols-3 gap-3
    - Item: flex flex-col items-center p-3 bg-neutral-50 rounded-xl
      - Ícone: text-black text-xl
      - Label: text-xs text-neutral-600 mt-1

Horários: px-5 py-4 border-t border-neutral-100
  - Título: text-base font-bold text-black mb-1
  - Subtítulo: text-sm text-neutral-500 mb-3 (data selecionada)
  - Grid: grid grid-cols-4 gap-2
    - Slot disponível: py-3 bg-white border border-neutral-200 rounded-xl text-center
      - Hora: text-sm font-medium text-black
    - Slot selecionado: bg-black border-black text-white
    - Slot indisponível: bg-neutral-100 text-neutral-400 opacity-50
```

**Footer Fixo**
```
Container: px-5 py-4 bg-white border-t border-neutral-100

Row: flex items-center justify-between
  - Preço: 
    - Valor: text-2xl font-bold text-black "R$ 120"
    - Label: text-xs text-neutral-500 "/hora"
  - Botão: px-8 py-4 bg-black text-white font-semibold rounded-2xl "Reservar"
```

---

## 5.5 TELA PERFIL

### Estrutura
```
Background: bg-[#fafafa]
Layout: screen-content h-full pt-[50px] pb-[84px]
```

### Elementos

**Header**
```
Container: bg-white px-5 pt-4 pb-5

Avatar row: flex items-center gap-4 mb-4
  - Avatar: w-20 h-20 rounded-full bg-neutral-200
  - Info:
    - Nome: text-xl font-bold text-black
    - Username: text-sm text-neutral-500 "@username"
    - Verificado: flex items-center gap-1 mt-1
      - Icon: verified text-blue-500 text-sm
      - Texto: text-xs text-blue-500 "Verificado"

Stats row: flex items-center justify-between bg-neutral-50 rounded-2xl p-4
  - Stat item: flex-1 text-center
    - Valor: text-xl font-bold text-black
    - Label: text-xs text-neutral-500
  - Divisor: w-px h-8 bg-neutral-200
```

**Menu List**
```
Container: px-5 py-4

Section:
  - Título: text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3
  - Items: bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100

Menu item: flex items-center justify-between p-4
  - Left: flex items-center gap-3
    - Ícone container: w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center
    - Ícone: text-black
    - Label: font-medium text-black
  - Right: flex items-center gap-2
    - Badge (opcional): px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full
    - Arrow: keyboard_arrow_right text-neutral-400
```

---

## 5.6 TELAS DE SEGURANÇA

### Central de Segurança
```
Header verde: bg-lime-500 rounded-2xl p-5 mb-5
  - Título: text-lime-900/60 text-xs "Conta verificada"
  - Valor: text-lime-950 text-2xl font-bold "Tudo certo!"
  - Ícone: w-14 h-14 bg-white/20 rounded-2xl
  - Descrição: text-lime-900/70 text-sm
```

### Verificação de Telefone (OTP)
```
Ícone: w-16 h-16 bg-lime-500 rounded-2xl mx-auto mb-6
  - Icon: sms text-white text-3xl

Título: text-xl font-bold text-black text-center
Subtítulo: text-sm text-neutral-500 text-center

OTP inputs: flex justify-center gap-3 mb-6
  - Input: w-12 h-14 text-center text-2xl font-bold border-2 border-neutral-200 rounded-xl
  - Input ativo: border-black
  - Input preenchido: border-neutral-200 (com valor)

Reenviar: text-center text-sm text-neutral-500
  - Link: text-black font-semibold

Botão: w-full py-4 bg-black text-white rounded-2xl font-semibold
```

---

## 5.7 COACH MARKS (Tutorial)

### Overlay
```
Container: position absolute inset-0 z-100
Background: rgba(0, 0, 0, 0.6)
```

### Highlight
```
Container: position absolute (no elemento destacado)
Border-radius: 16px
Box-shadow: 0 0 0 3px rgba(163, 230, 53, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.6)
Animation: pulse 2s ease-in-out infinite
```

### Tooltip
```
Container: position absolute, bg-white rounded-[20px] p-5 max-w-[300px] shadow-xl

Arrow: ::before pseudo-element
  - w-5 h-5 bg-white rotate-45
  - Posição conforme direção (top/bottom/left)

Ícone: w-11 h-11 bg-lime-500 rounded-xl flex items-center justify-center mb-3
  - Icon: text-white

Título: font-bold text-black text-base mb-1
Descrição: text-sm text-neutral-600 mb-4

Footer: flex items-center justify-between
  - Progress dots: flex gap-1.5
    - Dot inativo: w-2 h-2 bg-neutral-200 rounded-full
    - Dot ativo: w-6 h-2 bg-lime-500 rounded
  - Botão: px-5 py-2.5 bg-lime-500 text-lime-950 font-semibold rounded-xl text-sm
```

### Skip Button
```
Container: position absolute top-[60px] right-5 z-103
Background: rgba(255, 255, 255, 0.15) backdrop-blur
Padding: px-4 py-2
Border-radius: rounded-full
Texto: text-white text-sm font-medium
```

---

# PARTE 6: DADOS MOCK

## 6.1 Usuário
```typescript
const user = {
  id: "1",
  name: "Bruno",
  username: "brunosilva",
  email: "bruno@email.com",
  phone: "+55 11 99999-1234",
  location: "São Paulo, SP",
  avatar: null,
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  matches: 165,
  wins: 112,
  winRate: 68,
  streak: 7,
  sports: ["beach-tennis", "padel"],
  verified: true,
  createdAt: "2024-01-15"
}
```

## 6.2 Quadras
```typescript
const courts = [
  {
    id: "1",
    name: "Arena Beach Tennis",
    type: "private", // private, public
    sport: "Beach Tennis",
    address: "Rua das Flores, 123 - Pinheiros",
    distance: "2.5 km",
    rating: 4.8,
    reviews: 127,
    price: 80, // null para gratuita
    priceLabel: "R$ 80/h",
    image: null,
    amenities: ["Estacionamento", "Vestiário", "Lanchonete"],
    availableSlots: ["08:00", "09:00", "14:00", "15:00", "16:00"],
    currentPlayers: 4,
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  // ... mais quadras
]
```

## 6.3 Partidas
```typescript
const matches = [
  {
    id: "1",
    sport: "beach-tennis",
    title: "Beach Tennis com amigos",
    date: "Hoje",
    time: "18:00",
    location: "Arena Beach",
    court: courts[0],
    players: [user],
    maxPlayers: 4,
    spotsLeft: 1,
    status: "open", // open, full, in-progress, completed
    createdBy: user
  },
  // ... mais partidas
]
```

## 6.4 Desafios
```typescript
const challenges = [
  {
    id: "1",
    title: "Maratonista",
    description: "Jogue 5 partidas esta semana",
    icon: "sports_tennis",
    color: "blue",
    xpReward: 150,
    progress: 3,
    total: 5,
    completed: false
  },
  // ... mais desafios
]
```

## 6.5 Conquistas
```typescript
const achievements = [
  {
    id: "1",
    title: "On Fire!",
    description: "10 vitórias",
    icon: "local_fire_department",
    color: "black",
    unlocked: true,
    isNew: true,
    unlockedAt: "2024-01-20"
  },
  // ... mais conquistas
]
```

---

# PARTE 7: ESTRUTURA DE ARQUIVOS

```
kourt-app/
├── app/
│   ├── _layout.tsx                 # Root layout
│   ├── index.tsx                   # Redirect to login ou home
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── sports.tsx
│   │   ├── level.tsx
│   │   ├── frequency.tsx
│   │   └── goals.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Tab navigator
│   │   ├── index.tsx               # Home
│   │   ├── map.tsx
│   │   ├── social.tsx
│   │   └── profile.tsx
│   ├── court/
│   │   └── [id].tsx
│   ├── booking/
│   │   ├── [courtId].tsx
│   │   ├── checkout.tsx
│   │   └── confirmed.tsx
│   ├── match/
│   │   ├── create.tsx
│   │   ├── [id].tsx
│   │   └── live/[id].tsx
│   ├── player/
│   │   └── [id].tsx
│   ├── chat/
│   │   └── [id].tsx
│   └── settings/
│       ├── index.tsx
│       ├── security.tsx
│       ├── verify-phone.tsx
│       └── privacy.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Toggle.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Avatar.tsx
│   ├── home/
│   │   ├── Header.tsx
│   │   ├── SportPills.tsx
│   │   ├── GamificationCard.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── CourtCard.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── MatchCard.tsx
│   │   ├── ChallengeCard.tsx
│   │   ├── AchievementBadge.tsx
│   │   └── RankingCard.tsx
│   ├── map/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPills.tsx
│   │   ├── PricePin.tsx
│   │   └── CourtBottomSheet.tsx
│   ├── court/
│   │   ├── ImageGallery.tsx
│   │   ├── InfoSection.tsx
│   │   ├── Amenities.tsx
│   │   ├── TimeSlots.tsx
│   │   └── BookingFooter.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── StatsRow.tsx
│   │   └── MenuItem.tsx
│   ├── onboarding/
│   │   ├── ProgressBar.tsx
│   │   ├── SportGrid.tsx
│   │   ├── LevelSelector.tsx
│   │   └── OptionCard.tsx
│   └── coach-marks/
│       ├── CoachOverlay.tsx
│       ├── CoachHighlight.tsx
│       ├── CoachTooltip.tsx
│       └── CoachManager.tsx
├── stores/
│   ├── useAuthStore.ts
│   ├── useUserStore.ts
│   ├── useBookingStore.ts
│   └── useCoachStore.ts
├── constants/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── icons.ts
├── data/
│   ├── user.ts
│   ├── courts.ts
│   ├── matches.ts
│   ├── challenges.ts
│   └── achievements.ts
├── types/
│   └── index.ts
├── utils/
│   ├── formatters.ts
│   └── validators.ts
├── tailwind.config.js
├── app.json
└── package.json
```

---

# PARTE 8: COMANDOS PARA EXECUTAR

```bash
# 1. Criar projeto
npx create-expo-app@latest kourt-app --template tabs
cd kourt-app

# 2. Instalar dependências
npx expo install nativewind tailwindcss
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install expo-linear-gradient
npm install zustand

# 3. Configurar Tailwind
npx tailwindcss init

# 4. Rodar
npx expo start --clear

# 5. Testar no dispositivo
npx expo start --tunnel
```

---

# INSTRUÇÕES FINAIS PARA A IA

Ao gerar o código:

1. **Use EXATAMENTE as cores especificadas** - não aproxime
2. **Use EXATAMENTE os tamanhos de fonte** - não arredonde
3. **Use EXATAMENTE os espaçamentos** - siga o sistema Tailwind
4. **Use Material Symbols Outlined** para ícones
5. **Mantenha a hierarquia visual** - preto para primário, cinza para secundário
6. **Verde Lime (#84CC16)** apenas para destaques esportivos e CTAs de "Entrar"
7. **Tab Bar** deve ter o botão central elevado (-mt-5)
8. **Todos os cards** devem ter border-neutral-200 e rounded-2xl
9. **Scroll horizontal** deve ter padding px-5 e gap-3
10. **Headers de seção** devem seguir o padrão: ícone + título bold + link "Ver todas"

O objetivo é que o app React Native seja **visualmente idêntico** ao protótipo HTML.
