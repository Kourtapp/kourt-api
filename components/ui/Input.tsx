import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-white border rounded-xl px-4 py-3 ${error ? 'border-error' : 'border-border'}`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className={`flex-1 text-base text-primary ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
      {error && <Text className="text-sm text-error mt-1">{error}</Text>}
    </View>
  );
}
