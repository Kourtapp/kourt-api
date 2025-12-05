# Guia Completo de Publicação do Kourt

Este guia detalha todos os passos necessários para finalizar e publicar o app Kourt nas lojas.

---

## PARTE 1: CONFIGURAÇÃO DO BACKEND (Supabase)

### Passo 1.1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou email
4. Clique em "New Project"
5. Preencha:
   - **Name**: `kourt`
   - **Database Password**: crie uma senha forte (guarde!)
   - **Region**: escolha a mais próxima (South America - São Paulo)
6. Clique em "Create new project"
7. Aguarde ~2 minutos para o projeto ser criado

### Passo 1.2: Executar o Schema do Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "New query"
3. Abra o arquivo `supabase/schema.sql` do projeto
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em "Run" (ou Ctrl+Enter)
7. Verifique se aparece "Success" sem erros

### Passo 1.3: Habilitar Realtime (para Chat)

1. Vá em **Database** > **Replication**
2. Na seção "Supabase Realtime", clique em cada tabela que precisa de realtime:
   - `chat_messages` ✅
   - `notifications` ✅
   - `match_players` ✅
3. Para cada uma, clique e ative "Enable Realtime"

### Passo 1.4: Obter as Chaves de API

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`
3. Guarde essas chaves para o próximo passo

### Passo 1.5: Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. O **Email** já vem habilitado por padrão
3. (Opcional) Configure outros providers:
   - Google: precisa criar projeto no Google Cloud
   - Apple: precisa de conta Apple Developer

---

## PARTE 2: CONFIGURAÇÃO DO STRIPE (Pagamentos)

### Passo 2.1: Criar Conta no Stripe

1. Acesse [stripe.com](https://stripe.com)
2. Clique em "Start now"
3. Crie sua conta com email
4. Confirme o email

### Passo 2.2: Obter Chaves de Teste

1. No dashboard do Stripe, verifique se está em **Test mode** (toggle no canto superior direito)
2. Vá em **Developers** > **API keys**
3. Copie:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (clique para revelar)

### Passo 2.3: Configurar Webhook (Opcional para Produção)

1. Vá em **Developers** > **Webhooks**
2. Clique em "Add endpoint"
3. URL: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook`
4. Selecione eventos: `payment_intent.succeeded`, `payment_intent.failed`

---

## PARTE 3: CONFIGURAÇÃO DO PROJETO LOCAL

### Passo 3.1: Criar Arquivo .env

1. Na raiz do projeto, crie o arquivo `.env`:

```bash
# No terminal, na pasta do projeto:
cp .env.example .env
```

2. Abra o `.env` e preencha:

```env
# Supabase (valores do Passo 1.4)
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Stripe (valores do Passo 2.2)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave-aqui

# Expo (será preenchido depois)
EXPO_PUBLIC_PROJECT_ID=seu-project-id
```

### Passo 3.2: Atualizar lib/supabase.ts

Verifique se o arquivo `lib/supabase.ts` está usando as variáveis de ambiente:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

### Passo 3.3: Atualizar lib/stripe.ts

Abra `lib/stripe.ts` e atualize:

```typescript
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
```

---

## PARTE 4: CRIAR ASSETS DO APP

### Passo 4.1: Ícone do App (1024x1024px)

**Opção A - Criar no Figma/Canva:**
1. Crie um documento 1024x1024px
2. Design sugerido:
   - Fundo preto (#000000)
   - Letra "K" estilizada em verde (#84CC16)
   - Ou ícone de raquete/quadra
3. Exporte como PNG
4. Salve em `assets/icon.png`

**Opção B - Usar gerador online:**
1. Acesse [makeappicon.com](https://makeappicon.com) ou similar
2. Crie um ícone simples
3. Baixe e salve em `assets/icon.png`

### Passo 4.2: Splash Screen (1284x2778px)

1. Crie um documento 1284x2778px
2. Design sugerido:
   - Fundo preto (#000000)
   - Logo "KOURT" centralizado em branco
3. Exporte como PNG
4. Salve em `assets/splash.png`
5. Atualize `app.json`:
```json
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#000000"
}
```

### Passo 4.3: Adaptive Icon (Android)

1. Crie um ícone com transparência (1024x1024px)
2. O ícone deve ocupar ~70% do centro (Android corta as bordas)
3. Salve em `assets/adaptive-icon.png`

---

## PARTE 5: CONFIGURAR EXPO / EAS

### Passo 5.1: Criar Conta no Expo

1. Acesse [expo.dev](https://expo.dev)
2. Clique em "Sign Up"
3. Crie sua conta
4. Confirme o email

### Passo 5.2: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Passo 5.3: Fazer Login

```bash
eas login
```
- Digite seu email e senha do Expo

### Passo 5.4: Configurar o Projeto

```bash
eas build:configure
```

Isso vai:
- Criar/atualizar o `eas.json`
- Vincular ao seu projeto Expo
- Gerar um Project ID

### Passo 5.5: Atualizar app.json

Após o passo anterior, atualize o `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "seu-project-id-gerado"
      }
    },
    "owner": "seu-username-expo"
  }
}
```

### Passo 5.6: Atualizar .env

Adicione o Project ID ao `.env`:

```env
EXPO_PUBLIC_PROJECT_ID=seu-project-id-gerado
```

---

## PARTE 6: TESTAR LOCALMENTE

### Passo 6.1: Instalar Dependências

```bash
npm install
```

### Passo 6.2: Iniciar o Servidor de Desenvolvimento

```bash
npx expo start
```

### Passo 6.3: Testar no Celular

**Opção A - Expo Go (mais fácil):**
1. Instale o app "Expo Go" no celular
2. Escaneie o QR code que aparece no terminal
3. O app abrirá no Expo Go

**Opção B - Development Build (recomendado):**
1. Rode: `eas build --profile development --platform android`
2. Aguarde o build (~15 min)
3. Baixe e instale o APK
4. Abra o app e conecte ao servidor local

### Passo 6.4: Verificar Funcionalidades

Teste cada funcionalidade:
- [ ] Login e registro
- [ ] Onboarding completo
- [ ] Mapa carregando
- [ ] Busca de quadras
- [ ] Detalhes da quadra
- [ ] Checkout (com cartão de teste: 4242 4242 4242 4242)
- [ ] Chat
- [ ] Notificações

---

## PARTE 7: BUILD DE PREVIEW (Teste Real)

### Passo 7.1: Build Android (APK)

```bash
eas build --profile preview --platform android
```

- Aguarde 15-30 minutos
- Quando terminar, você receberá um link para baixar o APK
- Instale no celular Android e teste

### Passo 7.2: Build iOS (Simulador)

```bash
eas build --profile development --platform ios
```

Nota: Para testar em iPhone real, você precisa de conta Apple Developer.

---

## PARTE 8: PUBLICAR NA PLAY STORE (Android)

### Passo 8.1: Criar Conta Google Play Developer

1. Acesse [play.google.com/console](https://play.google.com/console)
2. Pague a taxa única de $25
3. Complete o cadastro

### Passo 8.2: Criar o App no Play Console

1. Clique em "Criar app"
2. Preencha:
   - Nome: `Kourt`
   - Idioma: Português (Brasil)
   - Tipo: App
   - Gratuito
3. Clique em "Criar"

### Passo 8.3: Preencher Ficha da Loja

1. Vá em "Presença na loja" > "Ficha principal da loja"
2. Preencha:
   - **Descrição curta**: Use o texto de `docs/STORE-LISTING.md`
   - **Descrição completa**: Use o texto de `docs/STORE-LISTING.md`
3. Adicione screenshots (mínimo 2):
   - Tire prints do app no celular
   - Ou use emulador e tire screenshots
4. Adicione o Feature Graphic (1024x500px)
5. Adicione o ícone (512x512px)

### Passo 8.4: Preencher Classificação de Conteúdo

1. Vá em "Políticas" > "Conteúdo do app" > "Classificação do conteúdo"
2. Responda o questionário
3. O Kourt provavelmente será classificado como "Livre"

### Passo 8.5: Configurar Preços e Distribuição

1. Vá em "Monetização" > "Preços do app"
2. Selecione "Gratuito"
3. Selecione os países (Brasil + outros)

### Passo 8.6: Build de Produção

```bash
eas build --profile production --platform android
```

Aguarde o build terminar (~20-30 min).

### Passo 8.7: Enviar para a Play Store

**Opção A - Via EAS Submit:**
```bash
eas submit --platform android
```

**Opção B - Manual:**
1. Baixe o arquivo `.aab` gerado pelo build
2. No Play Console, vá em "Produção" > "Criar nova versão"
3. Faça upload do arquivo `.aab`
4. Preencha as notas de versão
5. Clique em "Revisar versão"
6. Clique em "Iniciar lançamento"

### Passo 8.8: Aguardar Revisão

- A Google revisa o app em 1-7 dias
- Você receberá email com o resultado
- Se aprovado, o app estará na Play Store!

---

## PARTE 9: PUBLICAR NA APP STORE (iOS)

### Passo 9.1: Criar Conta Apple Developer

1. Acesse [developer.apple.com](https://developer.apple.com)
2. Clique em "Account" > "Enroll"
3. Pague a taxa anual de $99
4. Complete o cadastro (pode demorar 1-2 dias para aprovar)

### Passo 9.2: Criar o App no App Store Connect

1. Acesse [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Vá em "My Apps" > "+"" > "New App"
3. Preencha:
   - Plataforma: iOS
   - Nome: Kourt
   - Idioma: Portuguese (Brazil)
   - Bundle ID: com.kourt.app
   - SKU: kourt-app-001

### Passo 9.3: Preencher Informações do App

1. Na aba "App Information":
   - Categoria: Sports
   - Subcategoria: (opcional)
2. Na aba "Pricing and Availability":
   - Preço: Free
   - Disponibilidade: Brasil + outros países

### Passo 9.4: Preencher Ficha da Versão

1. Vá em "App Store" > "iOS App" > "1.0"
2. Preencha:
   - Screenshots (6.7" e 6.5")
   - Descrição
   - Palavras-chave
   - URL de suporte
   - URL de privacidade

### Passo 9.5: Build de Produção iOS

```bash
eas build --profile production --platform ios
```

Aguarde o build (~30-45 min).

### Passo 9.6: Enviar para a App Store

```bash
eas submit --platform ios
```

Ou use o Transporter app no Mac para fazer upload manual.

### Passo 9.7: Submeter para Revisão

1. No App Store Connect, selecione o build enviado
2. Preencha informações de revisão:
   - Login de teste (email/senha para a Apple testar)
   - Notas para o revisor
3. Clique em "Add for Review"
4. Clique em "Submit to App Review"

### Passo 9.8: Aguardar Revisão

- A Apple revisa o app em 1-3 dias (geralmente)
- Você receberá email com o resultado
- Se rejeitado, corrija os problemas e reenvie
- Se aprovado, o app estará na App Store!

---

## PARTE 10: APÓS A PUBLICAÇÃO

### Passo 10.1: Monitorar Downloads

- Play Console: "Estatísticas"
- App Store Connect: "App Analytics"

### Passo 10.2: Responder Avaliações

- Responda educadamente todas as avaliações
- Agradeça feedbacks positivos
- Prometa corrigir problemas relatados

### Passo 10.3: Corrigir Bugs Rapidamente

1. Quando encontrar um bug:
2. Corrija no código
3. Aumente a versão em `app.json`:
   - version: "1.0.1"
   - buildNumber: "2" (iOS)
   - versionCode: 2 (Android)
4. Faça novo build: `eas build --profile production`
5. Envie: `eas submit`

### Passo 10.4: Divulgar o App

- Compartilhe nas redes sociais
- Peça para amigos baixarem e avaliarem
- Crie um site/landing page
- Considere anúncios pagos

---

## RESUMO DOS COMANDOS

```bash
# Instalar dependências
npm install

# Testar localmente
npx expo start

# Login no EAS
eas login

# Configurar projeto
eas build:configure

# Build de preview (teste)
eas build --profile preview --platform android

# Build de produção
eas build --profile production --platform android
eas build --profile production --platform ios

# Enviar para as lojas
eas submit --platform android
eas submit --platform ios
```

---

## CHECKLIST FINAL

### Antes do Build de Produção:
- [ ] Supabase configurado e funcionando
- [ ] Schema do banco executado
- [ ] Stripe configurado (chaves de produção)
- [ ] Variáveis de ambiente corretas
- [ ] Ícone e splash criados
- [ ] App testado em dispositivo real
- [ ] Bugs corrigidos

### Para Play Store:
- [ ] Conta Google Play Developer ($25)
- [ ] Screenshots Android
- [ ] Descrição e textos
- [ ] Classificação de conteúdo
- [ ] Política de privacidade URL
- [ ] Build .aab enviado

### Para App Store:
- [ ] Conta Apple Developer ($99/ano)
- [ ] Screenshots iPhone
- [ ] Descrição e textos
- [ ] URL de privacidade
- [ ] URL de suporte
- [ ] Build enviado
- [ ] Credenciais de teste para revisão

---

**Tempo estimado total**: 4-8 horas (sem contar tempo de revisão das lojas)

**Custo total**:
- Google Play: $25 (única vez)
- Apple Developer: $99/ano
- **Total inicial**: ~$124 (R$ 620)

---

*Boa sorte com a publicação do Kourt!*
