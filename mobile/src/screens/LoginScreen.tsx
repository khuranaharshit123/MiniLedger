/*
 * LoginScreen.tsx — Phone + OTP Login Screen
 * =============================================
 * This is the first screen the user sees.
 * Login works in 2 steps:
 *
 * Step 1: Enter phone number → sends OTP to server
 * Step 2: Enter the OTP code → verifies and gets a login token
 *
 * The OTP is printed in the server console (mock SMS).
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// Import our API functions
import { sendOtp, verifyOtp } from "../api/api";

// Import auth context to save the login token
import { useAuth } from "../context/AuthContext";

// ============ COMPONENT ============

export default function LoginScreen() {
  // ---- STATE VARIABLES ----

  // Which step we're on: "phone" (enter phone) or "otp" (enter OTP code)
  const [step, setStep] = useState<"phone" | "otp">("phone");

  // The phone number entered by the user
  const [phone, setPhone] = useState("");

  // The OTP code entered by the user
  const [otp, setOtp] = useState("");

  // Whether we're waiting for a response from the server
  const [loading, setLoading] = useState(false);

  // Error message to show to the user
  const [error, setError] = useState("");

  // Get the login function from our auth context
  const { login } = useAuth();

  // ---- HANDLER FUNCTIONS ----

  /*
   * handleSendOtp() — Called when user submits their phone number
   * Sends the phone number to the server, which generates an OTP
   */
  async function handleSendOtp() {
    // Clear any previous error
    setError("");

    // Basic validation: phone should be at least 10 digits
    if (phone.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    // Show loading spinner
    setLoading(true);

    try {
      // Call the API to send OTP
      await sendOtp(phone);

      // Move to step 2 (enter OTP)
      setStep("otp");

      // Show a reminder to check the server console
      Alert.alert("OTP Sent", "Check the server console for your OTP code");
    } catch (err: any) {
      // Show error message
      const message = err.response?.data?.error || "Failed to send OTP. Is the server running?";
      setError(message);
    } finally {
      // Hide loading spinner
      setLoading(false);
    }
  }

  /*
   * handleVerifyOtp() — Called when user submits the OTP code
   * Verifies the OTP and logs in if correct
   */
  async function handleVerifyOtp() {
    // Clear any previous error
    setError("");

    // Basic validation: OTP should be 6 digits
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    // Show loading spinner
    setLoading(true);

    try {
      // Call the API to verify the OTP
      const data = await verifyOtp(phone, otp);

      // OTP is correct! Save the token and log in
      await login(data.token, phone);

      // The app will automatically navigate to HomeScreen
      // because App.tsx checks if token exists
    } catch (err: any) {
      // Show error message
      const message = err.response?.data?.error || "Failed to verify OTP. Please try again.";
      setError(message);
    } finally {
      // Hide loading spinner
      setLoading(false);
    }
  }

  // ---- RENDER THE UI ----

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* App Logo/Title */}
      <Text style={styles.logo}>💰</Text>
      <Text style={styles.title}>MiniLedger</Text>
      <Text style={styles.subtitle}>Track money lent to friends</Text>

      {/* Step 1: Phone Number Input */}
      {step === "phone" && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter your phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            placeholderTextColor="#BDBDBD"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={15}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: OTP Input */}
      {step === "otp" && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter the 6-digit OTP</Text>
          <Text style={styles.phoneDisplay}>Sent to: {phone}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#BDBDBD"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {/* Go back to phone step */}
          <TouchableOpacity onPress={() => { setStep("phone"); setOtp(""); setError(""); }}>
            <Text style={styles.backLink}>← Change phone number</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message */}
      {error !== "" && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </KeyboardAvoidingView>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  logo: {
    fontSize: 60,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 40,
  },

  formContainer: {
    width: "100%",
    maxWidth: 320,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },

  phoneDisplay: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 2,
  },

  button: {
    backgroundColor: "#4A90D9",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  backLink: {
    color: "#4A90D9",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },

  errorText: {
    color: "#E74C3C",
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },
});

