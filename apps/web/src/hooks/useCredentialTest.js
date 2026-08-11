import { useState, useCallback } from 'react';
import { showTestSuccess, showTestError } from '@/components/settings/CredentialNotifications.jsx';

export const useCredentialTest = () => {
  const [testState, setTestState] = useState({}); // { [key]: 'testing' | 'success' | 'error' }

  const testCredential = useCallback(async (key, value) => {
    if (!value) {
      setTestState(prev => ({ ...prev, [key]: 'error' }));
      showTestError();
      return;
    }

    setTestState(prev => ({ ...prev, [key]: 'testing' }));

    try {
      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate validation logic based on key
      let isValid = false;
      if (key.includes('apiKey') || key.includes('apiSecret') || key.includes('Token')) {
        isValid = value.length > 8; // Dummy validation: length > 8
      } else if (key.includes('ChatId')) {
        isValid = !isNaN(value) && value.length > 5; // Dummy validation: numeric and length > 5
      } else {
        isValid = value.length > 0;
      }

      if (isValid) {
        setTestState(prev => ({ ...prev, [key]: 'success' }));
        showTestSuccess();
      } else {
        throw new Error('Invalid credential format');
      }
    } catch (error) {
      setTestState(prev => ({ ...prev, [key]: 'error' }));
      showTestError();
    }
  }, []);

  return { testState, testCredential };
};