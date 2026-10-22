/*
 * App.tsx — Root Component of the Mobile App
 * =============================================
 * This is the entry point of the React Native app.
 * It does the following:
 *
 * 1. Wraps the entire app in AuthProvider (for login state)
 * 2. Sets up navigation (which screens the user can go to)
 * 3. Shows LoginScreen if the user is NOT logged in
 * 4. Shows Home + AddLoan screens if the user IS logged in
 *
 * Navigation works like a "stack" of screens:
 * - The top screen is what the user sees
 * - Going to a new screen "pushes" it on top
 * - Going back "pops" the top screen off
 */

import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import our screens
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddLoanScreen from "./src/screens/AddLoanScreen";

// Import our auth context
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Create a Stack Navigator
// This manages the stack of screens and handles transitions
const Stack = createNativeStackNavigator();

// ============ APP NAVIGATOR ============

/*
 * AppNavigator — Decides which screens to show based on login state
 * If logged in → show Home and AddLoan screens
 * If not logged in → show Login screen
 */
function AppNavigator() {
  // Get the auth state from our context
  const { token, isLoading } = useAuth();

  // Show a loading spinner while checking for saved token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token === null ? (
          // ---- NOT LOGGED IN: Show Login Screen ----
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }} // Hide the top bar on login
          />
        ) : (
          // ---- LOGGED IN: Show Home and AddLoan Screens ----
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "💰 MiniLedger",        // Title in the top bar
                headerStyle: { backgroundColor: "#4A90D9" },
                headerTintColor: "#FFFFFF",    // White text color
                headerTitleStyle: { fontWeight: "bold" },
              }}
            />
            <Stack.Screen
              name="AddLoan"
              component={AddLoanScreen}
              options={{
                title: "Add New Loan",
                headerStyle: { backgroundColor: "#4A90D9" },
                headerTintColor: "#FFFFFF",
                headerTitleStyle: { fontWeight: "bold" },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============ MAIN APP COMPONENT ============

/*
 * App — The root component
 * Wraps everything in AuthProvider so all screens can access login state
 */
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
});
