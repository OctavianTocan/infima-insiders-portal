import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// Types
interface DiscordUser {
  id: string;
  username: string;
  roles?: { id: string; name: string }[];
}

interface DiscordState {
  user: DiscordUser | null;
  isLoading: boolean;
  error: string | null;
  verificationStatus: 'idle' | 'verifying' | 'success' | 'error';
  supportRequestStatus: 'idle' | 'submitting' | 'submitted' | 'error';
}

type DiscordAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: DiscordUser }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_VERIFICATION_STATUS'; payload: DiscordState['verificationStatus'] }
  | { type: 'SET_SUPPORT_REQUEST_STATUS'; payload: DiscordState['supportRequestStatus'] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: DiscordState = {
  user: null,
  isLoading: false,
  error: null,
  verificationStatus: 'idle',
  supportRequestStatus: 'idle',
};

// Reducer
function discordReducer(state: DiscordState, action: DiscordAction): DiscordState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_VERIFICATION_STATUS':
      return { ...state, verificationStatus: action.payload };
    case 'SET_SUPPORT_REQUEST_STATUS':
      return { ...state, supportRequestStatus: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface DiscordContextType {
  state: DiscordState;
  actions: {
    setLoading: (isLoading: boolean) => void;
    setUser: (user: DiscordUser) => void;
    setError: (error: string) => void;
    clearError: () => void;
    setVerificationStatus: (status: DiscordState['verificationStatus']) => void;
    setSupportRequestStatus: (status: DiscordState['supportRequestStatus']) => void;
    resetState: () => void;
    startVerification: () => void;
    startSupportRequest: () => void;
  };
}

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

// Provider
interface DiscordProviderProps {
  children: ReactNode;
}

export const DiscordProvider: React.FC<DiscordProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(discordReducer, initialState);

  const actions = {
    setLoading: (isLoading: boolean) => dispatch({ type: 'SET_LOADING', payload: isLoading }),
    setUser: (user: DiscordUser) => dispatch({ type: 'SET_USER', payload: user }),
    setError: (error: string) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    setVerificationStatus: (status: DiscordState['verificationStatus']) => 
      dispatch({ type: 'SET_VERIFICATION_STATUS', payload: status }),
    setSupportRequestStatus: (status: DiscordState['supportRequestStatus']) => 
      dispatch({ type: 'SET_SUPPORT_REQUEST_STATUS', payload: status }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
    startVerification: () => {
      dispatch({ type: 'SET_VERIFICATION_STATUS', payload: 'verifying' });
      dispatch({ type: 'SET_LOADING', payload: true });
    },
    startSupportRequest: () => {
      dispatch({ type: 'SET_SUPPORT_REQUEST_STATUS', payload: 'submitting' });
      dispatch({ type: 'SET_LOADING', payload: true });
    },
  };

  return (
    <DiscordContext.Provider value={{ state, actions }}>
      {children}
    </DiscordContext.Provider>
  );
};

// Hook
export const useDiscord = (): DiscordContextType => {
  const context = useContext(DiscordContext);
  if (!context) {
    throw new Error('useDiscord must be used within a DiscordProvider');
  }
  return context;
};

// Export types for use in other components
export type { DiscordUser, DiscordState };