import { wishlistWithItems } from "@/constants/types/types";
import React, { useCallback } from "react";
import { Text, TouchableHighlight, View } from "react-native";

type WishlistListItemProps = {
  wislistInfo: wishlistWithItems;
  index: number;
  router: any;
};

const WishlistListItem = ({
  wislistInfo,
  index,
  router,
}: WishlistListItemProps) => {
  console.log({ wislistInfo });
  const redirectToDetailPage = useCallback(() => {
    router.push({
      pathname: "/wishlistDetail",
      params: {
        id: wislistInfo.id,
      },
    });
  }, [router, wislistInfo.id]);
  return (
    <TouchableHighlight
      className="p-3 rounded-lg border relative"
      onPress={redirectToDetailPage}
    >
      <View className=" flex-row flex-1 gap-x-3">
        {/* Group Of 4 Images */}
        <View className=" size-16 rounded-lg border" />

        <View className=" flex-1">
          <Text className=" font-medium text-2xl">{wislistInfo.title}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default WishlistListItem;
