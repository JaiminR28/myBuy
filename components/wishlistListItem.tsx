import { wishlistItem, wishlistWithItems } from "@/constants/types/types";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";

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
  const redirectToDetailPage = useCallback(() => {
    router.push({
      pathname: "/wishlistDetail",
      params: {
        id: wislistInfo.id,
      },
    });
  }, [router, wislistInfo.id]);

  const wishlistItems: wishlistItem[] = Array.isArray(wislistInfo.wishlistItems)
  ? wislistInfo.wishlistItems
  : typeof wislistInfo.wishlistItems === "string"
    ? JSON.parse(wislistInfo.wishlistItems) as wishlistItem[]
    : [];

    console.log({wishlistItems});
  return (
    <TouchableHighlight
      className="p-3 rounded-lg border relative"
      onPress={redirectToDetailPage}
    >
      <View className=" flex-row flex-1 gap-x-3">
        {/* Group Of 4 Images */}
           {generateWishlistAvatar(wishlistItems, wislistInfo.title)}
        <View className=" flex-1">
          <Text className=" font-medium text-2xl">{wislistInfo.title}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};


const generateWishlistAvatar = (
  items: {
    imageUrl?: string | null;
    title?: string;
  }[] = [],
  parentTitle?: string
) => {
  // Filter out items with valid imageUrls and take first 4
  const validImages = items
    .filter(item => item?.imageUrl)
    .slice(0, 4);

  // If no items with images, return initials avatar
  if (validImages.length === 0) {
    const initials = parentTitle
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <View style={styles.initialsContainer}>
        <Text style={styles.initialsText}>{initials || 'WL'}</Text>
      </View>
    );
  }

  // For 1-4 images, create a collage
  return (
    <View style={styles.collageContainer}>
      {validImages.length === 1 ? (
        <Image 
          source={{ uri: validImages[0].imageUrl! }} 
          style={styles.fullImage}
        />
      ) : validImages.length === 2 ? (
        <>
          <Image 
            source={{ uri: validImages[0].imageUrl! }} 
            style={styles.halfImageTop}
          />
          <Image 
            source={{ uri: validImages[1].imageUrl! }} 
            style={styles.halfImageBottom}
          />
        </>
      ) : validImages.length === 3 ? (
        <>
          <Image 
            source={{ uri: validImages[0].imageUrl! }} 
            style={styles.twoThirdsImage}
          />
          <View style={styles.oneThirdColumn}>
            <Image 
              source={{ uri: validImages[1].imageUrl! }} 
              style={styles.oneThirdImage}
            />
            <Image 
              source={{ uri: validImages[2].imageUrl! }} 
              style={styles.oneThirdImage}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.halfColumn}>
            <Image 
              source={{ uri: validImages[0].imageUrl! }} 
              style={styles.quarterImage}
            />
            <Image 
              source={{ uri: validImages[1].imageUrl! }} 
              style={styles.quarterImage}
            />
          </View>
          <View style={styles.halfColumn}>
            <Image 
              source={{ uri: validImages[2].imageUrl! }} 
              style={styles.quarterImage}
            />
            <Image 
              source={{ uri: validImages[3].imageUrl! }} 
              style={styles.quarterImage}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  collageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  halfImageTop: {
    width: '100%',
    height: '50%',
  },
  halfImageBottom: {
    width: '100%',
    height: '50%',
    marginTop: 'auto',
  },
  twoThirdsImage: {
    width: '66%',
    height: '100%',
  },
  oneThirdColumn: {
    width: '34%',
    height: '100%',
  },
  oneThirdImage: {
    width: '100%',
    height: '50%',
  },
  halfColumn: {
    width: '50%',
    height: '100%',
  },
  quarterImage: {
    width: '100%',
    height: '50%',
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default WishlistListItem;


