import { Platform } from 'react-native';
import * as Device from 'expo-device';

// iPhone models and their release years
// iPhone 11 was released in 2019, model identifiers: iPhone12,1 iPhone12,3 iPhone12,5
// We want iPhone 11 (2019) and newer
const MINIMUM_IPHONE_YEAR = 2019;

// iPhone model identifier to year mapping
const IPHONE_MODELS: Record<string, number> = {
  // iPhone 11 series (2019)
  'iPhone12,1': 2019, // iPhone 11
  'iPhone12,3': 2019, // iPhone 11 Pro
  'iPhone12,5': 2019, // iPhone 11 Pro Max
  // iPhone SE 2nd gen (2020)
  'iPhone12,8': 2020,
  // iPhone 12 series (2020)
  'iPhone13,1': 2020, // iPhone 12 mini
  'iPhone13,2': 2020, // iPhone 12
  'iPhone13,3': 2020, // iPhone 12 Pro
  'iPhone13,4': 2020, // iPhone 12 Pro Max
  // iPhone 13 series (2021)
  'iPhone14,2': 2021, // iPhone 13 Pro
  'iPhone14,3': 2021, // iPhone 13 Pro Max
  'iPhone14,4': 2021, // iPhone 13 mini
  'iPhone14,5': 2021, // iPhone 13
  // iPhone SE 3rd gen (2022)
  'iPhone14,6': 2022,
  // iPhone 14 series (2022)
  'iPhone14,7': 2022, // iPhone 14
  'iPhone14,8': 2022, // iPhone 14 Plus
  'iPhone15,2': 2022, // iPhone 14 Pro
  'iPhone15,3': 2022, // iPhone 14 Pro Max
  // iPhone 15 series (2023)
  'iPhone15,4': 2023, // iPhone 15
  'iPhone15,5': 2023, // iPhone 15 Plus
  'iPhone16,1': 2023, // iPhone 15 Pro
  'iPhone16,2': 2023, // iPhone 15 Pro Max
  // iPhone 16 series (2024)
  'iPhone17,1': 2024, // iPhone 16 Pro
  'iPhone17,2': 2024, // iPhone 16 Pro Max
  'iPhone17,3': 2024, // iPhone 16
  'iPhone17,4': 2024, // iPhone 16 Plus
};

export interface DeviceCheckResult {
  isSupported: boolean;
  deviceName: string | null;
  modelId: string | null;
  isIOS: boolean;
  reason?: string;
}

/**
 * Verifica se o dispositivo é compatível para registro de quadras
 * Requisito: iPhone 11 ou superior (para qualidade de câmera)
 */
export function useDeviceCheck(): DeviceCheckResult {
  // Not iOS - not supported for court registration photos
  if (Platform.OS !== 'ios') {
    return {
      isSupported: false,
      deviceName: Device.modelName,
      modelId: Device.modelId,
      isIOS: false,
      reason: 'O registro de quadras com fotos está disponível apenas para dispositivos iOS.',
    };
  }

  const modelId = Device.modelId;
  const deviceName = Device.modelName;

  // If we can't get model info, allow (benefit of doubt)
  if (!modelId) {
    return {
      isSupported: true,
      deviceName,
      modelId: null,
      isIOS: true,
    };
  }

  // Check if it's a known iPhone model
  const modelYear = IPHONE_MODELS[modelId];

  if (modelYear !== undefined) {
    // Known model - check year
    const isSupported = modelYear >= MINIMUM_IPHONE_YEAR;
    return {
      isSupported,
      deviceName,
      modelId,
      isIOS: true,
      reason: isSupported
        ? undefined
        : `O modelo ${deviceName || modelId} não é compatível. É necessário iPhone 11 ou superior para garantir a qualidade das fotos.`,
    };
  }

  // Unknown model - try to parse the numeric part
  // iPhone model IDs follow pattern: iPhoneX,Y where X indicates generation
  const match = modelId.match(/iPhone(\d+),/);
  if (match) {
    const majorVersion = parseInt(match[1], 10);
    // iPhone 11 starts at iPhone12,X (major version 12)
    const isSupported = majorVersion >= 12;
    return {
      isSupported,
      deviceName,
      modelId,
      isIOS: true,
      reason: isSupported
        ? undefined
        : `Dispositivo não compatível. É necessário iPhone 11 ou superior para garantir a qualidade das fotos.`,
    };
  }

  // Can't determine - allow (simulator, unknown device, etc)
  return {
    isSupported: true,
    deviceName,
    modelId,
    isIOS: true,
  };
}

/**
 * Verifica rapidamente se o dispositivo é iPhone 11+
 */
export function isIPhone11OrNewer(): boolean {
  if (Platform.OS !== 'ios') return false;

  const modelId = Device.modelId;
  if (!modelId) return true; // Benefit of doubt

  const match = modelId.match(/iPhone(\d+),/);
  if (match) {
    const majorVersion = parseInt(match[1], 10);
    return majorVersion >= 12; // iPhone 11 = iPhone12,X
  }

  return true; // Unknown format, allow
}
