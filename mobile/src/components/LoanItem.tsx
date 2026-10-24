/*
 * LoanItem.tsx — Single Loan Entry Display
 * ==========================================
 * This component displays one loan entry in the list.
 * It shows:
 * - Friend's name and amount
 * - Due date
 * - Status badge (REPAID in green, OVERDUE in red)
 * - "Mark Repaid" button (only if not repaid yet)
 * - "📷 Receipt" button to upload a receipt photo
 *
 * The background turns light red for overdue loans.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// ============ TYPE DEFINITIONS ============

// The shape of a loan object (matching what the server sends)
export type Loan = {
  id: string;
  friend_name: string;
  amount: string;         // PostgreSQL returns numbers as strings
  due_date: string;       // Date in ISO format
  is_repaid: boolean;
  receipt_url: string | null;
  created_at: string;
};

// Props this component receives from its parent
type LoanItemProps = {
  loan: Loan;
  onRepay: (loanId: string) => void;           // Called when "Mark Repaid" is pressed
  onUploadReceipt: (loanId: string) => void;   // Called when "📷 Receipt" is pressed
};

// ============ HELPER FUNCTION ============

/*
 * Check if a loan is overdue
 * A loan is overdue if:
 * 1. The due date is in the past (before today)
 * 2. AND the loan has NOT been repaid
 */
function isOverdue(dueDate: string, isRepaid: boolean): boolean {
  if (isRepaid) return false; // Repaid loans can't be overdue

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today (midnight)

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today; // True if due date is before today
}

/*
 * Format a date string to a readable format
 * Input: "2025-12-01T00:00:00.000Z"
 * Output: "01 Dec 2025"
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============ COMPONENT ============

export default function LoanItem({ loan, onRepay, onUploadReceipt }: LoanItemProps) {
  // Check if this loan is overdue
  const overdue = isOverdue(loan.due_date, loan.is_repaid);

  return (
    <View
      style={[
        styles.card,
        // Change background color based on status
        overdue ? styles.overdueCard : null,
        loan.is_repaid ? styles.repaidCard : null,
      ]}
    >
      {/* Top row: Friend name + Amount */}
      <View style={styles.topRow}>
        <Text style={[styles.friendName, loan.is_repaid && styles.dimText]}>
          {loan.friend_name}
        </Text>
        <Text style={[styles.amount, loan.is_repaid && styles.dimText]}>
          ₹{parseFloat(loan.amount).toFixed(2)}
        </Text>
      </View>

      {/* Due date */}
      <Text style={[styles.dueDate, loan.is_repaid && styles.dimText]}>
        📅 Due: {formatDate(loan.due_date)}
      </Text>

      {/* Status badge */}
      {loan.is_repaid && (
        <View style={styles.repaidBadge}>
          <Text style={styles.repaidBadgeText}>✅ REPAID</Text>
        </View>
      )}
      {overdue && (
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueBadgeText}>⚠️ OVERDUE</Text>
        </View>
      )}

      {/* Receipt indicator */}
      {loan.receipt_url && (
        <Text style={styles.receiptText}>📎 Receipt attached</Text>
      )}

      {/* Action buttons (only show if not repaid) */}
      {!loan.is_repaid && (
        <View style={styles.buttonRow}>
          {/* Mark as Repaid button */}
          <TouchableOpacity
            style={styles.repayButton}
            onPress={() => onRepay(loan.id)}
          >
            <Text style={styles.repayButtonText}>✓ Mark Repaid</Text>
          </TouchableOpacity>

          {/* Upload Receipt button */}
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={() => onUploadReceipt(loan.id)}
          >
            <Text style={styles.receiptButtonText}>📷 Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  // Main card container
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  // Red-tinted background for overdue loans
  overdueCard: {
    backgroundColor: "#FFF0F0",
    borderLeftWidth: 4,
    borderLeftColor: "#E74C3C",
  },

  // Slight green tint for repaid loans
  repaidCard: {
    backgroundColor: "#F0FFF0",
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60",
  },

  // Top row with name and amount
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  // Friend's name
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  // Loan amount
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90D9",
  },

  // Due date text
  dueDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },

  // Dimmed text for repaid loans
  dimText: {
    opacity: 0.6,
  },

  // Green badge for repaid status
  repaidBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#D4EDDA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  repaidBadgeText: {
    color: "#155724",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Red badge for overdue status
  overdueBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F8D7DA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  overdueBadgeText: {
    color: "#721C24",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Receipt attached text
  receiptText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },

  // Row containing action buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 4,
  },

  // Mark Repaid button
  repayButton: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  repayButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },

  // Upload Receipt button
  receiptButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  receiptButtonText: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 13,
  },
});

