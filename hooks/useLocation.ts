import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface AddressInfo {
  city: string | null;
  district: string | null;
  street: string | null;
  region: string | null;
}

interface UseLocationReturn {
  location: LocationState | null;
  address: AddressInfo | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

// São Paulo como localização padrão
const DEFAULT_LOCATION: LocationState = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [address, setAddress] = useState<AddressInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      setHasPermission(false);
      return false;
    }
  };

  const getAddressFromCoords = async (latitude: number, longitude: number): Promise<AddressInfo | null> => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const result = results[0];
        return {
          city: result.city || result.subregion || null,
          district: result.district || result.subregion || null,
          street: result.street || null,
          region: result.region || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const refreshLocation = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setError('Permissão de localização negada');
          setLocation(DEFAULT_LOCATION);
          setAddress({ city: 'São Paulo', district: null, street: null, region: 'SP' });
          setIsLoading(false);
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation(newLocation);

      // Get address info via reverse geocoding
      const addressInfo = await getAddressFromCoords(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setAddress(addressInfo);
    } catch (err) {
      setError('Erro ao obter localização');
      setLocation(DEFAULT_LOCATION);
      setAddress({ city: 'São Paulo', district: null, street: null, region: 'SP' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return {
    location,
    address,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    refreshLocation,
  };
}
