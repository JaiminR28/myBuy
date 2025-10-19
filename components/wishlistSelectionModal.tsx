import { Wishlist } from "@/constants/types/types";
import { Feather } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";

export interface WishlistSelectionModalRef {
  showModal: (productData: ProductData, url: string) => void;
  hideModal: () => void;
}

export interface ProductData {
  title: string;
  price: number | null;
  description?: string | null;
  imageUrl?: string | null;
}

interface WishlistSelectionModalProps {
  onConfirm: (selectedWishlistIds: number[], productData: ProductData, url: string) => void;
  onCreateNewWishlist: () => void;
  wishlists: Wishlist[];
}

const WishlistSelectionModal = forwardRef<WishlistSelectionModalRef, WishlistSelectionModalProps>(
  function WishlistSelectionModal({ onConfirm, onCreateNewWishlist, wishlists }, ref) {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedWishlistIds, setSelectedWishlistIds] = useState<number[]>([]);
    const [productData, setProductData] = useState<ProductData | null>(null);
    const [url, setUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      showModal: (product: ProductData, productUrl: string) => {
        setProductData(product);
        setUrl(productUrl);
        setSelectedWishlistIds([]);
        setIsVisible(true);
      },
      hideModal: () => setIsVisible(false),
    }));

    const toggleWishlistSelection = (wishlistId: number) => {
      setSelectedWishlistIds(prev => 
        prev.includes(wishlistId)
          ? prev.filter(id => id !== wishlistId)
          : [...prev, wishlistId]
      );
    };

    const handleConfirm = async () => {
      if (selectedWishlistIds.length === 0) {
        Alert.alert("No Selection", "Please select at least one wishlist to add the product to.");
        return;
      }

      if (!productData) {
        Alert.alert("Error", "Product data is missing.");
        return;
      }

      setIsLoading(true);
      try {
        await onConfirm(selectedWishlistIds, productData, url);
        setIsVisible(false);
      } catch (error) {
        Alert.alert("Error", "Failed to add product to wishlists. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const handleCreateNewWishlist = () => {
      setIsVisible(false);
      onCreateNewWishlist();
    };

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        avoidKeyboard
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add to Wishlist</Text>
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Product Preview */}
          {productData && (
            <View style={styles.productPreview}>
              <View style={styles.productImageContainer}>
                {productData.imageUrl ? (
                  <Image
                    source={{ uri: productData.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Feather name="image" size={24} color="#ccc" />
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {productData.title}
                </Text>
                <Text style={styles.productPrice}>
                  {productData.price ? `₹${productData.price.toLocaleString('en-IN')}` : 'Price not available'}
                </Text>
              </View>
            </View>
          )}

          {/* Wishlist Selection */}
          <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Select Wishlists:</Text>
            
            {wishlists.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No wishlists found</Text>
                <TouchableOpacity
                  onPress={handleCreateNewWishlist}
                  style={styles.createButton}
                >
                  <Text style={styles.createButtonText}>Create New Wishlist</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.wishlistList} showsVerticalScrollIndicator={false}>
                {wishlists.map((wishlist) => (
                  <TouchableOpacity
                    key={wishlist.id}
                    style={[
                      styles.wishlistItem,
                      selectedWishlistIds.includes(wishlist.id) && styles.selectedWishlistItem
                    ]}
                    onPress={() => toggleWishlistSelection(wishlist.id)}
                  >
                    <View style={styles.wishlistInfo}>
                      <Text style={styles.wishlistTitle}>{wishlist.title}</Text>
                      <Text style={styles.wishlistType}>{wishlist.type}</Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      selectedWishlistIds.includes(wishlist.id) && styles.checkedBox
                    ]}>
                      {selectedWishlistIds.includes(wishlist.id) && (
                        <Feather name="check" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsVisible(false)}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (selectedWishlistIds.length === 0 || isLoading) && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={selectedWishlistIds.length === 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Add to {selectedWishlistIds.length} Wishlist{selectedWishlistIds.length !== 1 ? 's' : ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  productPreview: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "500",
  },
  selectionContainer: {
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  wishlistList: {
    maxHeight: 200,
  },
  wishlistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  selectedWishlistItem: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    borderWidth: 1,
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  wishlistType: {
    fontSize: 12,
    color: "#666",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dc3545",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#28a745",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

WishlistSelectionModal.displayName = "WishlistSelectionModal";

export default WishlistSelectionModal;
