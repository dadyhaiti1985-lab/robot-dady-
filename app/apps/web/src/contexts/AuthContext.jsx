import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import pb from '@/lib/pocketbaseClient';
import { cleanupCookies, trimAuthToken } from '@/utils/cookieCleanup';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.record ?? pb.authStore.model);
  const [credentialsExist, setCredentialsExist] = useState(null); // null = loading, true/false = known
  const [botStatus, setBotStatus] = useState('DISCONNECTED');
  const checkingRef = useRef(false); // prevent concurrent credential checks

  const checkCredentials = useCallback(async (userId) => {
    const uid = userId ?? pb.authStore.record?.id;
    if (!uid) {
      setCredentialsExist(false);
      setBotStatus('DISCONNECTED');
      return false;
    }
    // Prevent concurrent checks that could cause redirect loops
    if (checkingRef.current) return credentialsExist ?? false;
    checkingRef.current = true;
    try {
      await pb.collection('oracle_credentials').getFirstListItem(
        `owner = "${uid}"`,
        { requestKey: null }
      );
      setCredentialsExist(true);
      setBotStatus('CONNECTED');
      // Trim auth token on each check to keep localStorage lean
      trimAuthToken();
      return true;
    } catch (_) {
      // Also check if user record has apiKey stored directly (fallback)
      const user = pb.authStore.record;
      if (user?.apiKey) {
        setCredentialsExist(true);
        setBotStatus('CONNECTED');
        return true;
      }
      setCredentialsExist(false);
      setBotStatus('DISCONNECTED');
      return false;
    } finally {
      checkingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // On startup, check credentials if already logged in
    if (pb.authStore.isValid) {
      checkCredentials();
    } else {
      setCredentialsExist(false);
    }

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      if (!model) {
        setCredentialsExist(false);
        setBotStatus('DISCONNECTED');
      }
    });

    return () => { unsubscribe(); };
  }, [checkCredentials]);

  const signup = async (email, password, passwordConfirm) => {
    try {
      // Create the user in PocketBase
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        emailVisibility: true,
      }, { requestKey: null });
      
      // Automatically log them in after successful creation
      return await login(email, password);
    } catch (error) {
      console.error('[Signup] Full error:', JSON.stringify(error?.response ?? error?.message ?? error));
      
      let errorMessage = "Erè pandan kreyasyon kont (Signup failed).";
      const data = error?.response?.data ?? {};

      if (data?.email?.code === "validation_not_unique") {
        errorMessage = "Imèl sa a deja itilize (Email already exists). Tanpri konekte.";
      } else if (data?.email?.code === "validation_invalid_email") {
        errorMessage = "Fòma imèl la pa valab (Invalid email format).";
      } else if (data?.email?.message) {
        errorMessage = `Email: ${data.email.message}`;
      } else if (data?.password?.code === "validation_length_out_of_range") {
        errorMessage = "Modpas la twò kout — omwen 8 karaktè (Password must be at least 8 characters).";
      } else if (data?.password?.message) {
        errorMessage = `Password: ${data.password.message}`;
      } else if (data?.passwordConfirm?.message) {
        errorMessage = `Confirm password: ${data.passwordConfirm.message}`;
      } else if (error?.isAbort) {
        errorMessage = "Pwoblèm rezo, tanpri esye ankò (Network error, please retry).";
      } else if (error?.status === 400) {
        // Surface first field error from PocketBase
        const firstField = Object.values(data)[0];
        errorMessage = firstField?.message ?? "Valide champ yo (Validation error).";
      } else if (error?.message && error.message !== 'Failed to create record.') {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { requestKey: null });
      return authData.record;
    } catch (error) {
      // Log full details to the console for debugging (status, PB message, per-field errors).
      console.error('[AuthContext] Login failed:', {
        status: error?.status,
        message: error?.message,
        response: error?.response,
        isAbort: error?.isAbort,
      });

      let errorMessage = "Kredansyal yo pa kòrèk oswa kont lan pa egziste (Invalid email or password).";
      if (error.isAbort) {
        errorMessage = "Pwoblèm rezo, tanpri esye ankò (Network error — could not reach the server).";
      } else if (error.status === 0) {
        errorMessage = "Pa gen koneksyon ak sèvè a. Tanpri eseye ankò pita (Cannot reach the authentication server).";
      } else if (error.status === 400) {
        // PocketBase intentionally returns a generic "Failed to authenticate." for
        // wrong email/password/unverified — surface a clearer, still-generic message
        // rather than PB's raw text, since PB never reveals which part was wrong
        // (security best practice).
        errorMessage = "Imèl oswa modpas ou antre a pa kòrèk (Incorrect email or password). Verifye enfòmasyon yo oswa kreye yon kont.";
      } else if (error.status >= 500) {
        errorMessage = "Gen yon pwoblèm sèvè, tanpri eseye ankò pita (Server error, please try again later).";
      }
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = () => {
    return pb.collection('users').authWithOAuth2({ provider: 'google' });
  };

  const logout = () => {
    pb.authStore.clear();
    setCredentialsExist(false);
    setBotStatus('DISCONNECTED');
    // Clean up cookies and trim tokens on logout
    cleanupCookies();
  };

  // Call this after saving credentials to update global state immediately
  const markCredentialsSaved = () => {
    setCredentialsExist(true);
    setBotStatus('CONNECTED');
  };

  const value = {
    currentUser,
    credentialsExist,
    botStatus,
    checkCredentials,
    markCredentialsSaved,
    signup,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: pb.authStore.isValid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};