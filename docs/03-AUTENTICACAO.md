# 🔐 ETAPA 3 - AUTENTICAÇÃO

> **Tempo estimado: 2-3 horas**

---

## PROMPT 3.1 - Configurar Supabase

```
Configure o Supabase no projeto:

1. Crie a conta em supabase.com (se ainda não tiver)
2. Crie um novo projeto chamado "kourt"
3. Aguarde o projeto ser criado (2-3 minutos)
4. Pegue as credenciais em Settings > API:
   - Project URL
   - anon/public key

5. Crie o arquivo lib/supabase.ts:

```typescript
import 'react-native-url-polyfill/dist/polyfill';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'SUA_URL_AQUI';
const supabaseAnonKey = 'SUA_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

6. Instale o polyfill: npm install react-native-url-polyfill

Me avise quando configurar, passando a URL (sem a key por segurança).
```

---

## PROMPT 3.2 - Store de Autenticação

```
Crie o store de autenticação com Zustand em stores/authStore.ts:

```typescript
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setOnboarded: (value: boolean) => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isOnboarded: false,
  
  setSession: (session) => set({ 
    session, 
    user: session?.user ?? null,
    isLoading: false 
  }),
  
  setOnboarded: (value) => set({ isOnboarded: value }),
  
  signUp: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
  },
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
  
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
}));
```

Me mostre o código completo.
```

---

## PROMPT 3.3 - Tela de Login

```
Crie a tela de login em app/(auth)/login.tsx:

DESIGN:
- Fundo branco
- Logo "Kourt" no topo (texto estilizado ou imagem)
- Título: "Bem-vindo de volta"
- Subtítulo: "Entre para continuar jogando"

FORMULÁRIO:
- Input Email (com ícone Mail)
- Input Senha (com ícone Lock, secureTextEntry)
- Link "Esqueci minha senha" alinhado à direita
- Botão "Entrar" (primary, full width)
- Divisor "ou"
- Botão "Continuar com Google" (outline, com ícone)
- Botão "Continuar com Apple" (secondary, com ícone) - apenas iOS
- Texto no rodapé: "Não tem conta? Cadastre-se"

FUNCIONALIDADES:
- Validação com Zod (email válido, senha min 6 chars)
- Integração com useAuthStore
- Loading state no botão
- Mostrar erro se login falhar
- Navegar para home após login
- Navegar para registro ao clicar em "Cadastre-se"
- Navegar para forgot-password ao clicar em "Esqueci minha senha"

Use React Hook Form para o formulário.
Me mostre o código completo.
```

---

## PROMPT 3.4 - Tela de Registro

```
Crie a tela de registro em app/(auth)/register.tsx:

DESIGN:
- Header com botão voltar
- Título: "Criar conta"
- Subtítulo: "Junte-se à comunidade Kourt"

FORMULÁRIO:
- Input Nome completo (com ícone User)
- Input Email (com ícone Mail)
- Input Senha (com ícone Lock)
- Input Confirmar senha (com ícone Lock)
- Checkbox "Aceito os termos de uso e política de privacidade"
- Botão "Criar conta" (primary, full width)
- Texto: "Já tem conta? Entrar"

VALIDAÇÃO com Zod:
- Nome: mínimo 3 caracteres
- Email: formato válido
- Senha: mínimo 6 caracteres
- Confirmar senha: igual à senha
- Termos: deve ser true

FUNCIONALIDADES:
- Mostrar/ocultar senha (ícone Eye/EyeOff)
- Loading no botão durante registro
- Mostrar erro se falhar
- Após registro, redirecionar para onboarding

Me mostre o código completo.
```

---

## PROMPT 3.5 - Tela Esqueci Senha

```
Crie a tela de recuperação de senha em app/(auth)/forgot-password.tsx:

DESIGN:
- Header com botão voltar
- Ícone grande de cadeado no centro
- Título: "Esqueceu a senha?"
- Subtítulo: "Digite seu e-mail e enviaremos um link para redefinir sua senha."
- Input Email
- Botão "Enviar link de recuperação"
- Link: "Lembrou a senha? Fazer login"

FUNCIONALIDADES:
- Validação de email
- Chamar resetPassword do authStore
- Mostrar mensagem de sucesso após enviar
- Loading no botão

Me mostre o código completo.
```

---

## PROMPT 3.6 - Auth Provider e Layout

```
Configure o provider de autenticação:

1. Crie providers/AuthProvider.tsx:
- Escuta mudanças de sessão do Supabase
- Atualiza o authStore quando sessão muda
- Mostra LoadingScreen enquanto verifica sessão

2. Modifique app/_layout.tsx:
- Envolva o app com AuthProvider
- Use useAuthStore para verificar autenticação
- Redirecione para login se não autenticado
- Redirecione para onboarding se autenticado mas não onboarded
- Redirecione para home se autenticado e onboarded

Estrutura de redirecionamento:
- Não logado → /login
- Logado, não onboarded → /onboarding/welcome
- Logado e onboarded → /(tabs)

Me mostre os arquivos completos.
```

---

## PROMPT 3.7 - Layout do Grupo Auth

```
Crie o layout do grupo de autenticação em app/(auth)/_layout.tsx:

- Use Stack do expo-router
- Sem header padrão (headerShown: false)
- Animação de transição suave
- Telas: login, register, forgot-password

Me mostre o código.
```

---

## PROMPT 3.8 - Testar Autenticação

```
Vamos testar o fluxo de autenticação:

1. Execute o app
2. Deve redirecionar para /login
3. Teste criar uma conta nova
4. Verifique se recebe email de confirmação (Supabase envia)
5. Teste fazer login
6. Verifique se redireciona para onboarding
7. Teste "Esqueci minha senha"
8. Teste logout

Me avise se algum passo falhar, com o erro específico.
```

---

## ✅ CHECKLIST ETAPA 3

- [ ] Supabase configurado e conectando
- [ ] Store de autenticação funcionando
- [ ] Tela de login completa
- [ ] Tela de registro completa
- [ ] Tela de esqueci senha completa
- [ ] AuthProvider gerenciando sessão
- [ ] Redirecionamentos funcionando
- [ ] Validação de formulários
- [ ] Loading states
- [ ] Mensagens de erro

---

## 🚨 ERROS COMUNS

### Erro: "Invalid API key"
```
Solução: Verifique se copiou a chave correta (anon key, não service key)
```

### Erro: "Network request failed"
```
Solução: 
- Verifique conexão com internet
- Verifique se a URL do Supabase está correta
- No Android, pode precisar configurar cleartext traffic
```

### Erro: "Email not confirmed"
```
Solução: 
- Configure o Supabase para não exigir confirmação (para desenvolvimento)
- Vá em Authentication > Settings > Email Auth
- Desabilite "Enable email confirmations"
```

### Erro: "AsyncStorage not working"
```
Solução: Instale corretamente:
npx expo install @react-native-async-storage/async-storage
```

---

## CONFIGURAÇÃO SUPABASE RECOMENDADA

No dashboard do Supabase, configure:

1. **Authentication > Settings**:
   - Site URL: seu-app://
   - Disable email confirmations (para dev)

2. **Authentication > Email Templates**:
   - Personalize os emails (opcional)

3. **Database > Tables**:
   - Será configurado na Etapa 6

---

## PRÓXIMA ETAPA

Quando a autenticação estiver funcionando, vá para:
**`04-NAVEGACAO.md`**
