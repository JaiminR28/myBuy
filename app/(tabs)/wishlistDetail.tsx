import NewItemPrompt, { TitleInputModalRef } from "@/components/newItemPrompt";
import ProductItem from "@/components/productItem";
import { ProductData, Wishlist, wishlistItem } from "@/constants/types/types";
import useParsedLocalParams from "@/hooks/useParsedLocalParams";
import { db } from "@/lib/db";
import { Entypo } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import { SQLiteRunResult } from "expo-sqlite";
import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableHighlight, View } from "react-native";

const WishlistDetail = () => {
  const router = useRouter();
  const newItemRef = useRef<TitleInputModalRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistData, setWishlistData] = useState<null | Wishlist>(null);
  const [itemsData, setItemsData] = useState<null | wishlistItem[]>([]);

  const { id = null } = useParsedLocalParams();

  const totalPrice = itemsData
    ? itemsData?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
    : 0;

  const handleGetWishlistData = useCallback(async () => {
    const wishlist = db.getFirstSync<Wishlist>(
      `SELECT * FROM wishlists WHERE id = ${id}`
    );

    setWishlistData(wishlist);

    if (wishlist) {
      // get all the wishlist items here
      const wishlistItemsData = await db.getAllAsync<wishlistItem>(
        `SELECT * FROM product_list WHERE wishlist_id = ${wishlist.id}`
      );

      setItemsData(wishlistItemsData);
    }
  }, [id]);

  // Function to add a product to the database
  const addProductToList = async (
    url: string,
    productData: ProductData
  ): Promise<void> => {
    try {
      // Prepare the product data
      const { title, price, description = null, imageUrl = null } = productData;
      let insertResult: SQLiteRunResult | undefined;
      // Insert the product into the database
      await db.withTransactionAsync(async () => {
        insertResult = await db.runAsync(
          `INSERT INTO product_list (
          wishlist_id, 
          url, 
          imageUrl, 
          price, 
          description, 
          lastUpdated, 
          title
        ) VALUES (${wishlistData?.id}, '${url}', '${productData.imageUrl}', ${
            productData.price
          }, '${productData.description}', '${new Date().toDateString()}', '${
            productData.title
          }')`
        );
      });

      if (insertResult) {
        router.push({
          pathname: "/productDetail",
          params: {
            productId: insertResult.lastInsertRowId,
          },
        });
      }
    } catch (error) {
      console.error("Failed to add product to list:", error);
      throw error;
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        handleGetWishlistData();
      }
    }, [handleGetWishlistData, id])
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content */}
      <View className="flex-1 relative">
        {/* Header */}
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center gap-x-3">
            <TouchableHighlight
              onPress={() => router.back()}
              className="p-2 rounded-full bg-gray-100"
              underlayColor="#e5e5e5"
            >
              <Entypo size={20} name="chevron-left" color="#4b5563" />
            </TouchableHighlight>
            <Text className="font-bold text-xl text-gray-900 flex-1">
              {wishlistData?.title}
            </Text>
          </View>
        </View>

        {/* Body Content */}
        <View className="flex-1 p-4">
          {/* Add New Item Button */}
          <TouchableHighlight
            onPress={() => newItemRef.current?.showModal()}
            className="w-full bg-white rounded-lg p-4 border border-gray-200 items-center mb-4"
            underlayColor="#f3f4f6"
          >
            <View className="flex-row items-center gap-x-2">
              <Entypo name="plus" size={18} color="#3b82f6" />
              <Text className="text-base font-medium text-blue-500">
                Add New Item
              </Text>
            </View>
          </TouchableHighlight>

          {/* Products List */}
          {itemsData && itemsData.length > 0 ? (
            <FlashList
              data={itemsData}
              renderItem={({ item }) => (
                <ProductItem item={item} route={router} />
              )}
              estimatedItemSize={100}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 80 }} // Space for bottom bar
              ItemSeparatorComponent={() => <View className="h-4" />}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">
                No items in this wishlist yet
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Total Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <View className="flex-row justify-between items-center">
          <Text className="font-semibold text-gray-700">Total:</Text>
          <Text className="font-bold text-lg text-gray-900">
            ₹{totalPrice.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Add Item Modal */}
      <NewItemPrompt
        headerText="Add New Item"
        inputPlaceholder="Paste product URL here"
        submitText="Add Item"
        modalProps={{
          animationIn: "slideInUp",
          animationOut: "slideOutDown",
          backdropOpacity: 0.7,
        }}
        ref={newItemRef}
        onSubmit={addProductToList}
      />
    </SafeAreaView>
  );
};

export default WishlistDetail;
