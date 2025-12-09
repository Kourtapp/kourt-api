import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
}

// Standard dark color
const BUTTON_PRIMARY_COLOR = '#000000';

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-full';

  const variantStyles = {
    primary: 'bg-black',
    secondary: 'bg-gray-100',
    outline: 'bg-transparent border border-black',
    ghost: 'bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
    xl: 'px-8 py-5',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-black',
    outline: 'text-black',
    ghost: 'text-black',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-lg',
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : BUTTON_PRIMARY_COLOR} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]} ${icon ? 'ml-2' : ''}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export { BUTTON_PRIMARY_COLOR };
