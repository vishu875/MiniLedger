import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, setUnauthorizedHandler } from "./src/api";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddLoanScreen from "./src/screens/AddLoanScreen";

type Screen = "home" | "add";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setLoggedIn(false);
    setScreen("home");
  };

  // App khulte hi dekho pehle se login hai ya nahi
  useEffect(() => {
    setUnauthorizedHandler(logout);
    (async () => {
      const saved = await AsyncStorage.getItem("token");
      if (saved) {
        setToken(saved);
        setLoggedIn(true);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    setToken(token);
    setLoggedIn(true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {!loggedIn ? (
        <LoginScreen onLoggedIn={handleLogin} />
      ) : screen === "add" ? (
        <AddLoanScreen onDone={() => setScreen("home")} />
      ) : (
        <HomeScreen onAdd={() => setScreen("add")} onLogout={logout} />
      )}
    </View>
  );
}
