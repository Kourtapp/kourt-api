# Kourt - User Flow Detalhado

## Visao Geral

Kourt e um aplicativo de esportes de raquete (Beach Tennis, Padel, Tenis) que conecta jogadores, quadras e partidas em tempo real.

---

## 1. Onboarding e Autenticacao

### 1.1 Primeira Abertura

```text
Splash Screen → Welcome Screen → Escolher metodo de login
```

### 1.2 Metodos de Login

- **Email/Senha**: Cadastro tradicional com verificacao de email
- **Google Sign-In**: Login rapido com conta Google
- **Apple Sign-In**: Login com Apple ID (iOS)

### 1.3 Fluxo de Onboarding (Primeiro Acesso)

```text
Login → Onboarding Step 1 → Step 2 → Step 3 → Home
```

**Step 1 - Perfil Basico:**

- Nome completo
- Username (@usuario)
- Foto de perfil (opcional)
- Cidade/Bairro

**Step 2 - Preferencias Esportivas:**

- Esportes praticados (Beach Tennis, Padel, Tenis, etc.)
- Nivel em cada esporte (Iniciante, Intermediario, Avancado)
- Frequencia de jogo (1x, 2-3x, 4+ por semana)

**Step 3 - Disponibilidade:**

- Horarios preferidos (Manha, Tarde, Noite)
- Dias da semana disponiveis
- Objetivos (Competir, Socializar, Melhorar, Saude)

---

## 2. Tela Home (Tab Principal)

### 2.1 Estrutura

```text
┌─────────────────────────────────────┐
│  Header: Saudacao + Cidade + Notif  │
├─────────────────────────────────────┤
│  Filtros: Esporte | Tipo Quadra     │
├─────────────────────────────────────┤
│  Secao: Quadras perto de voce       │
│  [Cards horizontais com quadras]    │
├─────────────────────────────────────┤
│  Secao: Jogos acontecendo (live)    │
│  [Lista de partidas em andamento]   │
├─────────────────────────────────────┤
│  Secao: Melhores da regiao          │
│  [Cards de quadras top avaliadas]   │
├─────────────────────────────────────┤
│  Secao: Seus Desafios               │
│  [Desafios ativos do usuario]       │
├─────────────────────────────────────┤
│  Secao: Descubra novos esportes     │
│  [Grid de esportes para explorar]   │
└─────────────────────────────────────┘
```

### 2.2 Acoes Disponiveis

- **Tocar em quadra** → Abre detalhes da quadra
- **Tocar em partida ao vivo** → Assistir/Entrar na partida
- **Pull to refresh** → Atualiza dados em tempo real
- **Sino de notificacoes** → Lista de notificacoes

---

## 3. Tela Social (Feed)

### 3.1 Abas

```text
[ Feed ] [ Partidas ] [ Torneios ]
```

### 3.2 Aba Feed

**Conteudo em tempo real:**

- Posts de resultados de partidas
- Conquistas desbloqueadas
- Fotos compartilhadas
- Posts de texto

**Estrutura de Post:**

```text
┌─────────────────────────────────────┐
│  Avatar | Nome | @username | Tempo  │
├─────────────────────────────────────┤
│  [Foto da partida - opcional]       │
├─────────────────────────────────────┤
│  Resultado: Vitoria/Derrota         │
│  Placar: 6-4, 6-3                   │
│  Local: Arena Beach Tennis          │
│  Duracao: 1h 23min                  │
│  +150 XP                            │
├─────────────────────────────────────┤
│  ❤️ 24  💬 5  ↗️ Compartilhar       │
└─────────────────────────────────────┘
```

**Acoes:**

- Curtir post
- Comentar
- Compartilhar
- Ver perfil do autor

### 3.3 Aba Partidas

**Lista de partidas abertas:**

- Titulo da partida
- Data/Hora
- Local
- Vagas disponiveis (3/4)
- Nivel requerido
- Botao "Entrar"

### 3.4 Aba Torneios

- Banner "Criar Torneio" (PRO)
- Lista de torneios disponiveis
- Inscricao em torneios

---

## 4. Fluxo de Quadras

### 4.1 Descobrir Quadras

```text
Home → Secao Quadras → Ver todas → Lista de Quadras
```

### 4.2 Detalhes da Quadra

```text
┌─────────────────────────────────────┐
│  [Galeria de fotos]                 │
├─────────────────────────────────────┤
│  Nome da Quadra                     │
│  ⭐ 4.8 (247 avaliacoes)            │
│  📍 Pinheiros, Sao Paulo            │
├─────────────────────────────────────┤
│  Tipo: Privada | Indoor | Iluminada │
├─────────────────────────────────────┤
│  Preco: R$ 120/hora                 │
├─────────────────────────────────────┤
│  [Mapa com localizacao]             │
├─────────────────────────────────────┤
│  Avaliacoes dos usuarios            │
├─────────────────────────────────────┤
│  [ Reservar ]  [ Criar Partida ]    │
└─────────────────────────────────────┘
```

### 4.3 Adicionar Nova Quadra

```text
Quadras → + Adicionar → Formulario → Enviar
```

**Campos:**

- Nome da quadra
- Tipo (Publica, Privada, Particular)
- Endereco completo
- Esporte principal
- Preco por hora (se aplicavel)
- Fotos
- Caracteristicas (indoor, iluminacao, vestiario)

---

## 5. Fluxo de Partidas

### 5.1 Criar Partida

```text
Home → FAB (+) → Criar Partida → Formulario
```

**Campos:**

- Titulo da partida
- Esporte
- Data e hora
- Quadra (buscar ou selecionar)
- Numero de jogadores (2, 4, 6, etc.)
- Nivel (Iniciante, Intermediario, Avancado, Qualquer)
- Partida publica ou privada
- Descricao (opcional)

### 5.2 Entrar em Partida

```text
Feed/Home → Partida Aberta → Ver Detalhes → Entrar
```

**Fluxo de Check-in:**

```text
┌─────────────────────────────────────┐
│  Confirmar Entrada                  │
├─────────────────────────────────────┤
│  Beach Tennis Duplas                │
│  📅 Hoje, 18:00                     │
│  📍 Arena Beach Club                │
│  👥 3/4 jogadores                   │
├─────────────────────────────────────┤
│  [ Cancelar ]  [ Confirmar ]        │
└─────────────────────────────────────┘
```

### 5.3 Partida ao Vivo

```text
Partida → Iniciar → Placar ao Vivo → Finalizar
```

**Tela de Placar:**

```text
┌─────────────────────────────────────┐
│  Beach Tennis - AO VIVO 🔴          │
├─────────────────────────────────────┤
│                                     │
│   Time A          Time B            │
│     6               4               │
│                                     │
│   Set 1: 6-4                        │
│   Set 2: Em andamento               │
│                                     │
├─────────────────────────────────────┤
│  [ +1 Time A ]    [ +1 Time B ]     │
├─────────────────────────────────────┤
│  [ Finalizar Partida ]              │
└─────────────────────────────────────┘
```

### 5.4 Pos-Partida

```text
Finalizar → Registrar Resultado → Compartilhar → XP Ganho
```

**Tela de Resultado:**

- Placar final
- Vencedor
- Duracao
- Metricas (aces, winners, etc. - opcional)
- Tirar foto
- XP ganho
- Botao compartilhar no feed

---

## 6. Fluxo de Perfil

### 6.1 Meu Perfil

```text
Tab Perfil → Visualizacao do perfil proprio
```

**Secoes:**

- Foto e informacoes basicas
- Nivel e XP
- Estatisticas (partidas, vitorias, streak)
- Esportes e niveis
- Historico de partidas
- Conquistas
- Configuracoes

### 6.2 Perfil de Outro Usuario

```text
Feed/Busca → Tocar no usuario → Perfil publico
```

**Acoes disponiveis:**

- Seguir/Deixar de seguir
- Enviar mensagem
- Convidar para partida
- Ver estatisticas publicas

### 6.3 Editar Perfil

```text
Meu Perfil → Editar → Formulario → Salvar
```

---

## 7. Rankings

### 7.1 Tipos de Ranking

```text
Rankings → [ PRO | Amador | Privado ]
```

**Ranking PRO (Assinantes):**

- Ranking oficial por esporte
- Pontuacao baseada em resultados
- Posicao nacional/regional

**Ranking Amador (Gratuito):**

- Ranking casual
- Pontuacao simplificada

**Ranking Privado:**

- Criar grupo com amigos
- Codigo de convite
- Ranking interno do grupo

### 7.2 Criar Ranking Privado

```text
Rankings → Privado → Criar → Nome → Codigo gerado
```

### 7.3 Entrar em Ranking

```text
Rankings → Privado → Entrar → Digitar codigo → Confirmar
```

---

## 8. Busca de Jogadores

### 8.1 Fluxo de Busca

```text
Home/Social → Buscar → Digitar nome/esporte → Resultados
```

### 8.2 Filtros

- Nivel (Iniciante, Intermediario, Avancado)
- Esporte
- Proximidade

### 8.3 Card de Jogador

```text
┌─────────────────────────────────────┐
│  Avatar | Nome | Nivel Badge        │
│  @username                          │
│  🎾 89 partidas | 58% vitorias      │
│  [Beach Tennis] [Padel]             │
│                      [ Convidar ]   │
└─────────────────────────────────────┘
```

---

## 9. Notificacoes

### 9.1 Tipos de Notificacao

- Convite para partida
- Partida comecando em X minutos
- Novo seguidor
- Curtida/Comentario no post
- Conquista desbloqueada
- Lembrete de partida

### 9.2 Fluxo

```text
Push Notification → Abrir app → Tela relevante
```

---

## 10. Assinatura PRO

### 10.1 Beneficios PRO

- Ranking PRO oficial
- Estatisticas avancadas
- Criar torneios
- Sem anuncios
- Badge exclusivo

### 10.2 Fluxo de Assinatura

```text
Perfil → Assinar PRO → Planos → Pagamento → Ativado
```

---

## 11. Real-Time Features

### 11.1 O que atualiza em tempo real

- Feed de posts (novos posts aparecem automaticamente)
- Placar de partidas ao vivo
- Novas quadras adicionadas
- Partidas criadas/atualizadas
- Contadores de likes/comentarios

### 11.2 Tecnologia

- Supabase Realtime (PostgreSQL Changes)
- WebSocket connections
- Optimistic UI updates

---

## 12. Fluxo de Erro/Estados Vazios

### 12.1 Estados Vazios

- "Nenhuma quadra encontrada" → Botao adicionar quadra
- "Nenhuma partida aberta" → Botao criar partida
- "Nenhum post ainda" → Incentivo a jogar
- "Perfil nao encontrado" → Botao voltar

### 12.2 Tratamento de Erros

- Sem conexao → Mensagem + Retry
- Falha no login → Mensagem especifica
- Erro ao carregar → Pull to refresh

---

## 13. Navegacao

### 13.1 Tab Bar Principal

```text
[ Home ] [ Social ] [ + ] [ Buscar ] [ Perfil ]
```

### 13.2 Navegacao Stack

- Telas de detalhe empilham sobre tabs
- Botao voltar no header
- Gestos de swipe para voltar (iOS)

---

## 14. Permissoes

### 14.1 Solicitadas

- **Localizacao**: Para quadras proximas e mapa
- **Camera**: Para fotos de perfil e partidas
- **Notificacoes**: Para alertas de partidas
- **Galeria**: Para selecionar fotos

### 14.2 Fluxo de Permissao

```text
Acao que requer permissao → Modal explicativo → Solicitar → Continuar/Negar
```

---

## 15. Metricas e Gamificacao

### 15.1 Sistema de XP

- Partida jogada: +50 XP
- Vitoria: +100 XP
- Desafio completo: +150 XP
- Primeira partida do dia: +25 XP bonus

### 15.2 Niveis

- Level 1-10: Iniciante
- Level 11-25: Intermediario
- Level 26-50: Avancado
- Level 51+: Expert

### 15.3 Conquistas

- Primeira vitoria
- 10 vitorias seguidas
- 100 partidas jogadas
- Jogar em 10 quadras diferentes
- etc.

---

## Diagrama de Navegacao Simplificado

```text
                    ┌─────────────┐
                    │   Splash    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Auth     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐     │     ┌──────▼──────┐
       │  Onboarding │     │     │    Home     │
       └──────┬──────┘     │     └──────┬──────┘
              │            │            │
              └────────────┼────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
 ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
 │   Social    │    │   Buscar    │    │   Perfil   │
 └─────────────┘    └─────────────┘    └─────────────┘
```
