# 🧭 ETAPA 4 - NAVEGAÇÃO E ONBOARDING

> **Tempo estimado: 2-3 horas**

---

## PROMPT 4.1 - Layout das Tabs

```
Crie a navegação principal com tabs em app/(tabs)/_layout.tsx:

TABS (5 itens):
1. Home (ícone: Home)
2. Mapa (ícone: Map)
3. + Criar (ícone: Plus) - botão central destacado
4. Reservas (ícone: Calendar)
5. Perfil (ícone: User)

DESIGN:
- Tab bar: bg-white, border-t border-neutral-200
- Height: 80px (incluindo safe area)
- Ícones: 24px
- Labels: text-xs
- Cor ativa: text-black
- Cor inativa: text-neutral-400
- Botão central (+): 
  - Circular, 56px
  - bg-black
  - Elevado (-10px acima da tab bar)
  - Ícone Plus branco

Use expo-router Tabs component.
Me mostre o código completo.
```

---

## PROMPT 4.2 - Tela Home Básica

```
Crie a tela Home em app/(tabs)/index.tsx:

HEADER:
- Logo "Kourt" à esquerda
- Ícone de notificação à direita (com badge se houver)

CONTEÚDO:
- Saudação: "Olá, [Nome]!" com hora do dia (Bom dia/Boa tarde/Boa noite)
- Seção "Próximas Partidas" (vazia por enquanto, mostrar card placeholder)
- Seção "Quadras Perto de Você" (cards horizontais placeholder)
- Seção "Atividade dos Amigos" (lista placeholder)

Use ScrollView.
Por enquanto, use dados mockados.
Me mostre o código.
```

---

## PROMPT 4.3 - Onboarding Welcome

```
Crie a primeira tela de onboarding em app/(onboarding)/welcome.tsx:

DESIGN:
- Tela cheia sem header
- Imagem/ilustração de esportes no topo (pode ser placeholder colorido)
- Título grande: "Bem-vindo ao Kourt"
- Subtítulo: "Encontre quadras, convide amigos e jogue mais"
- 3 bullets com benefícios:
  • "Quadras perto de você"
  • "Jogadores do seu nível"  
  • "Organize partidas em segundos"
- Botão "Começar" (primary, bottom)
- Indicadores de página (1 de 4)

Ao clicar em "Começar", navegar para sports.
Me mostre o código completo.
```

---

## PROMPT 4.4 - Onboarding Esportes

```
Crie a tela de seleção de esportes em app/(onboarding)/sports.tsx:

DESIGN:
- Header com botão voltar
- Progresso: 2/4
- Título: "Quais esportes você pratica?"
- Subtítulo: "Selecione todos que se aplicam"

GRID de esportes (2 colunas):
- Beach Tennis (ícone ou emoji 🎾)
- Padel (ícone 🏸)
- Tênis (ícone 🎾)
- Vôlei (ícone 🏐)
- Futebol (ícone ⚽)
- Basquete (ícone 🏀)

Cada card:
- bg-white border rounded-2xl
- Ícone grande no centro
- Nome do esporte abaixo
- Ao selecionar: border-black bg-neutral-50
- Múltipla seleção permitida

Botão "Continuar" no bottom (desabilitado se nenhum selecionado)
Salvar seleção no AsyncStorage ou store.
Me mostre o código completo.
```

---

## PROMPT 4.5 - Onboarding Nível

```
Crie a tela de nível em app/(onboarding)/level.tsx:

DESIGN:
- Header com botão voltar
- Progresso: 3/4
- Título: "Qual seu nível?"
- Subtítulo: "Isso nos ajuda a encontrar jogadores compatíveis"

OPÇÕES (lista vertical):
1. Iniciante
   - "Estou começando agora"
   - Ícone: Seedling/Sprout

2. Intermediário
   - "Jogo regularmente há alguns meses"
   - Ícone: TrendingUp

3. Avançado
   - "Jogo há anos e participo de torneios"
   - Ícone: Award

4. Profissional
   - "Jogo competitivamente"
   - Ícone: Trophy

Cada opção:
- Card com ícone à esquerda
- Título e descrição
- Radio button visual à direita
- Selecionado: border-black

Botão "Continuar" no bottom.
Me mostre o código completo.
```

---

## PROMPT 4.6 - Onboarding Goals

```
Crie a tela final de onboarding em app/(onboarding)/goals.tsx:

DESIGN:
- Header com botão voltar
- Progresso: 4/4
- Título: "O que você busca?"
- Subtítulo: "Podemos personalizar sua experiência"

OPÇÕES (múltipla seleção):
1. "Jogar mais vezes" - ícone Calendar
2. "Conhecer novos jogadores" - ícone Users
3. "Melhorar meu jogo" - ícone TrendingUp
4. "Participar de torneios" - ícone Trophy
5. "Encontrar quadras" - ícone MapPin

Design igual aos esportes (cards selecionáveis).

Botão "Finalizar" no bottom.

Ao clicar em Finalizar:
1. Salvar todas as preferências
2. Marcar isOnboarded = true no store
3. Navegar para /(tabs)

Me mostre o código completo.
```

---

## PROMPT 4.7 - Layout do Onboarding

```
Crie o layout do grupo onboarding em app/(onboarding)/_layout.tsx:

- Stack navigation
- Header transparente ou oculto (cada tela gerencia seu header)
- Animação de slide horizontal
- Não permitir voltar para auth

Telas no stack:
- welcome
- sports
- level
- goals

Me mostre o código.
```

---

## PROMPT 4.8 - Criar Store de Preferências

```
Crie o store para salvar preferências do onboarding em stores/preferencesStore.ts:

interface PreferencesState {
  sports: string[];
  level: string;
  goals: string[];
  
  setSports: (sports: string[]) => void;
  setLevel: (level: string) => void;
  setGoals: (goals: string[]) => void;
  
  // Persistência
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

Use AsyncStorage para persistir.
Salve também no Supabase (tabela user_preferences) se o usuário estiver logado.

Me mostre o código completo.
```

---

## PROMPT 4.9 - Atualizar Redirecionamentos

```
Atualize o app/_layout.tsx para gerenciar corretamente os redirecionamentos:

Lógica:
1. Se carregando → LoadingScreen
2. Se não autenticado → Redirect para /(auth)/login
3. Se autenticado mas não onboarded → Redirect para /(onboarding)/welcome
4. Se autenticado e onboarded → Mostrar (tabs)

Use o hook useRootNavigationState do expo-router para evitar flash.

Me mostre o código atualizado.
```

---

## PROMPT 4.10 - Testar Fluxos

```
Vamos testar todos os fluxos de navegação:

TESTE 1 - Usuário novo:
1. Abra o app (deve ir para login)
2. Clique em "Cadastre-se"
3. Crie uma conta
4. Deve ir para onboarding/welcome
5. Complete o onboarding
6. Deve chegar nas tabs

TESTE 2 - Usuário existente:
1. Faça logout
2. Faça login novamente
3. Deve ir direto para tabs (pular onboarding)

TESTE 3 - Tab navigation:
1. Navegue entre todas as tabs
2. Clique no botão + central
3. Verifique se as animações estão suaves

Me avise qual teste falhou, se algum.
```

---

## ✅ CHECKLIST ETAPA 4

- [ ] Tab bar com 5 itens funcionando
- [ ] Botão central destacado
- [ ] Home básica com scroll
- [ ] Onboarding welcome
- [ ] Onboarding seleção de esportes
- [ ] Onboarding seleção de nível
- [ ] Onboarding goals
- [ ] Preferências sendo salvas
- [ ] Redirecionamentos corretos
- [ ] Não é possível "voltar" para onboarding após completar

---

## 🚨 ERROS COMUNS

### Erro: "Tab bar not showing"
```
Solução: Verifique se app/(tabs)/_layout.tsx está usando <Tabs>
```

### Erro: "Navigation state not ready"
```
Solução: Use useRootNavigationState para verificar se navegação está pronta
antes de fazer redirect
```

### Erro: "Gesture handler not working"
```
Solução: 
1. Certifique-se que react-native-gesture-handler está instalado
2. Importe no topo do arquivo de entrada:
   import 'react-native-gesture-handler';
```

### Erro: "Stack screen not found"
```
Solução: Verifique se o arquivo existe na pasta correta
e se o nome corresponde à rota
```

---

## PRÓXIMA ETAPA

Quando a navegação e onboarding estiverem funcionando, vá para:
**`05-TELAS-PRINCIPAIS.md`**
