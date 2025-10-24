import { SplashScreen, Stack, useRouter } from "expo-router";
import "react-native-reanimated";
import "../global.css";

import { useEffect, useState } from "react";

import { StatusBar } from "react-native";
import FlashMessage from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";
import ShareHandler from "../components/shareHandler";
import { createTables } from "../utils/database";
import DeepLinkHandler from "../utils/deepLinkHandler";
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

  // Initialize deep link handler
  useEffect(() => {
    const cleanup = DeepLinkHandler.getInstance().initialize();
    return cleanup;
  }, []);

  const handleCreateNewWishlist = () => {
    setIsShareModalVisible(false);
    setSharedUrl(null);
    // Navigate to home screen where user can create a new wishlist
    router.push('/(tabs)');
  };

  const handleCloseShareModal = () => {
    setIsShareModalVisible(false);
    setSharedUrl(null);
  };

  // Function to handle shared URLs - will be called from outside
  const handleSharedUrl = (url: string) => {
    console.log('Received shared URL:', url);
    setSharedUrl(url);
    setIsShareModalVisible(true);
  };

  // Expose the handler globally for share functionality
  useEffect(() => {
    // @ts-ignore
    global.handleSharedUrl = handleSharedUrl;
    return () => {
      // @ts-ignore
      delete global.handleSharedUrl;
    };
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