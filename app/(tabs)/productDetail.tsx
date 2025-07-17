import { wishlistItem } from "@/constants/types/types";
import useParsedLocalParams from "@/hooks/useParsedLocalParams";
import { db } from "@/lib/db";
import { Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";

const ProductDetail = () => {
    const router = useRouter();
  const { productId = null } = useParsedLocalParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [productDetail, setProductDetail] = useState<null | wishlistItem | undefined>(null);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const productDetailsData = await db.getFirstAsync<wishlistItem | undefined>(
        `SELECT * FROM product_list WHERE id = ${productId}`
      );
      setProductDetail(productDetailsData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log({ error });
    }
  };

  const handleMarkAsBought = async () => {
    try {
      await db.runAsync(
        `UPDATE product_list SET isBought = 1 WHERE id = ${productId}`
      );
      fetchProductDetail(); // Refresh data
    } catch (error) {
      console.error("Error marking as bought:", error);
    }
  };

  const handleOpenProductLink = () => {
    if (productDetail?.url) {
      // Implement your link opening logic here
      // e.g., Linking.openURL(productDetail.url);
      Linking.openURL(productDetail.url);
      console.log("Opening:", productDetail.url);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
         <View className="flex-row items-center gap-x-4 px-4">
          <TouchableHighlight
            onPress={() => router.back()}
            className="p-2 border rounded-md bg-gray-100"
            underlayColor="#e5e5e5"
          >
            <Entypo size={24} name="chevron-left" />
          </TouchableHighlight>
        </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : productDetail ? (
        <View className="flex-1">
          {/* Scrollable content area */}
          <ScrollView className="flex-1 p-4">
            {/* Product Image */}
            <View className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
              {productDetail.imageUrl && (
                <Image 
                  source={{ uri: productDetail.imageUrl }} 
                  className="w-full h-80"
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Product Title */}
            <Text className="text-2xl font-bold mb-2 text-gray-900">
              {productDetail.title}
            </Text>

            {/* Price */}
            <View className="flex-row items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                ₹{productDetail.price?.toLocaleString('en-IN')}
              </Text>
              {productDetail.isBought ? (
                <View className="ml-3 px-2 py-1 bg-green-100 rounded-full">
                  <Text className="text-green-800 text-xs font-medium">
                    Purchased
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2 text-gray-900">
                Description
              </Text>
              <Text className="text-gray-700">
                {productDetail.description}
              </Text>
            </View>

            {/* Last Updated */}
            <Text className="text-sm text-gray-500 mb-4">
              Last updated: {productDetail.lastUpdated}
            </Text>
          </ScrollView>

          {/* Fixed Bottom Buttons */}
          <View className="flex-row p-4 border-t border-gray-200 bg-white">
            <TouchableOpacity 
              className="flex-1 mr-2 py-3 bg-blue-500 rounded-lg items-center justify-center"
              onPress={handleOpenProductLink}
            >
              <Text className="text-white font-medium">View Product</Text>
            </TouchableOpacity>
            
            {!productDetail.isBought && (
              <TouchableOpacity 
                className="flex-1 ml-2 py-3 bg-green-500 rounded-lg items-center justify-center"
                onPress={handleMarkAsBought}
              >
                <Text className="text-white font-medium">Mark as Bought</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Product not found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProductDetail;