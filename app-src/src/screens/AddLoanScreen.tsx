import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../api";

export default function AddLoanScreen({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [receipt, setReceipt] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission chahiye", "Photo gallery ki permission do");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (!result.canceled) setReceipt(result.assets[0]);
  };

  const submit = async () => {
    if (!name.trim()) return Alert.alert("Error", "Friend ka naam daalo");
    const amt = Number(amount);
    if (!amt || amt <= 0) return Alert.alert("Error", "Amount 0 se zyada hona chahiye");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate)))
      return Alert.alert("Error", "Due date YYYY-MM-DD format mein daalo (jaise 2026-12-31)");

    const form = new FormData();
    form.append("friend_name", name.trim());
    form.append("amount", String(amt));
    form.append("due_date", dueDate);
    if (receipt) {
      form.append("receipt", {
        uri: receipt.uri,
        name: receipt.fileName || "receipt.jpg",
        type: receipt.mimeType || "image/jpeg",
      } as any);
    }

    setBusy(true);
    try {
      await api.addLoan(form);
      onDone();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 56 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Naya udhaar</Text>

      <Text style={styles.label}>Friend ka naam</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Rahul" />

      <Text style={styles.label}>Amount (₹)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="500" keyboardType="decimal-pad" />

      <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="2026-12-31" keyboardType="numbers-and-punctuation" />

      <TouchableOpacity style={styles.secondary} onPress={pickImage}>
        <Text style={styles.secondaryText}>{receipt ? "Photo badlo" : "Receipt photo lagao (optional)"}</Text>
      </TouchableOpacity>
      {receipt && <Image source={{ uri: receipt.uri }} style={styles.preview} />}

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={onDone} disabled={busy}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  label: { fontSize: 13, color: "#374151", marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, fontSize: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  secondary: { marginTop: 18, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#2563eb", alignItems: "center" },
  secondaryText: { color: "#2563eb", fontWeight: "600" },
  preview: { width: "100%", height: 180, borderRadius: 10, marginTop: 12 },
  btn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancel: { textAlign: "center", color: "#6b7280", marginTop: 16 },
});
