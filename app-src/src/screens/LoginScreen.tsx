import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../api";

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: (token: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (!/^\d{10,15}$/.test(phone)) return Alert.alert("Error", "Phone 10-15 digits ka hona chahiye");
    setBusy(true);
    try {
      await api.requestOtp(phone);
      setOtpSent(true);
      Alert.alert("OTP bheja", "OTP backend ke terminal (server log) mein dekho");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) return Alert.alert("Error", "OTP 6 digit ka hota hai");
    setBusy(true);
    try {
      const { token } = await api.verifyOtp(phone, otp);
      onLoggedIn(token);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniLedger</Text>
      <Text style={styles.sub}>Dosto ko diya udhaar, ek jagah</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!otpSent}
        maxLength={15}
      />
      {otpSent && (
        <TextInput
          style={styles.input}
          placeholder="6 digit OTP"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />
      )}

      <TouchableOpacity style={styles.btn} onPress={otpSent ? verify : sendOtp} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{otpSent ? "Verify & Login" : "Send OTP"}</Text>}
      </TouchableOpacity>

      {otpSent && (
        <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(""); }}>
          <Text style={styles.link}>Number badlo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f3f4f6" },
  title: { fontSize: 32, fontWeight: "800", textAlign: "center" },
  sub: { textAlign: "center", color: "#6b7280", marginBottom: 32, marginTop: 4 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  btn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: "#2563eb", marginTop: 16 },
});
