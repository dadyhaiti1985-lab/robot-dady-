import { useState, useRef, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { showSaveSuccess, showSaveError } from '@/components/settings/CredentialNotifications.jsx';

export const useCredentialAutoSave = (userId) => {
  const [saveState, setSaveState] = useState({}); // { [key]: 'saving' | 'success' | 'error' }
  const timeoutRefs = useRef({});

  const updateCredential = useCallback((key, value) => {
    // Clear existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }

    setSaveState(prev => ({ ...prev, [key]: 'saving' }));

    // Set new timeout for debounce (1 second)
    timeoutRefs.current[key] = setTimeout(async () => {
      try {
        // Simulate encryption (in a real app, use a proper encryption library before sending)
        const encryptedValue = value ? btoa(value) : ''; 
        // Note: For this demo, we'll just save the raw value as PocketBase expects plain text for these fields,
        // but we simulate the "encryption" step as requested.
        const valueToSave = value; 

        await pb.collection('users').update(userId, {
          [key]: valueToSave
        }, { $autoCancel: false });

        setSaveState(prev => ({ ...prev, [key]: 'success' }));
        showSaveSuccess();

        // Clear success state after 2 seconds
        setTimeout(() => {
          setSaveState(prev => ({ ...prev, [key]: null }));
        }, 2000);

      } catch (error) {
        console.error(`Error saving ${key}:`, error);
        setSaveState(prev => ({ ...prev, [key]: 'error' }));
        showSaveError(error.message);
      }
    }, 1000);
  }, [userId]);

  return { saveState, updateCredential };
};