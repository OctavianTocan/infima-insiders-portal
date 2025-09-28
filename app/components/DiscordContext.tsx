// --- DISCORD CONTEXT --- //
/**
 * Discord Context Provider for managing Discord authentication state
 *
 * This context provides centralized state management for Discord OAuth flow,
 * user verification, and support request handling. It follows the reducer pattern
 * for predictable state updates and includes typed actions for type safety.
 *
 * @module DiscordContext
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { DiscordUserId, DiscordRoleId } from "../types/branded";
import type { ContextValue, ContextProviderProps } from "../types/react";

// --- STATE TYPES --- //

/**
 * Discord user information from OAuth response
 *
 * @interface DiscordUser
 * @property id - Unique Discord user identifier (snowflake)
 * @property username - Discord username (not display name)
 * @property roles - Optional array of roles user has in the target guild
 */
interface DiscordUser {
  /** Unique Discord user ID (snowflake format) */
  id: DiscordUserId;
  /** Discord username (e.g., "johndoe123") */
  username: string;
  /** User's roles in the target Discord guild */
  roles?: Array<{
    /** Role ID (snowflake format) */
    id: DiscordRoleId;
    /** Human-readable role name */
    name: string;
  }>;
}

/**
 * Verification status for Discord OAuth flow
 * WHY: Explicit states prevent undefined behavior during transitions
 */
type VerificationStatus = "idle" | "verifying" | "success" | "error";

/**
 * Support request status for fallback flow
 * WHY: Tracks the support request lifecycle for UX feedback
 */
type SupportRequestStatus = "idle" | "submitting" | "submitted" | "error";

/**
 * Complete Discord authentication state
 *
 * @interface DiscordState
 */
interface DiscordState {
  /** Current authenticated Discord user */
  user: DiscordUser | null;
  /** Whether any async operation is in progress */
  isLoading: boolean;
  /** Current error message (null when no error) */
  error: string | null;
  /** Discord OAuth verification status */
  verificationStatus: VerificationStatus;
  /** Support request submission status */
  supportRequestStatus: SupportRequestStatus;
}

// --- ACTION TYPES --- //

/**
 * Discord state actions using discriminated unions
 * WHY: Discriminated unions provide compile-time safety and better IntelliSense
 */
type DiscordAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: DiscordUser }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_VERIFICATION_STATUS"; payload: VerificationStatus }
  | { type: "SET_SUPPORT_REQUEST_STATUS"; payload: SupportRequestStatus }
  | { type: "RESET_STATE" };

// --- INITIAL STATE --- //

/**
 * Initial Discord context state
 * WHY: Centralized initial state prevents inconsistencies
 */
const initialState: DiscordState = {
  user: null,
  isLoading: false,
  error: null,
  verificationStatus: "idle",
  supportRequestStatus: "idle",
};

// --- REDUCER --- //

/**
 * Discord state reducer with immutable updates
 *
 * Handles all Discord-related state transitions in a predictable way.
 * Each action returns a new state object to prevent mutation bugs.
 *
 * @param state - Current Discord state
 * @param action - Action to apply
 * @returns New Discord state
 */
function discordReducer(
  state: DiscordState,
  action: DiscordAction
): DiscordState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_USER":
      // WHY: Clear error when user is successfully set
      return { ...state, user: action.payload, error: null };

    case "SET_ERROR":
      // WHY: Set loading to false when error occurs to unlock UI
      return { ...state, error: action.payload, isLoading: false };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "SET_VERIFICATION_STATUS":
      return { ...state, verificationStatus: action.payload };

    case "SET_SUPPORT_REQUEST_STATUS":
      return { ...state, supportRequestStatus: action.payload };

    case "RESET_STATE":
      // WHY: Return initial state to ensure clean reset
      return initialState;

    default:
      // WHY: Exhaustive check ensures all actions are handled
      return state;
  }
}

// --- CONTEXT ACTIONS --- //

/**
 * Discord context actions interface
 * Provides type-safe methods for updating Discord state
 */
interface DiscordContextActions {
  /** Set global loading state */
  setLoading: (isLoading: boolean) => void;
  /** Set authenticated Discord user */
  setUser: (user: DiscordUser) => void;
  /** Set error message */
  setError: (error: string) => void;
  /** Clear current error */
  clearError: () => void;
  /** Update verification status */
  setVerificationStatus: (status: VerificationStatus) => void;
  /** Update support request status */
  setSupportRequestStatus: (status: SupportRequestStatus) => void;
  /** Reset all state to initial values */
  resetState: () => void;
  /** Start verification flow (composite action) */
  startVerification: () => void;
  /** Start support request flow (composite action) */
  startSupportRequest: () => void;
}

/**
 * Discord context value combining state and actions
 */
type DiscordContextType = ContextValue<DiscordState, DiscordContextActions>;

// --- CONTEXT CREATION --- //

/**
 * Discord context with undefined default
 * WHY: Forces consumers to check if context is available
 */
const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

// --- PROVIDER COMPONENT --- //

/**
 * Discord context provider props
 */
interface DiscordProviderProps extends ContextProviderProps {}

/**
 * Discord context provider component
 *
 * Manages Discord authentication state using useReducer for predictable updates.
 * Provides both state and actions to child components through React context.
 *
 * @param props - Provider props including children
 * @returns Provider component wrapping children
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DiscordProvider>
 *       <SignupFlow />
 *     </DiscordProvider>
 *   );
 * }
 * ```
 */
export const DiscordProvider: React.FC<DiscordProviderProps> = ({
  children,
  className = "",
  "data-testid": testId = "discord-provider",
}) => {
  const [state, dispatch] = useReducer(discordReducer, initialState);

  // WHY: useCallback prevents unnecessary re-renders of child components
  const actions: DiscordContextActions = {
    setLoading: useCallback(
      (isLoading: boolean) =>
        dispatch({ type: "SET_LOADING", payload: isLoading }),
      []
    ),

    setUser: useCallback(
      (user: DiscordUser) => dispatch({ type: "SET_USER", payload: user }),
      []
    ),

    setError: useCallback(
      (error: string) => dispatch({ type: "SET_ERROR", payload: error }),
      []
    ),

    clearError: useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []),

    setVerificationStatus: useCallback(
      (status: VerificationStatus) =>
        dispatch({ type: "SET_VERIFICATION_STATUS", payload: status }),
      []
    ),

    setSupportRequestStatus: useCallback(
      (status: SupportRequestStatus) =>
        dispatch({ type: "SET_SUPPORT_REQUEST_STATUS", payload: status }),
      []
    ),

    resetState: useCallback(() => dispatch({ type: "RESET_STATE" }), []),

    // WHY: Composite actions group related state changes for consistency
    startVerification: useCallback(() => {
      dispatch({ type: "SET_VERIFICATION_STATUS", payload: "verifying" });
      dispatch({ type: "SET_LOADING", payload: true });
    }, []),

    startSupportRequest: useCallback(() => {
      dispatch({ type: "SET_SUPPORT_REQUEST_STATUS", payload: "submitting" });
      dispatch({ type: "SET_LOADING", payload: true });
    }, []),
  };

  const contextValue: DiscordContextType = { state, actions };

  return (
    <DiscordContext.Provider value={contextValue}>
      <div className={className} data-testid={testId}>
        {children}
      </div>
    </DiscordContext.Provider>
  );
};

// --- CONTEXT HOOK --- //

/**
 * Custom hook for consuming Discord context
 *
 * Provides type-safe access to Discord state and actions.
 * Throws error if used outside of DiscordProvider to fail fast.
 *
 * @returns Discord context value with state and actions
 * @throws Error if used outside DiscordProvider
 *
 * @example
 * ```tsx
 * function DiscordUserProfile() {
 *   const { state, actions } = useDiscord();
 *
 *   if (state.user) {
 *     return <div>Hello, {state.user.username}!</div>;
 *   }
 *
 *   return <button onClick={actions.startVerification}>Login</button>;
 * }
 * ```
 */
export const useDiscord = (): DiscordContextType => {
  const context = useContext(DiscordContext);

  if (!context) {
    throw new Error(
      "useDiscord must be used within a DiscordProvider. " +
        "Ensure your component is wrapped with <DiscordProvider>."
    );
  }

  return context;
};

// --- EXPORTS --- //

/**
 * Export types for use in other components
 * WHY: Allows other components to type Discord-related props properly
 */
export type {
  DiscordUser,
  DiscordState,
  VerificationStatus,
  SupportRequestStatus,
};
