import NewItemPrompt, { TitleInputModalRef } from "@/components/newItemPrompt";
import { ProductData, Wishlist, wishlistItem } from "@/constants/types/types";
import useParsedLocalParams from "@/hooks/useParsedLocalParams";
import { db } from "@/lib/db";
import { Entypo } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { SQLiteRunResult } from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableHighlight, View } from "react-native";

const WishlistDetail = () => {
  const router = useRouter();
  const newItemRef = useRef<TitleInputModalRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistData, setWishlistData] = useState<null | Wishlist>(null);
  const [itemsData, setItemsData] = useState<null | wishlistItem[]>([]);

  const { id = null } = useParsedLocalParams();

  console.log({ id });

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
      console.log("called addProductToList", productData, wishlistData);
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

  useEffect(() => {
    if (id) {
      handleGetWishlistData();
    }
  }, [handleGetWishlistData, id]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-x-4">
          <TouchableHighlight
            onPress={() => router.back()}
            className="p-2 border rounded-md bg-gray-100"
            underlayColor="#e5e5e5"
          >
            <Entypo size={24} name="chevron-left" />
          </TouchableHighlight>

          <Text className="font-bold text-2xl text-gray-900">
            {wishlistData?.title}
          </Text>
        </View>

        {/* Body */}
        <View className="flex-1 mt-4 rounded-lg p-4">
          <TouchableHighlight
            onPress={() => newItemRef.current?.showModal()}
            className="w-full bg-white rounded-md p-4 border border-gray-300 items-center"
            underlayColor="#f3f4f6"
          >
            <Text className="text-lg font-medium text-gray-800">Add New +</Text>
          </TouchableHighlight>

          <View className=" flex-1 p-4">
            {itemsData && typeof itemsData === "object" ? (
              <FlashList
                data={itemsData}
                renderItem={({ item }) => {
                  console.log({ item });
                  return (
                    <View>
                      <Text>{item.title}</Text>
                    </View>
                  );
                }}
                masonry
                ItemSeparatorComponent={() => <View className="my-2" />}
              />
            ) : null}
          </View>
        </View>
      </View>
      <NewItemPrompt
        headerText="Add New Item"
        inputPlaceholder="Paste the url of the new Item"
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
