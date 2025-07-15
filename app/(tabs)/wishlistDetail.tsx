import NewItemPrompt, { TitleInputModalRef } from "@/components/newItemPrompt";
import { Wishlist, wishlistItem } from "@/constants/types/types";
import useParsedLocalParams from "@/hooks/useParsedLocalParams";
import { db } from "@/lib/db";
import { Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
        }} ref={newItemRef} onSubmit={() => console.log("called")} />
    </SafeAreaView>
  );
};

export default WishlistDetail;
