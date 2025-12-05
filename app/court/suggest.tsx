import { useEffect } from 'react';
import { router } from 'expo-router';

// Redirect to new add court flow
export default function SuggestCourtRedirect() {
  useEffect(() => {
    router.replace('/court/add');
  }, []);

  return null;
}
