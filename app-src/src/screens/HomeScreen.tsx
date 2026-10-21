import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api";
import { Loan, Summary } from "../types";
import SummaryCard from "../components/SummaryCard";
import LoanItem from "../components/LoanItem";

interface Props {
  onAdd: () => void;
  onLogout: () => void;
}

export default function HomeScreen({ onAdd, onLogout }: Props) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([api.getLoans(), api.getSummary()]);
      setLoans(l);
      setSummary(s);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const repay = (loan: Loan) => {
    Alert.alert("Repaid?", `${loan.friend_name} ne paise wapas kar diye?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Haan",
        onPress: async () => {
          try {
            await api.repay(loan.id);
            load(); // list aur summary dono refresh
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MiniLedger</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListHeaderComponent={<SummaryCard summary={summary} />}
          ListEmptyComponent={<Text style={styles.empty}>Abhi koi entry nahi. "+ Add" dabao.</Text>}
          renderItem={({ item }) => <LoanItem loan={item} onRepay={repay} />}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Text style={styles.fabText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 52, paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "800" },
  logout: { color: "#dc2626", fontWeight: "600" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 24 },
  fab: { position: "absolute", right: 20, bottom: 28, backgroundColor: "#2563eb", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 30, elevation: 4 },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
