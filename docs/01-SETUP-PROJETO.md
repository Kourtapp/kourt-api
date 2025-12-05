# 📦 ETAPA 1 - SETUP DO PROJETO

> **Tempo estimado: 30-45 minutos**

---

## PROMPT 1.1 - Criar Projeto Expo

```
Crie um novo projeto Expo com as seguintes especificações:

1. Nome do projeto: kourt-app
2. Template: blank (TypeScript)
3. Use Expo SDK 50 ou superior

Comandos que você deve executar:
- npx create-expo-app@latest kourt-app --template blank-typescript
- cd kourt-app

Depois de criar, me mostre a estrutura de pastas gerada.
```

---

## PROMPT 1.2 - Instalar Dependências Principais

```
Instale as seguintes dependências no projeto kourt-app:

NAVEGAÇÃO:
- expo-router
- expo-linking
- expo-constants
- expo-status-bar

ESTILIZAÇÃO:
- nativewind
- tailwindcss (devDependency)

ÍCONES:
- lucide-react-native
- react-native-svg

FORMULÁRIOS:
- react-hook-form
- @hookform/resolvers
- zod

ESTADO:
- zustand

SUPABASE:
- @supabase/supabase-js
- @react-native-async-storage/async-storage

EXTRAS:
- expo-image
- expo-linear-gradient
- react-native-reanimated
- react-native-gesture-handler
- react-native-safe-area-context
- react-native-screens

Execute os comandos de instalação e me avise quando terminar.
```

---

## PROMPT 1.3 - Configurar NativeWind (Tailwind)

```
Configure o NativeWind no projeto. Crie/modifique os seguintes arquivos:

1. tailwind.config.js - com as cores do design system:
   - primary: '#000000'
   - background: '#FAFAFA'
   - card: '#FFFFFF'
   - border: '#E5E5E5'
   - success: '#22C55E'
   - error: '#EF4444'
   - warning: '#F59E0B'
   - muted: '#737373'

2. global.css - importar tailwind

3. babel.config.js - adicionar plugin do nativewind

4. metro.config.js - configurar para CSS

5. nativewind-env.d.ts - tipos do TypeScript

Me mostre cada arquivo criado.
```

---

## PROMPT 1.4 - Configurar Expo Router

```
Configure o Expo Router para navegação baseada em arquivos:

1. Modifique o package.json para ter "main": "expo-router/entry"

2. Crie a estrutura de pastas em /app:
   - app/_layout.tsx (layout raiz com providers)
   - app/index.tsx (tela inicial que redireciona)
   - app/(auth)/_layout.tsx
   - app/(auth)/login.tsx
   - app/(tabs)/_layout.tsx
   - app/(tabs)/index.tsx

3. Configure o app.json com o scheme para deep linking

Me mostre cada arquivo e explique a estrutura de navegação.
```

---

## PROMPT 1.5 - Criar Constantes e Tipos Base

```
Crie os arquivos de constantes e tipos:

1. constants/colors.ts:
```typescript
export const Colors = {
  primary: '#000000',
  background: '#FAFAFA',
  card: '#FFFFFF',
  border: '#E5E5E5',
  text: {
    primary: '#000000',
    secondary: '#737373',
    muted: '#A3A3A3',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
} as const;
```

2. constants/layout.ts:
```typescript
export const Layout = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;
```

3. types/index.ts com tipos base:
- User
- Court
- Booking
- Match
- Sport

Me mostre os arquivos criados.
```

---

## PROMPT 1.6 - Testar Configuração

```
Vamos testar se tudo está funcionando:

1. Crie um componente de teste em app/(tabs)/index.tsx que:
   - Usa NativeWind (className)
   - Mostra um texto "Kourt App"
   - Tem background da cor correta
   - Usa SafeAreaView

2. Execute o projeto com: npx expo start

3. Me avise se aparecer algum erro no terminal ou no app.

Se der erro, cole a mensagem completa para eu ajudar a resolver.
```

---

## ✅ CHECKLIST ETAPA 1

Antes de ir para a Etapa 2, confirme:

- [ ] Projeto Expo criado com TypeScript
- [ ] Todas as dependências instaladas
- [ ] NativeWind configurado e funcionando
- [ ] Expo Router configurado
- [ ] Constantes de cores criadas
- [ ] App rodando sem erros no simulador/device

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### Erro: "nativewind not working"
```
Solução: Verifique se o babel.config.js tem:
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
```

### Erro: "Metro bundler error"
```
Solução: Limpe o cache:
npx expo start -c
```

### Erro: "Cannot find module 'expo-router'"
```
Solução: Reinstale as dependências:
rm -rf node_modules
npm install
```

---

## PRÓXIMA ETAPA

Quando tudo estiver funcionando, vá para:
**`02-COMPONENTES-BASE.md`**
