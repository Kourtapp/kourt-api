# 🚀 PROMPT INICIAL - KOURT APP

> **Cole este prompt inteiro no Antigravity/Claude Code para iniciar o projeto**

---

## PROMPT PARA INICIAR O PROJETO:

```
Você vai me ajudar a criar o KOURT, um aplicativo mobile de agendamento de quadras esportivas e organização de partidas.

## SOBRE MIM
- Sou iniciante em programação
- Preciso de explicações claras e passo a passo
- Quando der erro, me ajude a resolver com calma
- Prefiro que você faça o código e eu aprenda observando

## SOBRE O APP
Nome: Kourt
Tipo: App mobile (iOS + Android)
Propósito: Encontrar quadras esportivas, reservar e organizar partidas com amigos
Esportes: Beach Tennis, Padel, Tênis, Vôlei, Futebol

## STACK TECNOLÓGICA (não mude isso)
- Frontend: React Native + Expo (SDK 50+)
- Linguagem: TypeScript
- Estilização: NativeWind (Tailwind para React Native)
- Navegação: Expo Router (file-based routing)
- Backend: Supabase (auth, database, storage)
- Mapas: React Native Maps + Mapbox
- Pagamentos: Stripe
- Estado: Zustand
- Forms: React Hook Form + Zod

## DESIGN SYSTEM
- Fonte: Inter (ou system font)
- Cor primária: Preto (#000000)
- Background: #FAFAFA
- Cards: Branco (#FFFFFF)
- Bordas: #E5E5E5
- Sucesso: #22C55E
- Erro: #EF4444
- Cantos arredondados: 12px (rounded-xl) e 16px (rounded-2xl)
- Ícones: Lucide React Native

## ESTRUTURA DE PASTAS QUE QUERO
```
kourt-app/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Telas de autenticação
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/      # Fluxo de onboarding
│   │   ├── welcome.tsx
│   │   ├── sports.tsx
│   │   ├── level.tsx
│   │   └── goals.tsx
│   ├── (tabs)/            # Navegação principal
│   │   ├── index.tsx      # Home
│   │   ├── map.tsx        # Mapa
│   │   ├── social.tsx     # Social
│   │   ├── bookings.tsx   # Reservas
│   │   └── profile.tsx    # Perfil
│   ├── court/[id].tsx     # Detalhes da quadra
│   ├── checkout.tsx       # Checkout
│   └── _layout.tsx        # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Button, Input, Card)
│   └── features/         # Componentes específicos
├── lib/                  # Utilitários
│   ├── supabase.ts
│   └── utils.ts
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── constants/            # Constantes (cores, etc)
```

## PRIMEIRA TAREFA
1. Crie a estrutura inicial do projeto Expo com TypeScript
2. Configure o NativeWind
3. Crie o arquivo de constantes com as cores
4. Crie os componentes base: Button, Input, Card

Vá passo a passo, me mostrando cada arquivo criado e explicando brevemente o que faz.

Quando eu disser "próximo", avance para a próxima etapa.
Quando eu disser "erro", me ajude a resolver.
Quando eu disser "explica", explique com mais detalhes.

Vamos começar?
```

---

## COMO USAR

1. Abra o Antigravity
2. Cole o prompt acima
3. Siga as instruções do agente
4. Quando completar cada etapa, diga "próximo"
5. Se der erro, copie o erro e diga "erro: [cole o erro aqui]"

---

## PRÓXIMOS PROMPTS

Após completar a configuração inicial, use os prompts dos arquivos:
- `01-SETUP-PROJETO.md` - Configuração do projeto
- `02-COMPONENTES-BASE.md` - Componentes UI
- `03-AUTENTICACAO.md` - Login e registro
- `04-NAVEGACAO.md` - Estrutura de navegação
- `05-TELAS-PRINCIPAIS.md` - Home, Mapa, etc
- `06-BACKEND-SUPABASE.md` - Configuração do banco
- `07-FUNCIONALIDADES.md` - Features do app
- `08-FINALIZACAO.md` - Build e publicação
