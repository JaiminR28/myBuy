import { SplashScreen, Stack } from "expo-router";
import "react-native-reanimated";
import "../global.css";

import { useEffect, useState } from "react";

import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import { StatusBar } from "react-native";
import FlashMessage from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";
import ShareHandler from "../components/shareHandler";
import { createTables } from "../utils/database";
import loadFonts from "../utils/font-loader";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const router = useRouter();

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

  // Handle deep linking for shared URLs
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Received deep link:', url);
      
      // Extract URL from the deep link
      let extractedUrl = url;
      
      // Handle different deep link formats
      if (url.startsWith('mybuy://')) {
        // Custom scheme format: mybuy://share?url=https://...
        const urlParam = url.split('url=')[1];
        if (urlParam) {
          extractedUrl = decodeURIComponent(urlParam);
        }
      } else if (url.startsWith('https://') || url.startsWith('http://')) {
        // Direct URL sharing
        extractedUrl = url;
      }
      
      console.log('Extracted URL:', extractedUrl);
      setSharedUrl(extractedUrl);
      setIsShareModalVisible(true);
    };

    // Handle initial URL (app opened with a link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL changes while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleCreateNewWishlist = () => {
    setIsShareModalVisible(false);
    // Navigate to home screen where user can create a new wishlist
    router.push('/(tabs)');
  };

  const handleCloseShareModal = () => {
    setIsShareModalVisible(false);
    setSharedUrl(null);
  };

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
      
      {/* Share Handler Modal */}
      <ShareHandler
        isVisible={isShareModalVisible}
        sharedUrl={sharedUrl}
        onClose={handleCloseShareModal}
        onCreateNewWishlist={handleCreateNewWishlist}
      />
    </SafeAreaView>
  );
}
