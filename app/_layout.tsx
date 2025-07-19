import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";
import "../global.css";

import { useEffect, useState } from "react";

import { StatusBar } from "react-native";
import FlashMessage from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { createTables } from "../utils/database";
import loadFonts from "../utils/font-loader";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
        await createTables();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className=" flex-1">
      <FlashMessage position="top" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar translucent/>
    </SafeAreaView>
  );
}
