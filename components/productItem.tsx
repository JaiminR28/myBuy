import { Feather } from "@expo/vector-icons";
import { Router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductItemProp {
  id: number; // PRIMARY KEY AUTOINCREMENT
  wishlist_id: number; // FK to wishlists.id
  url: string;
  imageUrl?: string | null; // nullable
  price?: number | null; // nullable
  isBought: 0 | 1; // CHECK(isBought IN (0,1))
  description?: string | null; // nullable
  broughtData?: string | null; // nullable
  lastUpdated?: string | null; // nullable
  title: string; // NOT NULL
}

interface RenderItemProps {
  item: ProductItemProp;
  route: Router;
}

const ProductItem: React.FC<RenderItemProps> = ({ item, route }) => {
  const handleOnClick = () => {
    route.push({
      pathname: "/productDetail",
      params: {
        productId: item.id,
      },
    });
  };
  return (
    <TouchableOpacity
      onPress={handleOnClick}
      style={styles.container}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {item?.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require("../assets/images/noImage_placeholder.png")}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        {item.isBought ? (
          <View style={styles.boughtBadge}>
            <Feather name="check" size={16} color="white" />
          </View>
        ) : null}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ₹{item?.price?.toLocaleString("en-IN")}
          </Text>
          {item.isBought ? <Text style={styles.boughtText}>Purchased</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  boughtBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#10B981",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginRight: 8,
  },
  boughtText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});

export default ProductItem;
