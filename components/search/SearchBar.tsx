import { useState, useEffect, useCallback, useRef } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

const RECENT_SEARCHES_KEY = '@kourt_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchBar({
  onSearch,
  onFocus,
  onBlur,
  placeholder = 'Buscar...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const updated = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Debounced search
  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch(text);
      }, 300);
    },
    [onSearch],
  );

  const handleSubmit = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onSearch(query.trim());
    }
  };

  const handleSelectRecent = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setFocused(false);
  };

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow selection
    setTimeout(() => {
      setFocused(false);
      onBlur?.();
    }, 200);
  };

  return (
    <View className="relative">
      {/* Search Input */}
      <View className="flex-row items-center bg-neutral-100 rounded-full px-4 py-3">
        <MaterialIcons name="search" size={20} color="#737373" />
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#A3A3A3"
          returnKeyType="search"
          className="flex-1 ml-2 text-black"
          style={{ fontSize: 16 }}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              onSearch('');
            }}
          >
            <MaterialIcons name="close" size={20} color="#737373" />
          </Pressable>
        )}
      </View>

      {/* Recent Searches Dropdown */}
      {focused && recentSearches.length > 0 && query.length === 0 && (
        <View className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-100 z-50">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
            <Text className="text-sm font-medium text-neutral-500">
              Buscas recentes
            </Text>
            <Pressable onPress={clearRecentSearches}>
              <Text className="text-xs text-neutral-400">Limpar</Text>
            </Pressable>
          </View>
          {recentSearches.map((search, index) => (
            <Pressable
              key={index}
              onPress={() => handleSelectRecent(search)}
              className="flex-row items-center px-4 py-3 border-b border-neutral-50"
            >
              <MaterialIcons name="history" size={18} color="#A3A3A3" />
              <Text className="ml-3 text-black">{search}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
