import NewWishlistPrompt, {
  TitleInputModalRef,
} from "@/components/newWishlistPrompt";
import WishlistListItem from "@/components/wishlistListItem";
import { wishlistWithItems } from "@/constants/types/types";
import { db } from "@/lib/db";
import { Entypo } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { SQLiteRunResult } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";

type scrapeDataType = {
  price?: null | number,
  description?: string | null,
  title?: string | null, 
}

export default function HomeScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState<string>("");

  const [htmlContent, setHtmlContent] = useState<null | scrapeDataType>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [wishlists, setWishlists] = useState<wishlistWithItems[]>([]);

  const handleGetAllWishlists = useCallback(async () => {
    try {
      setIsLoading(true);
      const wishlistsData = await db.getAllAsync<wishlistWithItems>(`SELECT 
    wishlists.*,
    COALESCE(
        json_group_array(
            CASE 
                WHEN product_list.id IS NOT NULL THEN json_object(
                    'id', product_list.id,
                    'wishlist_id', product_list.wishlist_id,
                    'url', product_list.url,
                    'imageUrl', product_list.imageUrl,
                    'price', product_list.price,
                    'isBought', product_list.isBought,
                    'description', product_list.description,
                    'broughtData', product_list.broughtData,
                    'lastUpdated', product_list.lastUpdated,
                    'title', product_list.title
                )
                ELSE NULL
            END
        ), 
        '[]'
    ) AS wishlistItems
FROM 
    wishlists
LEFT JOIN 
    product_list ON wishlists.id = product_list.wishlist_id
GROUP BY 
    wishlists.id;
`);
      setWishlists(wishlistsData);
    } catch (error) {
      console.log("Error in handleGetAllWishlists : ", { error });
      showMessage({
        type: "danger",
        message: "Could not fetch your wishlist Data",
        description: "Check back later or try creating a new wishlist",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  // INIT
  useEffect(() => {
    handleGetAllWishlists();
  }, []);

  const handleGetProductDetails = () => {
    setSubmittedUrl(url);
  };

  const handleMessage = (event: any) => {
    const price = parseFloat(event.nativeEvent.data);
    console.log({ price, event });
    if (!isNaN(price)) {
      // onPriceFetched(price);
      // setPriceFound(true);
    }
    setIsLoading(false);
  };

  const titleModalRef = useRef<TitleInputModalRef>(null);

  // Handle form submission
  const handleTitleSubmit = async (title: string) => {
    try {
      // Use executeSqlAsync to get the insertion result
      let insertResult: SQLiteRunResult | undefined;

      await db.withTransactionAsync(async () => {
        insertResult = await db.runAsync(
          `INSERT INTO wishlists (title, createdAt, type) VALUES ('${title}', '${new Date().toISOString()}', 'Monthly')`
        );
      });

      // Tell TS that insertResult is definitely assigned here
      if (insertResult) {
        router.push({
          pathname: "/wishlistDetail",
          params: {
            id: insertResult.lastInsertRowId,
          },
        });
      } else {
        console.error("Insert failed, no result returned");
      }

      // Redirect to the new wishlist page with ID as parameter
      // router.push(`/wishlist/${insertedId}`);
    } catch (error) {
      console.error("Database error:", error);
      Alert.alert("Error", "Failed to create wishlist");
    }
  };

  const renderItem = useCallback(({ item, index }: any) => {
    return <WishlistListItem wislistInfo={item} index={index} router={router} />;
  }, [router]);

  return (
    <SafeAreaView className=" flex-1">
      {/* HEADER */}
      <View className=" p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-4xl font-semibold ">My Wishlist</Text>

          <TouchableHighlight
            underlayColor="#f1f3f5"
            onPress={() => titleModalRef.current?.showModal()}
            className="p-3 rounded-2xl items-center justify-center border mb-4 border-gray-700"
          >
            <Entypo name="plus" size={30} color="#343a40" />
          </TouchableHighlight>
        </View>
        {/* <Text>Paste the Url here</Text>
      <TextInput style={{borderWidth : 1, fontSize : 12, padding : 8}} onChangeText={setUrl} />
      <Button onPress={handleGetProductDetails} title="Submit" />
      <Button onPress={handleGetProductDetails} title="Reload" />

      {submittedUrl.length > 0 ? (
        <WebView
        renderError={() => <View><Text>Error</Text></View>}
          javaScriptEnabled={true}
          injectedJavaScript={scrapeScript}
          onMessage={handleMessage}
          style={{ height: 100, width: 100 }}
          source={{ uri: submittedUrl }}
        />
      ) : null} */}
      </View>
      <NewWishlistPrompt
        ref={titleModalRef}
        onSubmit={handleTitleSubmit}
        headerText="Create New Wishlist"
        inputPlaceholder="Enter wishlist title"
        submitText="Create Item"
        modalProps={{
          animationIn: "slideInUp",
          animationOut: "slideOutDown",
          backdropOpacity: 0.7,
        }}
      />

      <View className=" flex-1 p-4">
        <FlashList
          data={wishlists}
          renderItem={renderItem}
          masonry
          ItemSeparatorComponent={() => <View className="my-2" />}
        />
      </View>
    </SafeAreaView>
  );
}
