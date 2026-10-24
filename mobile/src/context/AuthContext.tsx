/*
 * AuthContext.tsx — Authentication State Management
 * ===================================================
 * This file creates a React "Context" to share login state across the app.
 *
 * What is React Context?
 * - It's a way to share data between components without passing props manually.
 * - Think of it like a "global variable" that any component can read.
 *
 * What this context stores:
 * - token: the JWT login token (null = not logged in)
 * - phone: the logged-in user's phone number
 * - login(): function to save token after successful OTP verification
 * - logout(): function to clear token and log out
 * - isLoading: whether we're still checking for a saved token
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============ TYPE DEFINITIONS ============

// Define the shape of our context (what data and functions it provides)
type AuthContextType = {
  token: string | null;     // JWT token (null if not logged in)
  phone: string | null;     // User's phone number
  isLoading: boolean;       // Are we checking for saved token?
  login: (token: string, phone: string) => Promise<void>;  // Log in
  logout: () => Promise<void>;                               // Log out
};

// ============ CREATE THE CONTEXT ============

// Create the context with default values
// These defaults are used if a component tries to use the context
// without being wrapped in a Provider (shouldn't happen in our app)
const AuthContext = createContext<AuthContextType>({
  token: null,
  phone: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

// ============ PROVIDER COMPONENT ============

/*
 * AuthProvider — Wraps the app and provides auth state to all children
 * Usage: <AuthProvider> <YourApp /> </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to store the login token
  const [token, setToken] = useState<string | null>(null);

  // State to store the phone number
  const [phone, setPhone] = useState<string | null>(null);

  // State to track if we're loading the saved token
  const [isLoading, setIsLoading] = useState(true);

  /*
   * useEffect runs when the component first loads.
   * We check if there's a saved token in AsyncStorage (like localStorage for mobile).
   * If there is, the user is automatically logged in.
   */
  useEffect(() => {
    async function loadToken() {
      try {
        // Try to get the saved token and phone from storage
        const savedToken = await AsyncStorage.getItem("token");
        const savedPhone = await AsyncStorage.getItem("phone");

        // If we found a saved token, set it in state
        if (savedToken) {
          setToken(savedToken);
          setPhone(savedPhone);
        }
      } catch (error) {
        console.error("Error loading saved token:", error);
      } finally {
        // Done loading, whether we found a token or not
        setIsLoading(false);
      }
    }

    loadToken();
  }, []); // Empty array means this runs only once when the app starts

  /*
   * login() — Save the token after successful OTP verification
   * Called from the LoginScreen when the user logs in
   */
  async function login(newToken: string, newPhone: string) {
    try {
      // Save token and phone to AsyncStorage (persists even after app closes)
      await AsyncStorage.setItem("token", newToken);
      await AsyncStorage.setItem("phone", newPhone);

      // Update the state so the app knows we're logged in
      setToken(newToken);
      setPhone(newPhone);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  /*
   * logout() — Clear the token and log out
   * Called when the user presses the Logout button
   */
  async function logout() {
    try {
      // Remove token and phone from storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("phone");

      // Clear the state
      setToken(null);
      setPhone(null);
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  }

  // Provide the auth state and functions to all child components
  return (
    <AuthContext.Provider value={{ token, phone, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ CUSTOM HOOK ============

/*
 * useAuth() — A shortcut to access the auth context
 * Instead of writing useContext(AuthContext) everywhere,
 * components can just write useAuth()
 */
export function useAuth() {
  return useContext(AuthContext);
}

