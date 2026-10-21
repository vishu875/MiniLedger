import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Summary } from "../types";
import { rupees } from "../format";

export default function SummaryCard({ summary }: { summary: Summary | null }) {
  const s = summary ?? { total_lent: 0, total_repaid: 0, overdue_amount: 0 };
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Summary</Text>
      <View style={styles.row}>
        <Item label="Total lent" value={rupees(s.total_lent)} color="#1d4ed8" />
        <Item label="Repaid" value={rupees(s.total_repaid)} color="#15803d" />
        <Item label="Overdue" value={rupees(s.overdue_amount)} color="#b91c1c" />
      </View>
    </View>
  );
}

function Item({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  item: { flex: 1 },
  label: { fontSize: 12, color: "#6b7280" },
  value: { fontSize: 18, fontWeight: "700", marginTop: 4 },
});
