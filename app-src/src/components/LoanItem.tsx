import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Loan } from "../types";
import { rupees } from "../format";
import { API_URL } from "../config";

interface Props {
  loan: Loan;
  onRepay: (loan: Loan) => void;
}

export default function LoanItem({ loan, onRepay }: Props) {
  const status = loan.is_repaid ? "Repaid" : loan.is_overdue ? "Overdue" : "Pending";
  return (
    <View style={[styles.card, loan.is_overdue && styles.overdue, loan.is_repaid && styles.repaid]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{loan.friend_name}</Text>
        <Text style={styles.meta}>Due: {loan.due_date}</Text>
        <Text style={[styles.status, loan.is_overdue && { color: "#b91c1c" }]}>{status}</Text>
      </View>
      {loan.receipt_url ? (
        <Image source={{ uri: `${API_URL}${loan.receipt_url}` }} style={styles.thumb} />
      ) : null}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.amount}>{rupees(loan.amount)}</Text>
        {!loan.is_repaid && (
          <TouchableOpacity style={styles.btn} onPress={() => onRepay(loan)}>
            <Text style={styles.btnText}>Mark repaid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#d1d5db",
  },
  overdue: { backgroundColor: "#fee2e2", borderLeftColor: "#dc2626" },
  repaid: { opacity: 0.6, borderLeftColor: "#16a34a" },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  status: { fontSize: 12, marginTop: 4, fontWeight: "600", color: "#374151" },
  amount: { fontSize: 18, fontWeight: "700" },
  thumb: { width: 40, height: 40, borderRadius: 6, marginHorizontal: 10 },
  btn: { marginTop: 8, backgroundColor: "#16a34a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
