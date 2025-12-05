# 🚀 ETAPA 8 - FINALIZAÇÃO E PUBLICAÇÃO

> **Tempo estimado: 2-4 horas**

---

## PROMPT 8.1 - Preparar Assets

```
Vamos preparar os assets do app:

1. ÍCONE DO APP (1024x1024px):
   - Crie ou gere um ícone para o Kourt
   - Fundo preto ou branco
   - Letra K estilizada ou ícone de quadra
   - Salve como icon.png

2. SPLASH SCREEN (1284x2778px):
   - Fundo branco ou preto
   - Logo Kourt centralizado
   - Salve como splash.png

3. ADAPTIVE ICON (Android):
   - foreground.png (1024x1024, com transparência)
   - background pode ser cor sólida

4. Configure no app.json:
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    }
  }
}

Me avise quando os assets estiverem prontos.
```

---

## PROMPT 8.2 - Configurar App.json Completo

```
Configure o app.json com todas as informações necessárias:

{
  "expo": {
    "name": "Kourt",
    "slug": "kourt-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "kourt",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.seuusername.kourt",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Kourt usa sua localização para mostrar quadras próximas.",
        "NSCameraUsageDescription": "Kourt usa a câmera para adicionar fotos de partidas.",
        "NSPhotoLibraryUsageDescription": "Kourt acessa suas fotos para compartilhar momentos."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.seuusername.kourt",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-location",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#000000"
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.seuusername.kourt",
          "enableGooglePay": true
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "seu-project-id"
      }
    }
  }
}

Substitua "seuusername" pelo seu nome de usuário.
Me avise quando configurar.
```

---

## PROMPT 8.3 - Configurar Variáveis de Ambiente

```
Configure as variáveis de ambiente para produção:

1. Crie arquivo .env:
EXPO_PUBLIC_SUPABASE_URL=sua-url-supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxx

2. Crie arquivo .env.development:
(mesmas variáveis mas com valores de teste)

3. Atualize lib/supabase.ts:
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

4. Adicione .env ao .gitignore

5. Crie .env.example com as chaves sem valores

Me avise quando configurar.
```

---

## PROMPT 8.4 - Configurar EAS Build

```
Configure o EAS (Expo Application Services) para builds:

1. Instale EAS CLI:
   npm install -g eas-cli

2. Faça login:
   eas login

3. Configure o projeto:
   eas build:configure

4. Crie/edite eas.json:
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}

5. Rode um build de preview:
   eas build --profile preview --platform android

Me avise o resultado.
```

---

## PROMPT 8.5 - Testar em Dispositivo Real

```
Vamos testar o app em dispositivos reais:

ANDROID:
1. Rode: eas build --profile preview --platform android
2. Aguarde o build (10-20 min)
3. Baixe o APK gerado
4. Instale no seu celular Android
5. Teste todas as funcionalidades

iOS:
1. Rode: eas build --profile preview --platform ios
2. Aguarde o build
3. Instale via TestFlight ou Ad-hoc
4. Teste todas as funcionalidades

CHECKLIST DE TESTES:
- [ ] Login e registro funcionando
- [ ] Onboarding completo
- [ ] Mapa carregando com localização
- [ ] Busca de quadras funcionando
- [ ] Detalhes da quadra
- [ ] Checkout e pagamento (teste)
- [ ] Chat funcionando
- [ ] Notificações chegando
- [ ] Push notifications
- [ ] Telas sem erros visuais
- [ ] Performance ok (sem travamentos)

Me avise os resultados dos testes.
```

---

## PROMPT 8.6 - Corrigir Bugs Encontrados

```
Com base nos testes, vamos corrigir os problemas:

[Liste aqui os bugs encontrados e vamos resolver um por um]

Para cada bug:
1. Descreva o problema
2. Em qual tela/funcionalidade
3. Passos para reproduzir
4. Mensagem de erro (se houver)

Vou te ajudar a resolver cada um.
```

---

## PROMPT 8.7 - Preparar para App Store (iOS)

```
Prepare o app para publicar na App Store:

1. CRIE UMA CONTA APPLE DEVELOPER ($99/ano):
   - Acesse developer.apple.com
   - Compre a licença de desenvolvedor

2. NO APP STORE CONNECT:
   - Crie um novo app
   - Preencha:
     - Nome: Kourt
     - Subtítulo: Encontre quadras e jogue
     - Categoria: Esportes
     - Idioma: Português (Brasil)

3. SCREENSHOTS (obrigatório):
   - 6.7" (iPhone 14 Pro Max): 1290 x 2796px
   - 6.5" (iPhone 14 Plus): 1284 x 2778px
   - Pelo menos 3 screenshots mostrando principais telas

4. INFORMAÇÕES:
   - Descrição (até 4000 caracteres)
   - Palavras-chave (100 caracteres)
   - URL de privacidade
   - URL de suporte

5. RODE O BUILD DE PRODUÇÃO:
   eas build --platform ios --profile production

6. ENVIE PARA REVISÃO:
   eas submit --platform ios

Me avise quando chegar em cada etapa.
```

---

## PROMPT 8.8 - Preparar para Play Store (Android)

```
Prepare o app para publicar na Play Store:

1. CRIE UMA CONTA GOOGLE PLAY DEVELOPER ($25 única vez):
   - Acesse play.google.com/console
   - Pague a taxa

2. NO PLAY CONSOLE:
   - Crie um novo app
   - Preencha:
     - Nome: Kourt
     - Idioma: Português (Brasil)
     - Tipo: App
     - Gratuito/Pago: Gratuito

3. SCREENSHOTS:
   - Telefone: mínimo 2, máximo 8
   - Tamanho: 320-3840px
   - Feature graphic (1024 x 500px)

4. INFORMAÇÕES DE FICHA:
   - Descrição curta (80 caracteres)
   - Descrição completa (4000 caracteres)
   - Categoria: Esportes

5. CLASSIFICAÇÃO DE CONTEÚDO:
   - Preencha o questionário
   - Kourt provavelmente será "Livre"

6. RODE O BUILD DE PRODUÇÃO:
   eas build --platform android --profile production

7. ENVIE PARA REVISÃO:
   eas submit --platform android

Me avise quando chegar em cada etapa.
```

---

## PROMPT 8.9 - Textos para as Lojas

```
Crie os textos de descrição para as lojas:

TÍTULO: Kourt - Quadras & Partidas

SUBTÍTULO: Encontre quadras, jogue mais

DESCRIÇÃO CURTA (80 chars):
Encontre quadras, convide amigos e organize suas partidas esportivas.

DESCRIÇÃO COMPLETA:

Kourt é o app para quem ama esportes de quadra! 🎾

ENCONTRE QUADRAS PERTO DE VOCÊ
• Mapa com quadras de Beach Tennis, Padel, Tênis e mais
• Veja preços, horários e avaliações
• Reserve e pague direto pelo app

ORGANIZE SUAS PARTIDAS
• Crie jogos e convide amigos
• Encontre jogadores do seu nível
• Confirme presença com um toque

ACOMPANHE SEU DESEMPENHO
• Estatísticas de todas suas partidas
• Evolução do seu ranking
• Conquistas e desafios

CONECTE-SE COM A COMUNIDADE
• Siga outros jogadores
• Veja atividades dos amigos
• Participe de torneios

Baixe agora e comece a jogar! 🏆

PALAVRAS-CHAVE:
beach tennis, padel, tênis, quadras esportivas, reserva de quadra, esportes, partidas, jogos, ranking

Me mostre os textos finalizados.
```

---

## PROMPT 8.10 - Página de Termos e Privacidade

```
Precisamos criar páginas de Termos de Uso e Política de Privacidade:

1. Crie um site simples (pode ser Notion, GitHub Pages, ou Vercel)

2. TERMOS DE USO devem incluir:
   - Descrição do serviço
   - Regras de uso
   - Responsabilidades
   - Cancelamentos e reembolsos
   - Propriedade intelectual

3. POLÍTICA DE PRIVACIDADE deve incluir:
   - Dados coletados
   - Como os dados são usados
   - Compartilhamento de dados
   - Segurança
   - Direitos do usuário (LGPD)
   - Contato

4. Hospede as páginas em URLs públicas:
   - https://kourt.app/termos
   - https://kourt.app/privacidade

Me avise quando as páginas estiverem prontas.
```

---

## ✅ CHECKLIST FINAL

### Antes de Publicar:

- [ ] Todos os assets criados (ícone, splash)
- [ ] app.json configurado corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção funcionando
- [ ] Testado em dispositivo real (iOS e Android)
- [ ] Bugs corrigidos
- [ ] Conta Apple Developer ativa
- [ ] Conta Google Play Developer ativa
- [ ] Screenshots prontas
- [ ] Textos de descrição prontos
- [ ] Termos de uso publicados
- [ ] Política de privacidade publicada
- [ ] URL de suporte funcionando

### Após Publicar:

- [ ] Verificar status da revisão diariamente
- [ ] Responder feedback da Apple/Google se houver
- [ ] Monitorar primeiros downloads
- [ ] Configurar analytics
- [ ] Planejar primeira atualização

---

## 🎉 PARABÉNS!

Se você chegou até aqui, seu app está publicado nas lojas!

### Próximos passos:
1. Divulgue para amigos e família
2. Colete feedback dos primeiros usuários
3. Corrija bugs rapidamente
4. Planeje novas funcionalidades
5. Responda avaliações nas lojas

### Suporte:
- Bugs: crie issues no GitHub
- Dúvidas: documentação do Expo
- Comunidade: Discord do Expo

---

## 📊 MÉTRICAS PARA ACOMPANHAR

Configure analytics (Mixpanel ou similar) para acompanhar:
- Downloads por dia
- Usuários ativos (DAU/MAU)
- Taxa de retenção
- Telas mais visitadas
- Conversão de reservas
- Tempo no app

---

*Documento criado para o projeto Kourt*
*Boa sorte com seu app! 🚀*
