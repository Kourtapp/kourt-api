# 🎨 DESIGN SYSTEM - KOURT

> **Referência visual completa para o app**

---

## 1. CORES

### Paleta Principal

```typescript
export const Colors = {
  // Cores base
  primary: '#000000',      // Preto - botões, destaques
  background: '#FAFAFA',   // Fundo claro
  card: '#FFFFFF',         // Cards, modais
  
  // Texto
  text: {
    primary: '#000000',    // Títulos, texto principal
    secondary: '#737373',  // Subtítulos, descrições
    muted: '#A3A3A3',      // Placeholders, labels
    inverse: '#FFFFFF',    // Texto em fundo escuro
  },
  
  // Bordas e divisores
  border: '#E5E5E5',       // Bordas padrão
  borderLight: '#F5F5F5',  // Bordas sutis
  borderDark: '#D4D4D4',   // Bordas destacadas
  
  // Estados
  success: '#22C55E',      // Sucesso, vitória
  successLight: '#DCFCE7', // Fundo sucesso
  error: '#EF4444',        // Erro, derrota
  errorLight: '#FEE2E2',   // Fundo erro
  warning: '#F59E0B',      // Alerta
  warningLight: '#FEF3C7', // Fundo alerta
  info: '#3B82F6',         // Informação
  infoLight: '#DBEAFE',    // Fundo info
  
  // Neutros
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;
```

### Uso das Cores

| Elemento | Cor | Quando usar |
|----------|-----|-------------|
| Botão primário | `primary` (#000) | Ação principal da tela |
| Botão secundário | `neutral.100` | Ações secundárias |
| Fundo da tela | `background` | Todas as telas |
| Cards | `card` (#FFF) | Containers de conteúdo |
| Texto principal | `text.primary` | Títulos, texto importante |
| Texto secundário | `text.secondary` | Descrições, subtítulos |
| Borda padrão | `border` | Cards, inputs |
| Sucesso | `success` | Confirmações, vitórias |
| Erro | `error` | Erros, cancelamentos |

---

## 2. TIPOGRAFIA

### Fonte

**Família**: Inter (ou SF Pro no iOS, Roboto no Android)

```typescript
export const Typography = {
  // Tamanhos
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Pesos
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
```

### Estilos de Texto

```typescript
// Classes NativeWind equivalentes:

// Títulos
h1: 'text-2xl font-bold text-black'      // 24px, bold
h2: 'text-xl font-semibold text-black'   // 20px, semibold
h3: 'text-lg font-semibold text-black'   // 18px, semibold
h4: 'text-base font-semibold text-black' // 16px, semibold

// Corpo
body: 'text-sm text-black'               // 14px, regular
bodyLarge: 'text-base text-black'        // 16px, regular

// Auxiliares
caption: 'text-xs text-neutral-500'      // 12px, cinza
label: 'text-xs font-medium text-neutral-400 uppercase tracking-wide'
```

### Hierarquia de Títulos

| Nível | Tamanho | Peso | Uso |
|-------|---------|------|-----|
| H1 | 24px | Bold | Título de tela |
| H2 | 20px | Semibold | Seções principais |
| H3 | 18px | Semibold | Subseções |
| H4 | 16px | Semibold | Títulos de cards |
| Body | 14px | Regular | Texto padrão |
| Caption | 12px | Regular | Informações secundárias |
| Label | 10px | Medium | Labels, badges |

---

## 3. ESPAÇAMENTO

### Sistema de 4px

```typescript
export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const;
```

### Uso de Espaçamento

| Contexto | Valor | Tailwind |
|----------|-------|----------|
| Entre ícone e texto | 8px | `gap-2` |
| Padding de botão | 16px horizontal | `px-4` |
| Padding de card | 16px | `p-4` |
| Entre cards | 12px | `gap-3` |
| Entre seções | 24px | `my-6` |
| Margem da tela | 20px | `mx-5` |

---

## 4. BORDER RADIUS

```typescript
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;
```

### Uso de Border Radius

| Elemento | Valor | Tailwind |
|----------|-------|----------|
| Botões pequenos | 8px | `rounded-lg` |
| Botões normais | 12px | `rounded-xl` |
| Cards | 16px | `rounded-2xl` |
| Modais | 24px (top) | `rounded-t-3xl` |
| Avatares | 9999px | `rounded-full` |
| Inputs | 12px | `rounded-xl` |
| Badges | 4px | `rounded` |
| Chips | 9999px | `rounded-full` |

---

## 5. SOMBRAS

```typescript
export const Shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',      // Sutil
  md: 'shadow-md',      // Padrão
  lg: 'shadow-lg',      // Elevado
  xl: 'shadow-xl',      // Modal
} as const;

// Valores CSS equivalentes:
// shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
// shadow-md: 0 4px 6px rgba(0,0,0,0.1)
// shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
// shadow-xl: 0 20px 25px rgba(0,0,0,0.15)
```

### Uso de Sombras

| Elemento | Sombra |
|----------|--------|
| Cards padrão | Nenhuma ou `shadow-sm` |
| Cards destacados | `shadow-md` |
| Modais/BottomSheets | `shadow-xl` |
| Botões flutuantes | `shadow-lg` |
| Tab bar | `shadow-sm` no topo |

---

## 6. ÍCONES

### Biblioteca: Lucide React Native

```bash
npm install lucide-react-native
```

### Tamanhos

| Contexto | Tamanho | Uso |
|----------|---------|-----|
| Pequeno | 16px | Badges, inline |
| Normal | 20px | Botões, listas |
| Médio | 24px | Tab bar, ações |
| Grande | 32px | Destaques |
| Extra grande | 48px | Ilustrações |

### Ícones Principais do App

```typescript
import {
  // Navegação
  Home, Map, Users, Calendar, User,
  ChevronLeft, ChevronRight, X, Plus,
  
  // Ações
  Search, Filter, Heart, Share2, Bell,
  Settings, Edit, Trash2, Check,
  
  // Esportes
  // (usar emojis ou imagens customizadas)
  
  // Status
  Clock, MapPin, Star, Trophy, Flame,
  
  // Social
  MessageCircle, UserPlus, Send,
  
  // Outros
  CreditCard, Camera, Image, Lock,
} from 'lucide-react-native';
```

---

## 7. COMPONENTES

### Botão

```tsx
// Primary
<Button variant="primary">
  // bg-black text-white rounded-xl h-12 px-6 font-semibold
</Button>

// Secondary
<Button variant="secondary">
  // bg-neutral-100 text-black rounded-xl h-12 px-6 font-semibold
</Button>

// Outline
<Button variant="outline">
  // border-2 border-black text-black bg-transparent rounded-xl h-12 px-6
</Button>

// Ghost
<Button variant="ghost">
  // bg-transparent text-black rounded-xl h-12 px-6
</Button>

// Tamanhos
sm: 'h-10 px-4 text-sm'
md: 'h-12 px-6 text-base'
lg: 'h-14 px-8 text-lg'
```

### Input

```tsx
<Input>
  // Container: bg-neutral-50 border border-neutral-200 rounded-xl
  // Focus: border-black
  // Error: border-red-500
  // Padding: px-4 py-3.5
  // Placeholder: text-neutral-400
</Input>
```

### Card

```tsx
// Default
<Card>
  // bg-white rounded-2xl p-4
</Card>

// Outlined
<Card variant="outlined">
  // bg-white rounded-2xl p-4 border border-neutral-200
</Card>

// Elevated
<Card variant="elevated">
  // bg-white rounded-2xl p-4 shadow-lg
</Card>
```

### Badge

```tsx
// Base: px-2 py-1 rounded text-xs font-bold

<Badge variant="default">   // bg-neutral-100 text-neutral-700
<Badge variant="success">   // bg-green-100 text-green-700
<Badge variant="error">     // bg-red-100 text-red-700
<Badge variant="warning">   // bg-amber-100 text-amber-700
<Badge variant="pro">       // bg-black text-white
```

### Avatar

```tsx
// Tamanhos
sm: 'w-8 h-8'   // 32px
md: 'w-10 h-10' // 40px
lg: 'w-12 h-12' // 48px
xl: 'w-16 h-16' // 64px

// Fallback: bg-neutral-200 com ícone User
```

---

## 8. LAYOUTS DE TELA

### Estrutura Padrão

```tsx
<SafeAreaView className="flex-1 bg-background">
  {/* Header */}
  <View className="px-5 py-4 flex-row items-center justify-between">
    <Text className="text-xl font-bold">Título</Text>
    <IconButton icon={Bell} />
  </View>
  
  {/* Content */}
  <ScrollView className="flex-1 px-5">
    {/* Conteúdo */}
  </ScrollView>
  
  {/* Footer fixo (opcional) */}
  <View className="px-5 py-4 border-t border-neutral-100">
    <Button>Ação Principal</Button>
  </View>
</SafeAreaView>
```

### Margens Padrão

- Horizontal da tela: `px-5` (20px)
- Vertical entre seções: `py-4` (16px)
- Gap entre cards: `gap-3` (12px)

---

## 9. ANIMAÇÕES

### Transições Padrão

```typescript
// Duração
const duration = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Easing
const easing = {
  default: 'ease-out',
  spring: 'spring(1, 100, 10, 0)',
};
```

### Animações Comuns

| Ação | Animação |
|------|----------|
| Botão press | Scale 0.95, opacity 0.8 |
| Card press | Scale 0.98 |
| Modal abrir | Slide up + fade in |
| Modal fechar | Slide down + fade out |
| Tab mudar | Cross-fade |
| Lista item | Fade in + slide up |

---

## 10. ESTADOS

### Estados de Componentes

```typescript
// Botão
default: 'opacity-100'
pressed: 'opacity-70 scale-95'
disabled: 'opacity-50'
loading: 'opacity-70' + ActivityIndicator

// Input
default: 'border-neutral-200'
focused: 'border-black'
error: 'border-red-500'
disabled: 'opacity-50 bg-neutral-100'

// Card
default: 'border-transparent'
selected: 'border-black bg-neutral-50'
pressed: 'opacity-90'
```

### Estados Vazios

```tsx
<View className="flex-1 items-center justify-center px-8">
  <View className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center mb-4">
    <Calendar size={32} color="#A3A3A3" />
  </View>
  <Text className="text-lg font-semibold text-black mb-2 text-center">
    Nenhuma reserva
  </Text>
  <Text className="text-sm text-neutral-500 text-center mb-6">
    Você ainda não fez nenhuma reserva.
  </Text>
  <Button>Encontrar Quadras</Button>
</View>
```

---

## 11. IMAGENS DE REFERÊNCIA

### Tela Home
- Header: Logo + Notificação
- Saudação com hora do dia
- Card próxima partida (destaque)
- Grid ações rápidas (2x2)
- Scroll horizontal quadras
- Lista atividades recentes

### Tela Mapa
- Mapa fullscreen
- Search bar flutuante
- Chips de filtro horizontal
- Marcadores das quadras
- Bottom sheet com lista

### Tela Perfil
- Avatar grande (80px)
- Nome e username
- Stats em grid (4 colunas)
- Tabs: Atividade, Estatísticas, Conquistas
- Menu inferior

### Card de Quadra
- Imagem (120px altura)
- Nome (semibold)
- Endereço (caption)
- Rating (estrela + número)
- Preço (destaque)

---

*Design System Kourt v1.0*
