
import { SplashScreen, Stack } from 'expo-router';
import 'react-native-reanimated';
import "../global.css";


import { useEffect, useState } from 'react';

import FlashMessage from "react-native-flash-message";
import { createTables } from '../utils/database';
import loadFonts from '../utils/font-loader';

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

    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <>
    <FlashMessage position="top" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      </>
    // </ThemeProvider>
  );
}
