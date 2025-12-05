import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';

// Extended cities list with more Brazilian cities
const BRAZILIAN_CITIES = [
  { id: '1', name: 'São Paulo', state: 'SP', region: 'Sudeste' },
  { id: '2', name: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste' },
  { id: '3', name: 'Belo Horizonte', state: 'MG', region: 'Sudeste' },
  { id: '4', name: 'Curitiba', state: 'PR', region: 'Sul' },
  { id: '5', name: 'Porto Alegre', state: 'RS', region: 'Sul' },
  { id: '6', name: 'Florianópolis', state: 'SC', region: 'Sul' },
  { id: '7', name: 'Brasília', state: 'DF', region: 'Centro-Oeste' },
  { id: '8', name: 'Salvador', state: 'BA', region: 'Nordeste' },
  { id: '9', name: 'Fortaleza', state: 'CE', region: 'Nordeste' },
  { id: '10', name: 'Recife', state: 'PE', region: 'Nordeste' },
  { id: '11', name: 'Campinas', state: 'SP', region: 'Sudeste' },
  { id: '12', name: 'Santos', state: 'SP', region: 'Sudeste' },
  { id: '13', name: 'Vinhedo', state: 'SP', region: 'Sudeste' },
  { id: '14', name: 'Valinhos', state: 'SP', region: 'Sudeste' },
  { id: '15', name: 'Jundiaí', state: 'SP', region: 'Sudeste' },
  { id: '16', name: 'Sorocaba', state: 'SP', region: 'Sudeste' },
  { id: '17', name: 'Ribeirão Preto', state: 'SP', region: 'Sudeste' },
  { id: '18', name: 'São José dos Campos', state: 'SP', region: 'Sudeste' },
  { id: '19', name: 'Uberlândia', state: 'MG', region: 'Sudeste' },
  { id: '20', name: 'Goiânia', state: 'GO', region: 'Centro-Oeste' },
  { id: '21', name: 'Manaus', state: 'AM', region: 'Norte' },
  { id: '22', name: 'Belém', state: 'PA', region: 'Norte' },
  { id: '23', name: 'Joinville', state: 'SC', region: 'Sul' },
  { id: '24', name: 'Londrina', state: 'PR', region: 'Sul' },
  { id: '25', name: 'Niterói', state: 'RJ', region: 'Sudeste' },
  { id: '26', name: 'Guarulhos', state: 'SP', region: 'Sudeste' },
  { id: '27', name: 'Osasco', state: 'SP', region: 'Sudeste' },
  { id: '28', name: 'Santo André', state: 'SP', region: 'Sudeste' },
  { id: '29', name: 'São Bernardo do Campo', state: 'SP', region: 'Sudeste' },
  { id: '30', name: 'Vitória', state: 'ES', region: 'Sudeste' },
  { id: '31', name: 'Natal', state: 'RN', region: 'Nordeste' },
  { id: '32', name: 'João Pessoa', state: 'PB', region: 'Nordeste' },
  { id: '33', name: 'Maceió', state: 'AL', region: 'Nordeste' },
  { id: '34', name: 'Aracaju', state: 'SE', region: 'Nordeste' },
  { id: '35', name: 'Teresina', state: 'PI', region: 'Nordeste' },
  { id: '36', name: 'Campo Grande', state: 'MS', region: 'Centro-Oeste' },
  { id: '37', name: 'Cuiabá', state: 'MT', region: 'Centro-Oeste' },
  { id: '38', name: 'São Luís', state: 'MA', region: 'Nordeste' },
  { id: '39', name: 'Piracicaba', state: 'SP', region: 'Sudeste' },
  { id: '40', name: 'Bauru', state: 'SP', region: 'Sudeste' },
];

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: { name: string; state: string }) => void;
  placeholder?: string;
}

export function CityAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar cidade...',
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<typeof BRAZILIAN_CITIES>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter cities based on query
  const searchCities = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const normalizedQuery = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const filtered = BRAZILIAN_CITIES.filter((city) => {
        const normalizedName = city.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedState = city.state.toLowerCase();

        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedState.includes(normalizedQuery) ||
          `${normalizedName} ${normalizedState}`.includes(normalizedQuery)
        );
      }).slice(0, 8);

      setResults(filtered);
      setLoading(false);
    }, 150);
  }, []);

  // Update results when query changes
  useEffect(() => {
    searchCities(query);
  }, [query, searchCities]);

  const handleSelect = (city: typeof BRAZILIAN_CITIES[0]) => {
    setQuery(city.name);
    setResults([]);
    setIsFocused(false);
    onSelect({ name: city.name, state: city.state });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <View className="relative z-50">
      {/* Input Field */}
      <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3 border border-neutral-200">
        <MaterialIcons name="search" size={20} color="#A3A3A3" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor="#A3A3A3"
          className="flex-1 ml-3 text-base text-black"
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#A3A3A3" />
        ) : query.length > 0 ? (
          <Pressable onPress={handleClear}>
            <MaterialIcons name="close" size={20} color="#A3A3A3" />
          </Pressable>
        ) : null}
      </View>

      {/* Results Dropdown */}
      {isFocused && results.length > 0 && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden z-50">
          {results.map((city, index) => (
            <Pressable
              key={city.id}
              onPress={() => handleSelect(city)}
              className={`flex-row items-center px-4 py-3 ${
                index < results.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <MaterialIcons name="place" size={18} color="#84CC16" />
              <View className="ml-3 flex-1">
                <Text className="text-black font-medium">{city.name}</Text>
                <Text className="text-neutral-500 text-sm">{city.state} · {city.region}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* No Results */}
      {isFocused && query.length > 0 && results.length === 0 && !loading && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg p-4 z-50">
          <View className="items-center">
            <MaterialIcons name="location-off" size={24} color="#A3A3A3" />
            <Text className="text-neutral-500 mt-2">Nenhuma cidade encontrada</Text>
            <Text className="text-neutral-400 text-sm">Tente outra busca</Text>
          </View>
        </View>
      )}
    </View>
  );
}
