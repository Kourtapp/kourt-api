# 📚 KOURT APP - GUIA COMPLETO DE DESENVOLVIMENTO

> **Use este guia para criar o app Kourt do zero usando o Antigravity ou Claude Code**

---

## 🎯 OBJETIVO

Criar um aplicativo mobile (iOS + Android) para:
- Encontrar e reservar quadras esportivas
- Organizar partidas com amigos
- Acompanhar estatísticas e ranking
- Conectar com comunidade esportiva

---

## 📁 ESTRUTURA DOS DOCUMENTOS

| Arquivo | Descrição | Tempo |
|---------|-----------|-------|
| [00-PROMPT-INICIAL.md](./00-PROMPT-INICIAL.md) | Prompt para iniciar o projeto | 5 min |
| [01-SETUP-PROJETO.md](./01-SETUP-PROJETO.md) | Configuração do Expo + NativeWind | 30-45 min |
| [02-COMPONENTES-BASE.md](./02-COMPONENTES-BASE.md) | Componentes UI reutilizáveis | 1-2 horas |
| [03-AUTENTICACAO.md](./03-AUTENTICACAO.md) | Login, registro, Supabase auth | 2-3 horas |
| [04-NAVEGACAO.md](./04-NAVEGACAO.md) | Expo Router, tabs, onboarding | 2-3 horas |
| [05-TELAS-PRINCIPAIS.md](./05-TELAS-PRINCIPAIS.md) | Home, Mapa, Perfil, etc | 4-6 horas |
| [06-BACKEND-SUPABASE.md](./06-BACKEND-SUPABASE.md) | Banco de dados e queries | 3-4 horas |
| [07-FUNCIONALIDADES.md](./07-FUNCIONALIDADES.md) | Pagamentos, chat, push | 4-6 horas |
| [08-FINALIZACAO.md](./08-FINALIZACAO.md) | Build e publicação | 2-4 horas |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Cores, tipografia, componentes | Referência |

---

## ⏱️ TEMPO TOTAL ESTIMADO

| Fase | Tempo |
|------|-------|
| Setup e componentes | 3-4 horas |
| Auth e navegação | 4-6 horas |
| Telas principais | 4-6 horas |
| Backend | 3-4 horas |
| Funcionalidades avançadas | 4-6 horas |
| Testes e publicação | 2-4 horas |
| **TOTAL** | **20-30 horas** |

> 💡 Para iniciantes, considere 2x esse tempo

---

## 🚀 COMO USAR

### Passo 1: Preparação
1. Instale o [Node.js](https://nodejs.org) (versão 18+)
2. Instale o [VS Code](https://code.visualstudio.com)
3. Instale o [Expo Go](https://expo.dev/client) no celular
4. Crie conta no [Supabase](https://supabase.com)
5. Crie conta no [Expo](https://expo.dev)

### Passo 2: Iniciar com Antigravity/Claude Code
1. Abra o Antigravity
2. Copie o conteúdo de `00-PROMPT-INICIAL.md`
3. Cole e envie
4. Siga as instruções do agente

### Passo 3: Seguir as Etapas
1. Complete cada etapa antes de ir para a próxima
2. Marque os checkboxes à medida que avança
3. Se der erro, peça ajuda ao agente
4. Teste cada funcionalidade antes de continuar

### Passo 4: Finalizar
1. Teste em dispositivo real
2. Corrija bugs
3. Prepare assets e textos
4. Publique nas lojas

---

## 🛠️ STACK TECNOLÓGICA

```
┌─────────────────────────────────────────┐
│              FRONTEND                    │
├─────────────────────────────────────────┤
│ • React Native + Expo SDK 50+           │
│ • TypeScript                            │
│ • NativeWind (Tailwind CSS)             │
│ • Expo Router (navegação)               │
│ • Zustand (estado)                      │
│ • React Query (data fetching)           │
│ • React Hook Form + Zod (forms)         │
│ • Lucide (ícones)                       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              BACKEND                     │
├─────────────────────────────────────────┤
│ • Supabase                              │
│   - Auth (autenticação)                 │
│   - PostgreSQL (banco de dados)         │
│   - Storage (arquivos)                  │
│   - Realtime (chat)                     │
│   - Edge Functions (lógica)             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│            SERVIÇOS                      │
├─────────────────────────────────────────┤
│ • Stripe (pagamentos)                   │
│ • Mapbox (mapas)                        │
│ • Expo Notifications (push)             │
│ • EAS Build (builds)                    │
└─────────────────────────────────────────┘
```

---

## 📱 TELAS DO APP

### Total: 53 telas

```
ONBOARDING (8)
├── Login
├── Registro
├── Esqueci senha
├── Welcome
├── Seleção de esportes
├── Seleção de nível
├── Frequência
└── Objetivos

PRINCIPAL (7)
├── Home
├── Mapa
├── Social
├── Reservas
├── Notificações
├── Perfil
└── Menu +

QUADRAS (9)
├── Filtros
├── Detalhes quadra
├── Quadra pública
├── Galeria
├── Avaliações
├── Checkout
├── Pagamento
├── Confirmação
└── Cancelar

JOGAR (6)
├── Criar partida
├── Convidar
├── Buscar jogadores
├── Check-in
├── Iniciar partida
└── Placar ao vivo

PÓS-JOGO (8)
├── Registrar
├── Avaliar
├── Fotos
├── Compartilhar
├── Completo
├── Estatísticas
├── Análise IA
└── Histórico

SOCIAL (8)
├── Perfil público
├── Stats jogador
├── Chat
├── Atividades
├── Conquistas
├── Desafios
├── Torneios
└── Indicações

RANKINGS (2)
├── Amador
└── PRO

CONFIG (5)
├── Configurações
├── Editar perfil
├── Privacidade
├── Assinatura
└── Ajuda
```

---

## 🎨 DESIGN

### Cores Principais
- **Primária**: Preto (#000000)
- **Background**: Cinza claro (#FAFAFA)
- **Cards**: Branco (#FFFFFF)
- **Sucesso**: Verde (#22C55E)
- **Erro**: Vermelho (#EF4444)

### Tipografia
- **Fonte**: Inter (ou sistema)
- **Títulos**: Bold/Semibold
- **Corpo**: Regular, 14-16px

### Componentes
- Cantos arredondados (12-16px)
- Sombras sutis
- Ícones Lucide
- Feedback de toque

---

## 💰 CUSTOS ESTIMADOS

| Item | Custo |
|------|-------|
| Apple Developer | R$ 500/ano |
| Google Play | R$ 125 (única vez) |
| Supabase | Grátis (até 500MB) |
| Stripe | 3.4% + R$0.60 por transação |
| Mapbox | Grátis (50k loads/mês) |
| **Total inicial** | **~R$ 625** |

---

## 📞 SUPORTE

Se tiver problemas:
1. Descreva o erro detalhadamente ao agente
2. Copie mensagens de erro completas
3. Consulte a documentação oficial:
   - [Expo Docs](https://docs.expo.dev)
   - [Supabase Docs](https://supabase.com/docs)
   - [NativeWind Docs](https://nativewind.dev)

---

## ✅ CHECKLIST GERAL

- [ ] **Etapa 1**: Projeto configurado e rodando
- [ ] **Etapa 2**: Componentes base funcionando
- [ ] **Etapa 3**: Autenticação completa
- [ ] **Etapa 4**: Navegação e onboarding
- [ ] **Etapa 5**: Todas as telas principais
- [ ] **Etapa 6**: Backend integrado
- [ ] **Etapa 7**: Funcionalidades avançadas
- [ ] **Etapa 8**: App publicado nas lojas

---

*Boa sorte com o desenvolvimento! 🚀*

*Documento criado para auxiliar iniciantes na criação do app Kourt*
