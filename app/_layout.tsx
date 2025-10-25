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
    console.log('📝 User wants to create new wishlist - closing share modal');
    setIsShareModalVisible(false);
    setSharedUrl(null);
    // Navigate to home screen where user can create a new wishlist
    console.log('🏠 Navigating to home screen');
    router.push('/(tabs)');
  };

  const handleCloseShareModal = () => {
    console.log('❌ Closing share modal');
    setIsShareModalVisible(false);
    setSharedUrl(null);
    console.log('✅ Share modal closed and URL cleared');
  };

  // Function to handle shared URLs - will be called from outside
  const handleSharedUrl = (url: string) => {
    console.log('🎯 Main Layout received shared URL:', url);
    console.log('📱 Setting shared URL state and showing modal');
    console.log('⏰ Timestamp:', new Date().toISOString());
    setSharedUrl(url);
    setIsShareModalVisible(true);
    console.log('✅ Share modal should now be visible');
  };

  // Expose the handler globally for share functionality
  useEffect(() => {
    console.log('🌐 Setting up global handleSharedUrl function');
    // @ts-ignore
    global.handleSharedUrl = handleSharedUrl;
    console.log('✅ Global handler registered successfully');
    return () => {
      console.log('🧹 Cleaning up global handleSharedUrl function');
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