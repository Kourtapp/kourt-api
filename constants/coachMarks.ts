// constants/coachMarks.ts
export interface CoachMark {
  id: string;
  screen: string;
  title: string;
  description: string;
  targetId: string;
  position: 'top' | 'bottom' | 'center';
}

export const COACH_MARKS: CoachMark[] = [
  {
    id: 'home-1',
    screen: 'home',
    title: 'Bem-vindo ao Kourt!',
    description:
      'Aqui voce acompanha seu nivel, XP e sequencia de dias jogando.',
    targetId: 'gamification-card',
    position: 'bottom',
  },
  {
    id: 'home-2',
    screen: 'home',
    title: 'Seus esportes',
    description: 'Filtre o conteudo pelo esporte que voce quer ver.',
    targetId: 'sport-pills',
    position: 'bottom',
  },
  {
    id: 'home-3',
    screen: 'home',
    title: 'Desafio Diario',
    description: 'Complete desafios para ganhar XP extra!',
    targetId: 'daily-challenge',
    position: 'top',
  },
  {
    id: 'home-4',
    screen: 'home',
    title: 'Quadras proximas',
    description: 'Encontre e reserve quadras perto de voce.',
    targetId: 'courts-section',
    position: 'top',
  },
  {
    id: 'tabbar',
    screen: 'home',
    title: 'Navegacao',
    description: 'Use o botao + para reservar quadras ou criar partidas.',
    targetId: 'tab-plus',
    position: 'top',
  },
];
