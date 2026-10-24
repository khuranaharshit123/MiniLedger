/*
 * SummaryCard.tsx — Summary Statistics Card
 * ============================================
 * This component shows a card at the top of the home screen
 * with three lending statistics:
 * 1. Total Lent — total money given to friends
 * 2. Total Repaid — how much has been paid back
 * 3. Overdue — money that's past the due date and not paid back
 *
 * The overdue amount is shown in RED if it's greater than 0.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

// ============ PROPS TYPE ============

// Define what data this component needs from its parent
type SummaryCardProps = {
  totalLent: number;      // Total amount lent
  totalRepaid: number;    // Total amount repaid
  overdueAmount: number;  // Total overdue amount
};

// ============ COMPONENT ============

export default function SummaryCard({ totalLent, totalRepaid, overdueAmount }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      {/* Card Title */}
      <Text style={styles.title}>📊 Lending Summary</Text>

      {/* Three stats displayed in a row */}
      <View style={styles.statsRow}>
        {/* Total Lent */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Lent</Text>
          <Text style={styles.statValue}>₹{totalLent.toFixed(2)}</Text>
        </View>

        {/* Total Repaid */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Repaid</Text>
          <Text style={[styles.statValue, styles.repaidText]}>₹{totalRepaid.toFixed(2)}</Text>
        </View>

        {/* Overdue Amount — shown in RED if > 0 */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Overdue</Text>
          <Text
            style={[
              styles.statValue,
              overdueAmount > 0 ? styles.overdueText : styles.safeText,
            ]}
          >
            ₹{overdueAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  // The main card container
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },

  // Card title text
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },

  // Row containing the three stat items
  statsRow: {
    flexDirection: "row",       // Place items side by side
    justifyContent: "space-around", // Spread them evenly
  },

  // Individual stat item container
  statItem: {
    alignItems: "center", // Center text horizontally
  },

  // Label text (e.g., "Total Lent")
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  // Value text (e.g., "₹5000.00")
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Green color for repaid amount
  repaidText: {
    color: "#27AE60",
  },

  // Red color for overdue amount (when > 0)
  overdueText: {
    color: "#E74C3C",
  },

  // Normal color when there's no overdue
  safeText: {
    color: "#27AE60",
  },
});

