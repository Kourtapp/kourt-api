# 🎨 ETAPA 2 - COMPONENTES BASE

> **Tempo estimado: 1-2 horas**

---

## PROMPT 2.1 - Componente Button

```
Crie o componente Button em components/ui/Button.tsx

Especificações:
- Variantes: primary (preto), secondary (cinza), outline (borda), ghost (transparente)
- Tamanhos: sm, md, lg
- Estados: default, pressed, disabled, loading
- Props: onPress, disabled, loading, variant, size, children, icon, fullWidth

Design:
- Primary: bg-black text-white
- Secondary: bg-neutral-100 text-black
- Outline: border-2 border-black text-black bg-transparent
- Ghost: bg-transparent text-black

- Tamanho sm: h-10 px-4 text-sm
- Tamanho md: h-12 px-6 text-base
- Tamanho lg: h-14 px-8 text-lg

- Border radius: rounded-xl (12px)
- Font: font-semibold
- Loading: mostrar ActivityIndicator

Use Pressable do React Native com feedback visual (opacity ou scale).
Exporte como componente default.

Me mostre o código completo.
```

---

## PROMPT 2.2 - Componente Input

```
Crie o componente Input em components/ui/Input.tsx

Especificações:
- Props: label, placeholder, value, onChangeText, error, secureTextEntry, icon, disabled, multiline
- Integração com React Hook Form

Design:
- Container: bg-neutral-50 border border-neutral-200 rounded-xl
- Focus: border-black
- Error: border-red-500
- Label: text-sm font-medium text-black mb-2
- Input: px-4 py-3.5 text-base text-black
- Placeholder: text-neutral-400
- Error message: text-xs text-red-500 mt-1
- Icon à esquerda se fornecido

Use forwardRef para funcionar com React Hook Form.
Me mostre o código completo.
```

---

## PROMPT 2.3 - Componente Card

```
Crie o componente Card em components/ui/Card.tsx

Especificações:
- Props: children, onPress (opcional), variant (default, outlined, elevated)
- Pressable se onPress for fornecido

Design:
- Default: bg-white rounded-2xl
- Outlined: bg-white border border-neutral-200 rounded-2xl
- Elevated: bg-white rounded-2xl shadow-lg

- Padding interno: p-4
- Se pressable: feedback visual no press

Me mostre o código completo.
```

---

## PROMPT 2.4 - Componente Avatar

```
Crie o componente Avatar em components/ui/Avatar.tsx

Especificações:
- Props: source (uri), size (sm, md, lg, xl), fallback (iniciais ou ícone)
- Se não tiver imagem, mostrar fallback

Design:
- Tamanhos: sm (32px), md (40px), lg (48px), xl (64px)
- Shape: rounded-full
- Fallback: bg-neutral-200 com ícone User do Lucide ou iniciais
- Border: border-2 border-white (para sobreposição)

Use expo-image para carregamento otimizado.
Me mostre o código completo.
```

---

## PROMPT 2.5 - Componente Badge

```
Crie o componente Badge em components/ui/Badge.tsx

Especificações:
- Props: children, variant (default, success, error, warning, pro)
- Apenas exibe texto com estilo

Design:
- Base: px-2 py-1 rounded text-xs font-bold
- Default: bg-neutral-100 text-neutral-700
- Success: bg-green-100 text-green-700
- Error: bg-red-100 text-red-700
- Warning: bg-amber-100 text-amber-700
- Pro: bg-black text-white

Me mostre o código completo.
```

---

## PROMPT 2.6 - Componente IconButton

```
Crie o componente IconButton em components/ui/IconButton.tsx

Especificações:
- Props: icon (componente Lucide), onPress, variant, size, disabled
- Botão circular com apenas ícone

Design:
- Tamanhos: sm (36px), md (44px), lg (52px)
- Variantes: default (bg-neutral-100), primary (bg-black), ghost (transparente)
- Shape: rounded-full
- Ícone centralizado

Me mostre o código completo.
```

---

## PROMPT 2.7 - Componente Header

```
Crie o componente Header em components/ui/Header.tsx

Especificações:
- Props: title, showBack, onBack, rightAction, transparent
- Layout fixo no topo

Design:
- Height: 56px
- Padding horizontal: px-4
- Título: text-lg font-semibold text-center
- Botão voltar: ícone ChevronLeft à esquerda
- Right action: slot para botões à direita
- Se transparent: bg-transparent, senão bg-white

Use SafeAreaView para respeitar notch.
Me mostre o código completo.
```

---

## PROMPT 2.8 - Componente BottomSheet

```
Crie o componente BottomSheet em components/ui/BottomSheet.tsx

Especificações:
- Props: isOpen, onClose, children, title, snapPoints
- Modal que sobe da parte inferior

Design:
- Background overlay: bg-black/50
- Sheet: bg-white rounded-t-3xl
- Handle: w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-3
- Title: text-lg font-semibold px-5 py-4

Use react-native-reanimated para animação.
Fechar ao tocar fora ou arrastar para baixo.
Me mostre o código completo.
```

---

## PROMPT 2.9 - Componente LoadingScreen

```
Crie o componente LoadingScreen em components/ui/LoadingScreen.tsx

Especificações:
- Props: message (opcional)
- Tela cheia com indicador de loading

Design:
- Full screen: flex-1 bg-white
- Centralizado: items-center justify-center
- ActivityIndicator: size large, color black
- Message: text-sm text-neutral-500 mt-4

Me mostre o código completo.
```

---

## PROMPT 2.10 - Arquivo de Exportação

```
Crie o arquivo components/ui/index.ts que exporta todos os componentes:

export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Avatar } from './Avatar';
export { default as Badge } from './Badge';
export { default as IconButton } from './IconButton';
export { default as Header } from './Header';
export { default as BottomSheet } from './BottomSheet';
export { default as LoadingScreen } from './LoadingScreen';

Assim posso importar: import { Button, Input, Card } from '@/components/ui';
```

---

## PROMPT 2.11 - Testar Componentes

```
Crie uma tela de teste em app/test-components.tsx que mostra todos os componentes criados:

1. Seção Buttons: todas as variantes e tamanhos
2. Seção Input: com label, com erro, com ícone
3. Seção Cards: todas as variantes
4. Seção Avatar: todos os tamanhos
5. Seção Badges: todas as variantes

Use ScrollView para conseguir ver tudo.
Depois de criar, rode o app e verifique se está tudo aparecendo corretamente.
```

---

## ✅ CHECKLIST ETAPA 2

- [ ] Button com todas as variantes funcionando
- [ ] Input com label e validação de erro
- [ ] Card com variantes
- [ ] Avatar com fallback
- [ ] Badge com variantes
- [ ] IconButton funcionando
- [ ] Header com navegação
- [ ] BottomSheet abrindo/fechando
- [ ] LoadingScreen
- [ ] Todos exportados no index.ts
- [ ] Tela de teste mostrando todos os componentes

---

## 🚨 ERROS COMUNS

### Erro: "lucide-react-native icons not showing"
```
Solução: Certifique-se que react-native-svg está instalado:
npx expo install react-native-svg
```

### Erro: "NativeWind classes not applying"
```
Solução: Use className em vez de style para Tailwind classes.
Para estilos dinâmicos, use a função cn() com clsx.
```

### Erro: "forwardRef types"
```
Solução: Use React.forwardRef<TextInput, InputProps>((props, ref) => ...)
```

---

## PRÓXIMA ETAPA

Quando todos os componentes estiverem funcionando, vá para:
**`03-AUTENTICACAO.md`**
