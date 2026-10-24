/*
 * AddLoanScreen.tsx — Form to Add a New Loan Entry
 * ===================================================
 * This screen has a simple form with 3 fields:
 * 1. Friend Name — who borrowed the money
 * 2. Amount — how much money was lent
 * 3. Due Date — when they should pay it back (YYYY-MM-DD format)
 *
 * All fields are validated before submitting.
 * After successful submission, the user goes back to HomeScreen.
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
  ScrollView,
} from "react-native";

// Import API function to create a loan
import { addLoan } from "../api/api";

// Import auth context to get the token
import { useAuth } from "../context/AuthContext";

// ============ COMPONENT ============

export default function AddLoanScreen({ navigation }: any) {
  // ---- STATE VARIABLES ----

  // Form field values
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Loading state (while submitting)
  const [loading, setLoading] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // Get the auth token
  const { token } = useAuth();

  // ---- VALIDATION ----

  /*
   * validateForm() — Check if all fields are filled correctly
   * Returns true if valid, false if not
   */
  function validateForm(): boolean {
    // Clear previous error
    setError("");

    // Check if friend name is provided
    if (friendName.trim() === "") {
      setError("Please enter your friend's name");
      return false;
    }

    // Check if amount is provided and is a valid number
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount (greater than 0)");
      return false;
    }

    // Check if due date is provided
    if (dueDate.trim() === "") {
      setError("Please enter a due date");
      return false;
    }

    // Check if due date matches YYYY-MM-DD format
    // This regex checks: 4 digits, dash, 2 digits, dash, 2 digits
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      setError("Due date must be in YYYY-MM-DD format (e.g., 2025-12-01)");
      return false;
    }

    // Check if the date is actually valid (e.g., not 2025-13-45)
    const dateObj = new Date(dueDate);
    if (isNaN(dateObj.getTime())) {
      setError("Please enter a valid date");
      return false;
    }

    // All checks passed!
    return true;
  }

  // ---- SUBMIT HANDLER ----

  /*
   * handleSubmit() — Submit the form and create a new loan entry
   */
  async function handleSubmit() {
    // Validate the form first
    if (!validateForm()) {
      return; // Stop if validation failed
    }

    // Show loading spinner
    setLoading(true);

    try {
      // Call the API to create the loan
      await addLoan(token!, friendName.trim(), parseFloat(amount), dueDate);

      // Show success message
      Alert.alert("Success! ✅", `Loan of ₹${amount} to ${friendName} has been recorded.`);

      // Go back to the Home screen
      navigation.goBack();
    } catch (err: any) {
      // Show error message
      const message = err.response?.data?.error || "Failed to add loan. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ---- RENDER THE UI ----

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Title */}
        <Text style={styles.title}>➕ Add New Loan</Text>
        <Text style={styles.subtitle}>
          Record money you've lent to a friend
        </Text>

        {/* Friend Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Friend's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rahul"
            placeholderTextColor="#BDBDBD"
            value={friendName}
            onChangeText={setFriendName}
            maxLength={100}
          />
        </View>

        {/* Amount Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            placeholderTextColor="#BDBDBD"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Due Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (e.g. 2025-12-01)"
            placeholderTextColor="#BDBDBD"
            value={dueDate}
            onChangeText={setDueDate}
            maxLength={10}
          />
          <Text style={styles.hint}>
            Format: Year-Month-Day (e.g., 2025-12-01)
          </Text>
        </View>

        {/* Error Message */}
        {error !== "" && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Loan Entry</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },

  hint: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 4,
  },

  errorText: {
    color: "#E74C3C",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },

  submitButton: {
    backgroundColor: "#4A90D9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },

  cancelButtonText: {
    color: "#888",
    fontSize: 14,
  },
});

