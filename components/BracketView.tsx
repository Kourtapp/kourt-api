
import { View, Text, ScrollView } from 'react-native';

interface Match {
    id: string;
    player1: string;
    player2: string;
    score1?: number;
    score2?: number;
    winner?: number;
    round: number;
}

export default function BracketView({ participants }: { participants: any[] }) {
    // Mock bracket data for visual MVP
    const rounds = [
        { name: 'Quartas', matches: [1, 2, 3, 4] },
        { name: 'Semi', matches: [1, 2] },
        { name: 'Final', matches: [1] },
    ];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-4">
            <View className="flex-row gap-8 pl-4 pr-8">
                {rounds.map((round, roundIndex) => (
                    <View key={roundIndex} className="w-40 justify-center">
                        <Text className="text-center text-neutral-400 font-bold uppercase text-xs mb-4">{round.name}</Text>
                        <View className="gap-6 justify-around flex-1">
                            {round.matches.map((_, matchIndex) => (
                                <View key={matchIndex} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                                    {/* Player 1 */}
                                    <View className="flex-row justify-between items-center p-2 border-b border-neutral-100 bg-neutral-50/50">
                                        <Text className="text-xs font-semibold text-neutral-600">Jogador A</Text>
                                        <Text className="text-xs font-bold bg-neutral-200 px-1.5 rounded">6</Text>
                                    </View>
                                    {/* Player 2 */}
                                    <View className="flex-row justify-between items-center p-2">
                                        <Text className="text-xs font-semibold text-neutral-600">Jogador B</Text>
                                        <Text className="text-xs font-bold text-neutral-400 px-1.5">4</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
