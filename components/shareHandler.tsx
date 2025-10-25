import WishlistSelectionModal, { WishlistSelectionModalRef } from "@/components/wishlistSelectionModal";
import { scrapeScript } from "@/constants/constants";
import { ProductData, Wishlist } from "@/constants/types/types";
import { db } from "@/lib/db";
import { addProductToMultipleWishlists } from "@/utils/database";
import { isProductUrl, normalizeUrl } from "@/utils/linkDetector";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View
} from "react-native";
import { showMessage } from "react-native-flash-message";
import Modal from "react-native-modal";
import WebView from "react-native-webview";

interface ShareHandlerProps {
  isVisible: boolean;
  sharedUrl: string | null;
  onClose: () => void;
  onCreateNewWishlist: () => void;
}

const ShareHandler: React.FC<ShareHandlerProps> = ({
  isVisible,
  sharedUrl,
  onClose,
  onCreateNewWishlist,
}) => {
  const [isScraping, setIsScraping] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [scrapeError, setScrapeError] = useState(false);
  
  const wishlistModalRef = useRef<WishlistSelectionModalRef>(null);

  // Load wishlists when component mounts or becomes visible
  React.useEffect(() => {
    if (isVisible) {
      loadWishlists();
    }
  }, [isVisible]);

  // Handle URL when it changes
  React.useEffect(() => {
    if (isVisible && sharedUrl) {
      handleSharedUrl(sharedUrl);
    }
  }, [isVisible, sharedUrl]);

  const loadWishlists = async () => {
    try {
      const wishlistsData = await db.getAllAsync<Wishlist>(
        "SELECT * FROM wishlists ORDER BY createdAt DESC"
      );
      setWishlists(wishlistsData);
    } catch (error) {
      console.error("Failed to load wishlists:", error);
      showMessage({
        type: "danger",
        message: "Failed to load wishlists",
        description: "Please try again later",
      });
    }
  };

  const handleSharedUrl = async (url: string) => {
    console.log('🎯 ShareHandler received URL:', url);
    console.log('📊 URL validation starting...');
    
    // Reset state
    setProductData(null);
    setScrapeError(false);
    
    // Validate URL
    const isValidProductUrl = isProductUrl(url);
    console.log('✅ URL validation result:', isValidProductUrl);
    
    if (!isValidProductUrl) {
      console.log('❌ URL validation failed - showing unsupported URL alert');
      Alert.alert(
        "Unsupported URL",
        "This doesn't appear to be a product link from a supported e-commerce site. Please try sharing a product link from Amazon, Flipkart, Myntra, Ajio, Nykaa, Meesho, or Snapdeal.",
        [{ text: "OK", onPress: onClose }]
      );
      return;
    }

    // Normalize URL
    const normalizedUrl = normalizeUrl(url);
    console.log('🔧 Normalized URL:', normalizedUrl);
    console.log('🔄 Starting product scraping process...');
    
    // Start scraping
    setIsScraping(true);
    setScrapeError(false);
  };

  const handleWebViewMessage = (event: any) => {
    console.log('📨 WebView message received');
    console.log('📄 Raw message data:', event.nativeEvent.data);
    
    try {
      const result = JSON.parse(event.nativeEvent.data);
      console.log("🛍️ Scraped product data:", result);
      console.log("📊 Scraping result summary:", {
        hasTitle: !!result?.title,
        hasPrice: !!result?.price,
        hasDescription: !!result?.description,
        hasImage: !!result?.image,
        titleLength: result?.title?.length || 0,
        priceLength: result?.price?.length || 0
      });

      if (result?.title) {
        console.log('✅ Product scraping successful!');
        // Successfully scraped product details
        const scrapedData: ProductData = {
          title: result.title,
          price: result.price,
          description: result.description,
          imageUrl: result.image,
        };
        
        console.log('📦 Processed product data:', scrapedData);
        setProductData(scrapedData);
        setIsScraping(false);
        
        // Show wishlist selection modal
        console.log('📋 Available wishlists count:', wishlists.length);
        if (wishlists.length > 0) {
          console.log('🎯 Showing wishlist selection modal');
          wishlistModalRef.current?.showModal(scrapedData, sharedUrl || "");
        } else {
          console.log('⚠️ No wishlists available - showing create wishlist alert');
          Alert.alert(
            "No Wishlists",
            "You don't have any wishlists yet. Would you like to create one?",
            [
              { text: "Cancel", onPress: onClose },
              { text: "Create Wishlist", onPress: onCreateNewWishlist },
            ]
          );
        }
      } else {
        console.log('❌ Product scraping failed - no title found');
        // Failed to scrape
        setScrapeError(true);
        setIsScraping(false);
        
        Alert.alert(
          "Scraping Failed",
          "Could not extract product details from this URL. The product might not be available or the page structure has changed.",
          [{ text: "OK", onPress: onClose }]
        );
      }
    } catch (error) {
      console.error("💥 Error parsing scraped data:", error);
      console.error("📄 Raw data that caused error:", event.nativeEvent.data);
      setScrapeError(true);
      setIsScraping(false);
      
      Alert.alert(
        "Error",
        "Failed to process product information. Please try again.",
        [{ text: "OK", onPress: onClose }]
      );
    }
  };

  const handleWebViewError = () => {
    console.log('🌐 WebView error occurred');
    console.log('❌ Failed to load URL:', sharedUrl);
    setScrapeError(true);
    setIsScraping(false);
    
    Alert.alert(
      "Network Error",
      "Could not load the product page. Please check your internet connection and try again.",
      [{ text: "OK", onPress: onClose }]
    );
  };

  const handleWishlistConfirm = async (
    selectedWishlistIds: number[],
    productData: ProductData,
    url: string
  ) => {
    console.log('💾 Adding product to wishlists...');
    console.log('📋 Selected wishlist IDs:', selectedWishlistIds);
    console.log('🛍️ Product data:', productData);
    console.log('🔗 Product URL:', url);
    
    try {
      const result = await addProductToMultipleWishlists(
        selectedWishlistIds,
        url,
        productData
      );
      
      console.log('✅ Add to wishlist result:', result);
      
      if (result.successCount > 0) {
        console.log(`🎉 Successfully added to ${result.successCount} wishlist(s)`);
        showMessage({
          type: "success",
          message: "Product Added Successfully!",
          description: `Added to ${result.successCount} wishlist${result.successCount !== 1 ? 's' : ''}`,
        });
        onClose();
      } else {
        console.log('❌ No products were added');
        throw new Error("No products were added");
      }
    } catch (error) {
      console.error("💥 Failed to add product to wishlists:", error);
      Alert.alert(
        "Error",
        "Failed to add product to wishlists. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleClose = () => {
    setIsScraping(false);
    setProductData(null);
    setScrapeError(false);
    onClose();
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleClose}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.8}
      >
        <View style={styles.container}>
          {isScraping && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Extracting product details...</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </View>
          )}

          {scrapeError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to extract product details</Text>
              <Text style={styles.errorSubtext}>
                The product page might not be accessible or the format has changed.
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Hidden WebView for scraping */}
      {isScraping && sharedUrl && (
        <WebView
          javaScriptEnabled={true}
          injectedJavaScript={scrapeScript}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          style={styles.hiddenWebView}
          source={{ uri: sharedUrl }}
        />
      )}

      {/* Wishlist Selection Modal */}
      <WishlistSelectionModal
        ref={wishlistModalRef}
        onConfirm={handleWishlistConfirm}
        onCreateNewWishlist={onCreateNewWishlist}
        wishlists={wishlists}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  hiddenWebView: {
    position: "absolute",
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
  },
});

export default ShareHandler;
