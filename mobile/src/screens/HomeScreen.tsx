/*
 * HomeScreen.tsx — Main Screen (Loan List + Summary)
 * =====================================================
 * This is the main screen after login. It shows:
 * 1. A SummaryCard at the top with lending statistics
 * 2. A scrollable list of all loan entries
 * 3. An "Add Loan" button to create new entries
 * 4. A "Logout" button
 *
 * Features:
 * - Pull-to-refresh to reload data
 * - Overdue loans are highlighted in red
 * - Repaid loans are shown in green
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

// Import image picker for receipt photos
import * as ImagePicker from "expo-image-picker";

// Import our components
import SummaryCard from "../components/SummaryCard";
import LoanItem, { Loan } from "../components/LoanItem";

// Import API functions
import { getLoans, getSummary, markRepaid, uploadReceipt } from "../api/api";

// Import auth context
import { useAuth } from "../context/AuthContext";

// ============ TYPE DEFINITIONS ============

// Shape of the summary data from the API
type SummaryData = {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
};

// ============ COMPONENT ============

export default function HomeScreen({ navigation }: any) {
  // ---- STATE VARIABLES ----

  // List of loan entries
  const [loans, setLoans] = useState<Loan[]>([]);

  // Summary statistics
  const [summary, setSummary] = useState<SummaryData>({
    totalLent: 0,
    totalRepaid: 0,
    overdueAmount: 0,
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Refreshing state (for pull-to-refresh)
  const [refreshing, setRefreshing] = useState(false);

  // Get token and logout function from auth context
  const { token, logout } = useAuth();

  // ---- DATA FETCHING ----

  /*
   * fetchData() — Load loans and summary from the server
   * Called when the screen loads and on pull-to-refresh
   */
  const fetchData = useCallback(async () => {
    if (!token) return; // Don't fetch if not logged in

    try {
      // Fetch loans and summary at the same time using Promise.all
      // This is faster than fetching one after the other
      const [loansData, summaryData] = await Promise.all([
        getLoans(token),
        getSummary(token),
      ]);

      // Update state with the fetched data
      setLoans(loansData.loans);
      setSummary(summaryData);
    } catch (error: any) {
      console.error("Error fetching data:", error);

      // If token is expired (401), log out
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.");
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  /*
   * useEffect — Fetch data when the screen loads
   * Also re-fetch when the screen comes back into focus
   * (e.g., after adding a new loan on AddLoanScreen)
   */
  useEffect(() => {
    fetchData();

    // Listen for when this screen comes back into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchData();
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [fetchData, navigation]);

  // ---- HANDLER FUNCTIONS ----

  /*
   * handleRepay() — Mark a loan as repaid
   */
  async function handleRepay(loanId: string) {
    const confirmRepayment = async () => {
      try {
        await markRepaid(token!, loanId);
        await fetchData();
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          "Failed to mark as repaid. Please check that the backend is running and try again.";
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Error", message);
        }
      }
    };

    // React Native's Alert buttons aren't implemented by the web renderer.
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure this loan has been repaid?")) {
        await confirmRepayment();
      }
      return;
    }

    Alert.alert(
      "Mark as Repaid?",
      "Are you sure this loan has been repaid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Repaid",
          onPress: () => void confirmRepayment(),
        },
      ]
    );
  }

  /*
   * handleUploadReceipt() — Pick an image and upload it as a receipt
   */
  async function handleUploadReceipt(loanId: string) {
    try {
      // Open the image picker (camera roll)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,          // Compress to 70% quality (save bandwidth)
        allowsEditing: true,   // Allow user to crop
      });

      // Check if the user picked an image (didn't cancel)
      if (!result.canceled && result.assets[0]) {
        // Upload the image to the server
        await uploadReceipt(token!, loanId, result.assets[0].uri);

        // Refresh the list to show the receipt indicator
        fetchData();
        Alert.alert("Success", "Receipt uploaded!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload receipt. Please try again.");
    }
  }

  /*
   * handleLogout() — Log out the user
   */
  function handleLogout() {
    // React Native Alert buttons aren't implemented by the web renderer.
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        void logout();
      }
      return;
    }

    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]
    );
  }

  /*
   * onRefresh() — Called when user pulls down to refresh
   */
  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  // ---- RENDER ----

  // Show loading spinner while fetching initial data
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>Loading your loans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loan List with Summary Card as header */}
      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        // The SummaryCard is rendered as the list header
        ListHeaderComponent={
          <SummaryCard
            totalLent={summary.totalLent}
            totalRepaid={summary.totalRepaid}
            overdueAmount={summary.overdueAmount}
          />
        }
        // Render each loan entry
        renderItem={({ item }) => (
          <LoanItem
            loan={item}
            onRepay={handleRepay}
            onUploadReceipt={handleUploadReceipt}
          />
        )}
        // Show this when the list is empty
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No loans yet!</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button below to add your first loan entry.
            </Text>
          </View>
        }
        // Pull-to-refresh
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Add some padding at the bottom for the button
        contentContainerStyle={styles.listContent}
      />

      {/* Bottom button bar */}
      <View style={styles.bottomBar}>
        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Add Loan button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddLoan")}
        >
          <Text style={styles.addButtonText}>+ Add Loan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  loadingText: {
    marginTop: 12,
    color: "#888",
    fontSize: 14,
  },

  listContent: {
    paddingBottom: 80, // Space for the bottom button bar
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },

  // Bottom button bar
  bottomBar: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Logout button
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  logoutButtonText: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: 14,
  },

  // Add Loan button
  addButton: {
    backgroundColor: "#4A90D9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

